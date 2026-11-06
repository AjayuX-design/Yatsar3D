import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { COOKIES, readAccountConfig } from "@/lib/customer/config";
import { discover, exchangeCode, idTokenNonce, safeReturn } from "@/lib/customer/oauth";
import { originOf } from "@/lib/customer/origin";
import { setTokens } from "@/lib/customer/session";

/** Shopify sends the visitor back here with a one-time code. We check it is ours, trade it for tokens, and sign them in. */
export async function GET(request: NextRequest) {
  const origin = originOf(request);
  const fail = (why: string) => NextResponse.redirect(new URL(`/account?error=${why}`, origin));
  const q = request.nextUrl.searchParams;
  const jar = await cookies();

  const saved = (() => {
    try {
      return JSON.parse(jar.get(COOKIES.oauth)?.value ?? "") as { state: string; nonce: string; verifier: string; returnTo: string };
    } catch {
      return null;
    }
  })();
  jar.delete(COOKIES.oauth);

  if (q.get("error")) return fail("cancelled");
  const code = q.get("code");
  if (!saved || !code || q.get("state") !== saved.state) return fail("signin");

  const cfg = readAccountConfig(process.env);
  if (!cfg.ok) return fail("signin");

  try {
    const d = await discover(cfg.config.domain, cfg.config.shopId);
    const tokens = await exchangeCode(d, { clientId: cfg.config.clientId, redirectUri: `${origin}/account/callback`, code, verifier: saved.verifier });
    // If Shopify sent an id token, its nonce must be the one we made.
    if (tokens.idToken && idTokenNonce(tokens.idToken) !== saved.nonce) return fail("signin");
    await setTokens(tokens);
    return NextResponse.redirect(new URL(safeReturn(saved.returnTo), origin));
  } catch {
    return fail("signin");
  }
}
