import { readAccountConfig } from "./config";
import { discover, refreshTokens } from "./oauth";
import { readTokens, setTokens } from "./session";

/**
 * A working access token for server actions: the current one, or a fresh one if only the refresh
 * token is left. Null when the visitor is not signed in. Only call this from server actions or
 * route handlers, because refreshing writes cookies.
 */
export async function freshAccessToken(): Promise<string | null> {
  const t = await readTokens();
  if (t.access) return t.access;
  const cfg = readAccountConfig(process.env);
  if (!t.refresh || !cfg.ok) return null;
  try {
    const tokens = await refreshTokens(await discover(cfg.config.domain, cfg.config.shopId), { clientId: cfg.config.clientId, refreshToken: t.refresh });
    try {
      await setTokens(tokens);
    } catch {
      /* cookies cannot be written from a page render; the token is still good for this request */
    }
    return tokens.accessToken;
  } catch {
    return null;
  }
}
