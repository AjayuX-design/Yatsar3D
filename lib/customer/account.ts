import { connection } from "next/server";
import { customerGql, fetchCustomer, SessionExpired } from "./api";
import { ADDRESSES_QUERY, mapAddresses, type SavedAddress } from "./addresses";
import { demoMode, readAccountConfig } from "./config";
import { demoAddresses, demoCustomer } from "./demo";
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

export type AddressesResult =
  | Exclude<AccountResult, { state: "ok" }>
  | { state: "ok"; addresses: SavedAddress[]; demo: boolean };

/** The signed-in customer's saved addresses. Same sign-in states as getAccount. */
export async function getAddresses(): Promise<AddressesResult> {
  await connection();
  const t = await readTokens();
  if (demoMode() && t.demo) return { state: "ok", addresses: demoAddresses, demo: true };
  if (!readAccountConfig(process.env).ok) return demoMode() ? { state: "signed-out" } : { state: "unavailable" };
  if (!t.access) return t.refresh ? { state: "refresh" } : { state: "signed-out" };
  try {
    const data = await customerGql<{ customer: Parameters<typeof mapAddresses>[0] | null }>(t.access, ADDRESSES_QUERY);
    if (!data.customer) throw new SessionExpired();
    return { state: "ok", addresses: mapAddresses(data.customer), demo: false };
  } catch (e) {
    if (e instanceof SessionExpired) return t.refresh ? { state: "refresh" } : { state: "signed-out" };
    return { state: "error", message: "We could not load your addresses just now. Please try again in a moment." };
  }
}
