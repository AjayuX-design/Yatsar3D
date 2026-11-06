"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { customerGql, SessionExpired } from "./api";
import { ADDRESS_CREATE, ADDRESS_DELETE, ADDRESS_UPDATE, isAddressId, toInput, validateAddress, type AddressErrors } from "./addresses";
import { COOKIES, demoMode } from "./config";
import { freshAccessToken } from "./token";
import { readTokens } from "./session";

export type AddressState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; fieldErrors?: AddressErrors; values?: Record<string, string> };

type Payload = { userErrors?: { field?: string[] | null; message: string }[] };

const GENERIC = "We could not save that. Please try again.";

/** The checkout prefill is rebuilt from the address book, so any change forces a fresh sync. */
async function changed() {
  (await cookies()).delete(COOKIES.cartSync);
  revalidatePath("/account/addresses");
}

async function inDemo() {
  return demoMode() && (await readTokens()).demo;
}

/** Adds an address, or changes one when an id is sent. */
export async function saveAddress(_prev: AddressState, formData: FormData): Promise<AddressState> {
  const values = Object.fromEntries(["firstName", "lastName", "phone", "address1", "address2", "city", "state", "zip"].map((k) => [k, String(formData.get(k) ?? "")]));
  const checked = validateAddress(values);
  if (!checked.ok) return { status: "error", message: "Please check the highlighted fields.", fieldErrors: checked.errors, values };
  if (await inDemo()) return { status: "error", message: "Demo mode: addresses are not saved.", values };

  const id = String(formData.get("id") ?? "");
  const makeDefault = formData.get("makeDefault") === "on";
  if (id && !isAddressId(id)) return { status: "error", message: GENERIC, values };

  const token = await freshAccessToken();
  if (!token) return { status: "error", message: "Please sign in again.", values };
  try {
    const input = toInput(checked.value, checked.phoneE164);
    const data = id
      ? await customerGql<{ customerAddressUpdate: Payload }>(token, ADDRESS_UPDATE, { addressId: id, address: input, defaultAddress: makeDefault || null })
      : await customerGql<{ customerAddressCreate: Payload }>(token, ADDRESS_CREATE, { address: input, defaultAddress: makeDefault });
    const out = "customerAddressUpdate" in data ? data.customerAddressUpdate : data.customerAddressCreate;
    const err = out.userErrors?.[0];
    if (err) return { status: "error", message: err.message || GENERIC, values };
  } catch (e) {
    return { status: "error", message: e instanceof SessionExpired ? "Please sign in again." : GENERIC, values };
  }
  await changed();
  return { status: "ok" };
}

async function run(formData: FormData, query: string, extra: Record<string, unknown> = {}) {
  const id = String(formData.get("id") ?? "");
  if (!isAddressId(id) || (await inDemo())) return;
  const token = await freshAccessToken();
  if (!token) return;
  try {
    await customerGql(token, query, { addressId: id, ...extra });
  } catch {
    /* the page shows the unchanged list; nothing to add */
  }
  await changed();
}

export async function removeAddress(formData: FormData) {
  await run(formData, ADDRESS_DELETE);
}

export async function makeDefaultAddress(formData: FormData) {
  await run(formData, ADDRESS_UPDATE, { defaultAddress: true });
}
