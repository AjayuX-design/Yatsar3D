import { readShopifyConfig } from "./config";

/*
  The only place that talks to Shopify's Storefront API. Server-side only.
  It never throws. Every call returns { ok: true, data } or { ok: false, error },
  so each page can show a proper error or "not connected" state.
*/

export type ShopifyError =
  | { kind: "not-configured"; missing: string[] }
  | { kind: "network"; message: string }
  | { kind: "http"; status: number; message: string }
  | { kind: "graphql"; messages: string[] };

export type ShopifyResult<T> = { ok: true; data: T } | { ok: false; error: ShopifyError };

export function isShopifyConfigured() {
  return readShopifyConfig(process.env).ok;
}

export async function shopifyFetch<T>({
  query,
  variables,
  buyerIp,
}: {
  query: string;
  variables?: Record<string, unknown>;
  /** The shopper's IP, so Shopify rate-limits shoppers separately, not the server. */
  buyerIp?: string;
}): Promise<ShopifyResult<T>> {
  if (typeof window !== "undefined") {
    throw new Error("lib/shopify/client must only run on the server.");
  }

  const cfg = readShopifyConfig(process.env);
  if (!cfg.ok) return { ok: false, error: { kind: "not-configured", missing: cfg.missing } };
  const { domain, privateToken, apiVersion } = cfg.config;

  let res: Response;
  try {
    res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": privateToken,
        ...(buyerIp ? { "Shopify-Storefront-Buyer-IP": buyerIp } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (e) {
    return { ok: false, error: { kind: "network", message: e instanceof Error ? e.message : "Network error" } };
  }

  if (!res.ok) {
    return { ok: false, error: { kind: "http", status: res.status, message: res.statusText } };
  }

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    return { ok: false, error: { kind: "graphql", messages: json.errors.map((e) => e.message) } };
  }
  return { ok: true, data: json.data as T };
}
