import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { COOKIES, readAccountConfig } from "@/lib/customer/config";
import { discover } from "@/lib/customer/oauth";
import { originOf } from "@/lib/customer/origin";
import { clearTokens, readTokens } from "@/lib/customer/session";

/** Signs out here and on Shopify. POST only, so a link on another site cannot sign anyone out. */
export async function POST(request: NextRequest) {
  const origin = originOf(request);
  const { id } = await readTokens();
  await clearTokens();
  // The cart carries this customer's email and address, so the next person on this browser starts with a fresh one.
  const jar = await cookies();
  jar.delete("yatsar_cart");
  jar.delete(COOKIES.cartSync);
  const cfg = readAccountConfig(process.env);
  if (cfg.ok && id) {
    try {
      const d = await discover(cfg.config.domain, cfg.config.shopId);
      if (d.end_session_endpoint) {
        const u = new URL(d.end_session_endpoint);
        u.search = new URLSearchParams({ id_token_hint: id, post_logout_redirect_uri: origin }).toString();
        return NextResponse.redirect(u, 303);
      }
    } catch {
      /* fall through: signed out here at least */
    }
  }
  return NextResponse.redirect(new URL("/", origin), 303);
}
