/*
  Reads the Shopify settings from environment variables. Pure, so it can be
  checked without a network. Server-side only: none of these names start with
  NEXT_PUBLIC_, so Next.js never sends them to the browser.
*/

export type ShopifyConfig = {
  /** For example your-store.myshopify.com. No https://, no slash. */
  domain: string;
  /** Private Storefront API token. Never log it, never expose it. */
  privateToken: string;
  apiVersion: string;
};

export type ConfigResult =
  | { ok: true; config: ShopifyConfig }
  | { ok: false; missing: string[] };

// Shopify releases a new API version every quarter. Set SHOPIFY_API_VERSION to
// the newest stable one from Shopify's docs.
const DEFAULT_API_VERSION = "2026-07";

export function normaliseDomain(raw: string) {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
}

export function readShopifyConfig(env: Record<string, string | undefined>): ConfigResult {
  const domain = normaliseDomain(env.SHOPIFY_STORE_DOMAIN ?? "");
  const privateToken = (env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "").trim();
  const missing = [
    !domain && "SHOPIFY_STORE_DOMAIN",
    !privateToken && "SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
  ].filter((x): x is string => !!x);
  if (missing.length) return { ok: false, missing };
  return {
    ok: true,
    config: {
      domain,
      privateToken,
      apiVersion: (env.SHOPIFY_API_VERSION ?? "").trim() || DEFAULT_API_VERSION,
    },
  };
}
