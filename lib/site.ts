/** Absolute address of this site, for links inside WhatsApp messages. */
export function siteUrl() {
  const set = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (set) return set;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

/**
 * One switch for search engines. Until ALLOW_INDEXING=true is set, every page says noindex
 * (pages that set their own robots keep it). Set it on Vercel when the shop is ready to launch.
 */
export const indexingOn = () => process.env.ALLOW_INDEXING === "true";
