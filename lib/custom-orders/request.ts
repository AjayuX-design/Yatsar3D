/*
  Custom order requests: validation, request numbers and the email text.
  Pure, so it can be checked without a network. Everything a shopper types is
  treated as untrusted: trimmed, length-limited, and escaped before it goes into
  an email.
*/

export const REQUEST_TYPES = [
  { key: "drawers", label: "Custom-fit drawers" },
  { key: "personalised", label: "Personalisation" },
  { key: "business", label: "Business order" },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]["key"];

export type RequestFields = {
  type: RequestType;
  name: string;
  phone: string;
  email: string;
  city: string;
  details: string;
  size: string;
  quantity: string;
};

export type FieldErrors = Partial<Record<keyof RequestFields, string>>;

export const MAX_PHOTOS = 3;
/** Each photo is shrunk in the browser before upload. This is the server's ceiling. */
export const MAX_PHOTO_BYTES = 1_300_000;
export const MAX_TOTAL_PHOTO_BYTES = 3_700_000;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Reads the raw form values into clean strings. Anything unexpected becomes empty. */
export function readFields(get: (name: string) => unknown): RequestFields {
  const type = REQUEST_TYPES.find((t) => t.key === get("type"))?.key ?? ("" as RequestType);
  return {
    type,
    name: text(get("name"), 80),
    phone: text(get("phone"), 20),
    email: text(get("email"), 120),
    city: text(get("city"), 80),
    details: text(get("details"), 2000),
    size: text(get("size"), 200),
    quantity: text(get("quantity"), 40),
  };
}

export function validateFields(f: RequestFields): FieldErrors {
  const e: FieldErrors = {};
  if (!f.type) e.type = "Choose what you need.";
  if (f.name.length < 2) e.name = "Enter your name.";
  const digits = f.phone.replace(/[\s()+-]/g, "");
  if (!/^\d{10,15}$/.test(digits)) e.phone = "Enter a phone number with 10 to 15 digits.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = "Check the email address.";
  if (f.city.length < 2) e.city = "Enter your city.";
  if (f.details.length < 10) e.details = "Tell us a little more, at least a sentence.";
  return e;
}

// No 0, O, 1, I or L, so a number read out loud or copied by hand stays clear.
const ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Short request number like YC-7K4M2. `random` gives bytes, so tests can pass fixed ones. */
export function newRequestId(random: (n: number) => Uint8Array) {
  const bytes = random(5);
  return "YC-" + Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const typeLabel = (t: RequestType) => REQUEST_TYPES.find((x) => x.key === t)?.label ?? t;

/** The phone number as digits for a wa.me link. A 10 digit Indian number gets 91 added. */
export const whatsappDigits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
};

export function buildEmail(id: string, f: RequestFields, photoCount: number) {
  const rows: Array<[string, string]> = [
    ["Request", id],
    ["Type", typeLabel(f.type)],
    ["Name", f.name],
    ["Phone", f.phone],
    ["Email", f.email || "Not given"],
    ["City", f.city],
    ["Quantity", f.quantity || "Not given"],
    ["Size", f.size || "Not given"],
    ["Photos", photoCount ? `${photoCount} attached` : "None"],
  ];
  const subject = `[${id}] ${typeLabel(f.type)} from ${f.name} (${f.city})`;
  const wa = `https://wa.me/${whatsappDigits(f.phone)}`;
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#171717">` +
    `<h2 style="margin:0 0 12px">New custom order request ${escapeHtml(id)}</h2>` +
    `<table style="border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#5b5b5b">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
      )
      .join("") +
    `</table>` +
    `<h3 style="margin:20px 0 6px">Details</h3>` +
    `<p style="white-space:pre-wrap;margin:0">${escapeHtml(f.details)}</p>` +
    `<p style="margin:20px 0 0"><a href="${wa}">Reply on WhatsApp</a></p>` +
    `</div>`;
  const plain =
    `New custom order request ${id}\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nDetails:\n${f.details}\n\nReply on WhatsApp: ${wa}\n`;
  return { subject, html, text: plain };
}

/** Looks at the first bytes, so a file called photo.jpg that is not an image is refused. */
export function imageKind(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (
    bytes.length > 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "webp";
  return null;
}

export type EmailConfig = { apiKey: string; to: string; from: string };

/** Reads the email settings. Missing settings mean the form stays hidden. */
export function readEmailConfig(env: Record<string, string | undefined>): { ok: true; config: EmailConfig } | { ok: false; missing: string[] } {
  const apiKey = (env.RESEND_API_KEY ?? "").trim();
  const to = (env.CUSTOM_ORDER_TO_EMAIL ?? "").trim();
  const missing = [!apiKey && "RESEND_API_KEY", !to && "CUSTOM_ORDER_TO_EMAIL"].filter((x): x is string => !!x);
  if (missing.length) return { ok: false, missing };
  // onboarding@resend.dev works until the domain is verified in Resend.
  const from = (env.CUSTOM_ORDER_FROM_EMAIL ?? "").trim() || "Yatsar 3D <onboarding@resend.dev>";
  return { ok: true, config: { apiKey, to, from } };
}
