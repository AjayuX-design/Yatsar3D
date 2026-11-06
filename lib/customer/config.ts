/*
  Customer accounts use Shopify's Customer Account API. Customers sign in on
  Shopify's own page with their email and a one-time code (no password for us to
  keep safe), then come back here signed in. The site is a "public client": it
  uses PKCE, so there is no secret to store.

  Needs: SHOPIFY_STORE_DOMAIN (already set) and SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID.
  Also set SHOPIFY_SHOP_ID (shown in the Application endpoints of the Customer Account API page).
*/

export type AccountConfig = { domain: string; clientId: string; apiVersion: string; /** Shopify's numeric shop id. When set, sign-in addresses are built from it, with no lookup. */ shopId?: string };

export function readAccountConfig(
  env: Record<string, string | undefined>,
): { ok: true; config: AccountConfig } | { ok: false; missing: string[] } {
  const domain = (env.SHOPIFY_STORE_DOMAIN ?? "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
  const clientId = (env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ?? "").trim();
  const missing = [!domain && "SHOPIFY_STORE_DOMAIN", !clientId && "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID"].filter((x): x is string => !!x);
  if (missing.length) return { ok: false, missing };
  const shopId = (env.SHOPIFY_SHOP_ID ?? "").trim().replace(/\D/g, "") || undefined;
  return { ok: true, config: { domain, clientId, shopId, apiVersion: (env.CUSTOMER_ACCOUNT_API_VERSION ?? "").trim() || "2026-10" } };
}

/** Local development only: a pretend signed-in customer with sample orders, to see the design without Shopify keys. */
export const demoMode = () => process.env.NODE_ENV !== "production" && process.env.CUSTOMER_ACCOUNT_DEMO === "true";

/** True when the account area can work: real keys, or the local demo. */
export const accountEnabled = () => demoMode() || readAccountConfig(process.env).ok;

export const COOKIES = {
  access: "yatsar_cat",
  refresh: "yatsar_crt",
  id: "yatsar_cid",
  oauth: "yatsar_oauth",
  demo: "yatsar_demo",
} as const;
