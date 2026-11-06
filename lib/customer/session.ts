import { cookies } from "next/headers";
import { COOKIES } from "./config";
import type { Tokens } from "./oauth";

const base = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" });
const DAY = 24 * 60 * 60;

/** Saves the sign-in cookies. They are httpOnly, so page scripts can never read them. */
export async function setTokens(t: Tokens) {
  const jar = await cookies();
  jar.set(COOKIES.access, t.accessToken, { ...base(), maxAge: Math.max(60, t.expiresIn - 60) });
  if (t.refreshToken) jar.set(COOKIES.refresh, t.refreshToken, { ...base(), maxAge: 30 * DAY });
  if (t.idToken) jar.set(COOKIES.id, t.idToken, { ...base(), maxAge: 30 * DAY });
}

export async function clearTokens() {
  const jar = await cookies();
  for (const name of [COOKIES.access, COOKIES.refresh, COOKIES.id, COOKIES.demo]) jar.delete(name);
}

export async function readTokens() {
  const jar = await cookies();
  return {
    access: jar.get(COOKIES.access)?.value,
    refresh: jar.get(COOKIES.refresh)?.value,
    id: jar.get(COOKIES.id)?.value,
    demo: jar.get(COOKIES.demo)?.value === "1",
  };
}
