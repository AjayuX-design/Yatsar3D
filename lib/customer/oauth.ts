import { createHash, randomBytes } from "node:crypto";

/* The sign-in conversation with Shopify (OAuth 2.0 with PKCE). Server-side only. */

const b64url = (b: Buffer) => b.toString("base64url");

/** PKCE: a random secret kept in a cookie, and its SHA-256 sent to Shopify. */
export function newPkce() {
  const verifier = b64url(randomBytes(32));
  return { verifier, challenge: b64url(createHash("sha256").update(verifier).digest()) };
}
export const randomToken = () => b64url(randomBytes(16));

type Discovery = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint?: string };

// The addresses rarely change, so one lookup per warm server is enough.
const memo = new Map<string, { at: number; value: Discovery }>();

/** The addresses Shopify shows under "Application endpoints", built from the shop id. */
export const endpointsFor = (shopId: string): Discovery => ({
  authorization_endpoint: `https://shopify.com/authentication/${shopId}/oauth/authorize`,
  token_endpoint: `https://shopify.com/authentication/${shopId}/oauth/token`,
  end_session_endpoint: `https://shopify.com/authentication/${shopId}/logout`,
});

export async function discover(domain: string, shopId?: string): Promise<Discovery> {
  if (shopId) return endpointsFor(shopId);
  const hit = memo.get(domain);
  if (hit && Date.now() - hit.at < 60 * 60 * 1000) return hit.value;
  const res = await fetch(`https://${domain}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sign-in setup could not be read (${res.status})`);
  const value = (await res.json()) as Discovery;
  if (!value.authorization_endpoint || !value.token_endpoint) throw new Error("Sign-in setup is incomplete");
  memo.set(domain, { at: Date.now(), value });
  return value;
}

export function authorizeUrl(
  d: Discovery,
  p: { clientId: string; redirectUri: string; state: string; nonce: string; challenge: string },
) {
  const u = new URL(d.authorization_endpoint);
  u.search = new URLSearchParams({
    scope: "openid email customer-account-api:full",
    client_id: p.clientId,
    response_type: "code",
    redirect_uri: p.redirectUri,
    state: p.state,
    nonce: p.nonce,
    code_challenge: p.challenge,
    code_challenge_method: "S256",
  }).toString();
  return u.toString();
}

export type Tokens = { accessToken: string; expiresIn: number; idToken?: string; refreshToken?: string };

async function tokenRequest(d: Discovery, body: Record<string, string>): Promise<Tokens> {
  const res = await fetch(d.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || typeof json.access_token !== "string") throw new Error(String(json.error ?? `Token request failed (${res.status})`));
  return {
    accessToken: json.access_token,
    expiresIn: Number(json.expires_in) || 3600,
    idToken: typeof json.id_token === "string" ? json.id_token : undefined,
    refreshToken: typeof json.refresh_token === "string" ? json.refresh_token : undefined,
  };
}

export const exchangeCode = (d: Discovery, p: { clientId: string; redirectUri: string; code: string; verifier: string }) =>
  tokenRequest(d, { grant_type: "authorization_code", client_id: p.clientId, redirect_uri: p.redirectUri, code: p.code, code_verifier: p.verifier });

export const refreshTokens = (d: Discovery, p: { clientId: string; refreshToken: string }) =>
  tokenRequest(d, { grant_type: "refresh_token", client_id: p.clientId, refresh_token: p.refreshToken });

/** The nonce Shopify put inside the id token, to confirm this reply belongs to our request. */
export function idTokenNonce(idToken: string | undefined) {
  try {
    const payload = JSON.parse(Buffer.from(idToken!.split(".")[1], "base64url").toString("utf8")) as { nonce?: string };
    return payload.nonce;
  } catch {
    return undefined;
  }
}

/** Only paths inside /account are allowed as a "go back to" address, so a link cannot send people elsewhere. */
export const safeReturn = (v: string | null | undefined) => (v && /^\/account(\/[\w-]*)*$/.test(v) ? v : "/account");
