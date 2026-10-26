"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
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
  Receives a custom order request and emails it through the shop mailbox (SMTP), with the photos attached.
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
// slows a casual spammer but is not a hard wall. the mail server's own sending limits are the backstop.
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

  try {
    const { host, port, user, password, to, from } = cfg.config;
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await transport.sendMail({
      from,
      to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(fields.email ? { replyTo: fields.email } : {}),
      attachments: attachments.map((a) => ({ filename: a.filename, content: a.content, encoding: "base64" })),
    });
  } catch (e) {
    // Error codes only (for example EAUTH for a wrong password). Never the password or the message body.
    const err = e as { code?: string; responseCode?: number };
    console.error("[custom-order] email failed", err.code ?? "unknown", err.responseCode ?? "");
    return { status: "error", message: GENERIC, values: fields };
  }
  return { status: "ok", id };
}
