import { connection } from "next/server";
import { fetchCustomer, SessionExpired } from "./api";
import { demoMode, readAccountConfig } from "./config";
import { demoCustomer } from "./demo";
import type { CustomerView } from "./orders";
import { readTokens } from "./session";

export type AccountResult =
  | { state: "unavailable" }
  | { state: "signed-out" }
  /** The short-lived token ran out but a refresh token exists: send the visitor to /account/refresh. */
  | { state: "refresh" }
  | { state: "error"; message: string }
  | { state: "ok"; customer: CustomerView };

/** Who is signed in, and their orders. Runs per request, never while prerendering. */
export async function getAccount(): Promise<AccountResult> {
  await connection();
  const t = await readTokens();
  if (demoMode() && t.demo) return { state: "ok", customer: demoCustomer };
  if (!readAccountConfig(process.env).ok) return demoMode() ? { state: "signed-out" } : { state: "unavailable" };
  if (!t.access) return t.refresh ? { state: "refresh" } : { state: "signed-out" };
  try {
    return { state: "ok", customer: await fetchCustomer(t.access) };
  } catch (e) {
    if (e instanceof SessionExpired) return t.refresh ? { state: "refresh" } : { state: "signed-out" };
    return { state: "error", message: "We could not load your orders just now. Please try again in a moment." };
  }
}
