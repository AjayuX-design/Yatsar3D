/** Absolute address of this site, for links inside WhatsApp messages. */
export function siteUrl() {
  const set = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (set) return set;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}
