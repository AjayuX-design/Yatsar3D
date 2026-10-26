"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  MAX_TOTAL_PHOTO_BYTES,
  buildEmail,
  imageKind,
  newRequestId,
  readEmailConfig,
  readFields,
  validateFields,
  type FieldErrors,
  type RequestFields,
} from "@/lib/custom-orders/request";

/*
  Receives a custom order request and emails it, with the photos attached.
  Nothing is stored: the email is the record, so every request arrives complete
  and under one request number. Runs on the server only; the email key never
  reaches the browser.
*/

export type CustomOrderState =
  | { status: "idle" }
  | { status: "ok"; id: string }
  | { status: "error"; message: string; fieldErrors?: FieldErrors; values?: Partial<RequestFields> };

const GENERIC = "We could not send your request. Please try again, or message us on WhatsApp.";

// Best-effort limit per visitor. Serverless instances do not share memory, so this
// slows a casual spammer but is not a hard wall. Resend's own limits are the backstop.
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < window);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 500) recent.clear();
  return hits.length > 5;
}

/** True when the form can send. In local development, a dry run lets the form be tested without keys. */
export async function isCustomOrderFormReady() {
  return dryRun() || readEmailConfig(process.env).ok;
}
const dryRun = () => process.env.NODE_ENV !== "production" && process.env.CUSTOM_ORDER_DRY_RUN === "true";

export async function submitCustomOrder(_prev: CustomOrderState, formData: FormData): Promise<CustomOrderState> {
  // Hidden trap field. People never see it, bots fill it. Pretend it worked.
  if (String(formData.get("website") ?? "") !== "") return { status: "ok", id: newRequestId((n) => randomBytes(n)) };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooMany(ip)) return { status: "error", message: "You have sent a few requests already. Please wait a few minutes, or message us on WhatsApp." };

  const fields = readFields((n) => formData.get(n));
  const fieldErrors = validateFields(fields);
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values: fields };
  }

  // Photos: count, size, and real image bytes. Anything else is dropped with a clear message.
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_PHOTOS) return { status: "error", message: `Please add up to ${MAX_PHOTOS} photos.`, values: fields };
  const attachments: Array<{ filename: string; content: string }> = [];
  let total = 0;
  for (const [i, file] of files.entries()) {
    total += file.size;
    if (file.size > MAX_PHOTO_BYTES || total > MAX_TOTAL_PHOTO_BYTES) {
      return { status: "error", message: "Those photos are too large. Try fewer or smaller ones.", values: fields };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = imageKind(bytes);
    if (!kind) return { status: "error", message: "One of the files is not a photo we can use. Use JPG, PNG or WebP.", values: fields };
    attachments.push({ filename: `photo-${i + 1}.${kind === "jpeg" ? "jpg" : kind}`, content: Buffer.from(bytes).toString("base64") });
  }

  const id = newRequestId((n) => randomBytes(n));
  const mail = buildEmail(id, fields, attachments.length);

  if (dryRun()) {
    console.log(`[custom-order] dry run ${id}`, JSON.stringify({ subject: mail.subject, photos: attachments.length }));
    return { status: "ok", id };
  }

  const cfg = readEmailConfig(process.env);
  if (!cfg.ok) {
    console.error("[custom-order] email not configured, missing", cfg.missing.join(", "));
    return { status: "error", message: GENERIC, values: fields };
  }

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: cfg.config.from,
        to: [cfg.config.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(fields.email ? { reply_to: fields.email } : {}),
        ...(attachments.length ? { attachments } : {}),
      }),
    });
  } catch (e) {
    console.error("[custom-order] email network error", e instanceof Error ? e.message : "unknown");
    return { status: "error", message: GENERIC, values: fields };
  }
  if (!res.ok) {
    // Status only. The response can echo request details.
    console.error("[custom-order] email failed", res.status);
    return { status: "error", message: GENERIC, values: fields };
  }
  return { status: "ok", id };
}
