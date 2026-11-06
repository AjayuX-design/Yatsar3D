import type { NextRequest } from "next/server";

/**
 * The public address of this site as the visitor sees it. Shopify only accepts the
 * callback address registered in its settings, so it must match exactly.
 */
export function originOf(request: NextRequest) {
  const set = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (set && process.env.NODE_ENV === "production") return set;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}
