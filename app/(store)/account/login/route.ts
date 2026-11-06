import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { COOKIES, demoMode, readAccountConfig } from "@/lib/customer/config";
import { authorizeUrl, discover, newPkce, randomToken, safeReturn } from "@/lib/customer/oauth";
import { originOf } from "@/lib/customer/origin";

/** Starts sign-in: remembers a secret in a short cookie, then sends the visitor to Shopify's sign-in page. */
export async function GET(request: NextRequest) {
  const origin = originOf(request);
  const returnTo = safeReturn(request.nextUrl.searchParams.get("next"));
  const jar = await cookies();

  const cfg = readAccountConfig(process.env);
  if (!cfg.ok) {
    if (demoMode()) {
      jar.set(COOKIES.demo, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
      return NextResponse.redirect(new URL(returnTo, origin));
    }
    return NextResponse.redirect(new URL("/account", origin));
  }

  try {
    const d = await discover(cfg.config.domain, cfg.config.shopId);
    const { verifier, challenge } = newPkce();
    const state = randomToken();
    const nonce = randomToken();
    jar.set(COOKIES.oauth, JSON.stringify({ state, nonce, verifier, returnTo }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // must survive the trip to Shopify and back
      path: "/account",
      maxAge: 10 * 60,
    });
    return NextResponse.redirect(authorizeUrl(d, { clientId: cfg.config.clientId, redirectUri: `${origin}/account/callback`, state, nonce, challenge }));
  } catch {
    return NextResponse.redirect(new URL("/account?error=signin", origin));
  }
}
