import { NextResponse, type NextRequest } from "next/server";
import { readAccountConfig } from "@/lib/customer/config";
import { discover, refreshTokens, safeReturn } from "@/lib/customer/oauth";
import { originOf } from "@/lib/customer/origin";
import { clearTokens, readTokens, setTokens } from "@/lib/customer/session";

/** Quietly gets a fresh sign-in token when the old one has run out, then returns to the page the visitor wanted. */
export async function GET(request: NextRequest) {
  const origin = originOf(request);
  const back = safeReturn(request.nextUrl.searchParams.get("next"));
  const { refresh } = await readTokens();
  const cfg = readAccountConfig(process.env);
  if (!refresh || !cfg.ok) {
    await clearTokens();
    return NextResponse.redirect(new URL("/account", origin));
  }
  try {
    const tokens = await refreshTokens(await discover(cfg.config.domain, cfg.config.shopId), { clientId: cfg.config.clientId, refreshToken: refresh });
    await setTokens(tokens);
    // "refreshed" stops a loop if the new token is refused as well.
    return NextResponse.redirect(new URL(`${back}${back.includes("?") ? "&" : "?"}refreshed=1`, origin));
  } catch {
    await clearTokens();
    return NextResponse.redirect(new URL("/account", origin));
  }
}
