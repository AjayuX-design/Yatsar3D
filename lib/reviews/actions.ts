"use server";

import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { readEmailConfig, escapeHtml } from "@/lib/custom-orders/request";
import { COOKIE, isAdmin, makeToken, passwordMatches } from "./admin";
import { getReview, removeReview, saveReview, storeKind } from "./store";
import type { Review } from "./types";
import { LIMITS, validateReview, type ReviewErrors } from "./validate";

export type ReviewState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; fieldErrors?: ReviewErrors; values?: Record<string, string> };

// Best-effort limit per visitor (see the custom order form for the same trade-off).
const recent = new Map<string, number[]>();
function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 500) recent.clear();
  return hits.length > max;
}
const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

/** A customer review. It goes live at once; the owner can hide or delete it later. */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const handle = String(formData.get("handle") ?? "").trim();
  // Hidden trap field. People never see it, bots fill it. Pretend it worked.
  if (String(formData.get("website") ?? "") !== "") return { status: "ok" };
  if (!handle || storeKind() === "none") return { status: "error", message: "Reviews are not available right now. Please try again later." };

  const values = Object.fromEntries(["name", "rating", "title", "body"].map((k) => [k, String(formData.get(k) ?? "")]));
  const checked = validateReview(values);
  if (!checked.ok) return { status: "error", message: "Please check the highlighted fields.", fieldErrors: checked.errors, values };

  if (tooMany(`review:${await clientIp()}`, 4, 60 * 60 * 1000)) {
    return { status: "error", message: "You have sent a few reviews already. Please try again in a while.", values };
  }

  const review: Review = {
    id: randomBytes(8).toString("hex"),
    handle,
    ...checked.value,
    createdAt: new Date().toISOString(),
    status: "live",
  };
  try {
    await saveReview(review);
  } catch {
    return { status: "error", message: "We could not save your review. Please try again.", values };
  }
  revalidatePath(`/products/${handle}`);
  void notifyOwner(review);
  return { status: "ok" };
}

/** Tells the owner by email. Best effort: a mail problem never blocks the review. */
async function notifyOwner(r: Review) {
  const email = readEmailConfig(process.env);
  if (!email.ok) return;
  const c = email.config;
  const site = process.env.SITE_URL ?? "https://yatsar3d.com";
  try {
    await nodemailer
      .createTransport({ host: c.host, port: c.port, secure: c.port === 465, auth: { user: c.user, pass: c.password } })
      .sendMail({
        from: c.from,
        to: process.env.REVIEW_NOTIFY_TO || c.to,
        subject: `New ${r.rating}-star review on ${r.handle}`,
        text: `${r.name} gave ${r.rating} out of 5 stars.\n\n${r.title ? r.title + "\n" : ""}${r.body}\n\nReply or hide it: ${site}/admin/reviews`,
        html: `<p><b>${escapeHtml(r.name)}</b> gave <b>${r.rating} out of 5</b> stars on <code>${escapeHtml(r.handle)}</code>.</p>${r.title ? `<p><b>${escapeHtml(r.title)}</b></p>` : ""}<p>${escapeHtml(r.body).replace(/\n/g, "<br>")}</p><p><a href="${site}/admin/reviews">Reply or hide it</a></p>`,
      });
  } catch {
    /* ignore */
  }
}

/* ---------- Owner actions ---------- */

export type LoginState = { status: "idle" } | { status: "error"; message: string };

export async function adminLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (tooMany(`login:${await clientIp()}`, 8, 15 * 60 * 1000)) return { status: "error", message: "Too many tries. Please wait a few minutes." };
  if (!passwordMatches(String(formData.get("password") ?? ""))) return { status: "error", message: "That password is not right." };
  const token = makeToken();
  if (!token) return { status: "error", message: "Admin sign-in is not set up yet." };
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 12 * 60 * 60 });
  revalidatePath("/admin/reviews");
  return { status: "idle" };
}

export async function adminLogout() {
  (await cookies()).delete(COOKIE);
  revalidatePath("/admin/reviews");
}

async function target(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Not signed in");
  const r = await getReview(String(formData.get("id") ?? ""));
  if (!r) throw new Error("Review not found");
  return r;
}
const refresh = (r: Review) => {
  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${r.handle}`);
};

/** Saves the owner's public reply. An empty reply removes it. */
export async function replyToReview(formData: FormData) {
  const r = await target(formData);
  const text = String(formData.get("reply") ?? "").trim().slice(0, LIMITS.replyMax);
  await saveReview({ ...r, reply: text ? { text, at: new Date().toISOString() } : undefined });
  refresh(r);
}

export async function setReviewStatus(formData: FormData) {
  const r = await target(formData);
  await saveReview({ ...r, status: formData.get("status") === "hidden" ? "hidden" : "live" });
  refresh(r);
}

export async function deleteReview(formData: FormData) {
  const r = await target(formData);
  await removeReview(r);
  refresh(r);
}
