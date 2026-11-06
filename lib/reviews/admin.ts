import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/*
  Owner sign-in for /admin/reviews. One password (ADMIN_PASSWORD in Vercel), no accounts.
  A signed cookie lasts 12 hours. In local development only, the password is "admin" when
  none is set, so the page can be tried. In production with no password set, the page stays locked.
*/

export const COOKIE = "yatsar_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

export const adminPassword = () =>
  process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin" : undefined);

const sign = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function passwordMatches(input: string) {
  const pw = adminPassword();
  if (!pw) return false;
  // Hash both sides so the comparison always has equal lengths.
  return same(sign(input, "check"), sign(pw, "check"));
}

export function makeToken(now = Date.now()) {
  const pw = adminPassword();
  if (!pw) return null;
  const exp = String(now + TTL_MS);
  return `${exp}.${sign(exp, pw)}`;
}

export function tokenValid(token: string | undefined, now = Date.now()) {
  const pw = adminPassword();
  if (!pw || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < now) return false;
  return same(sig, sign(exp, pw));
}

export async function isAdmin() {
  // The check reads the clock, so it must run per request, never while prerendering.
  await connection();
  return tokenValid((await cookies()).get(COOKIE)?.value);
}
