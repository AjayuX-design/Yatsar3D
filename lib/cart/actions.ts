"use server";

import { cookies, headers } from "next/headers";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  CART_CREATE,
  CART_DISCOUNT_UPDATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_QUERY,
  mapCart,
  type CartView,
  type ShopifyCart,
} from "@/lib/shopify/cart";

/*
  Cart actions. They run on the server, so the Shopify token never reaches the
  browser. The cart id lives in an httpOnly cookie. Every input is checked here
  because server actions can be called by anyone.
*/

const COOKIE = "yatsar_cart";
const GENERIC = "We could not update your cart. Please try again.";

export type CartResult = { ok: true; cart: CartView | null } | { ok: false; message: string };

type UserError = { code?: string; message: string };
type Payload = Record<string, { cart: ShopifyCart | null; userErrors: UserError[] }>;

const isVariantId = (v: unknown): v is string => typeof v === "string" && /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(v);
const isLineId = (v: unknown): v is string => typeof v === "string" && /^gid:\/\/shopify\/CartLine\/[\w-]+(\?.*)?$/.test(v);
const isCartId = (v: unknown): v is string => typeof v === "string" && /^gid:\/\/shopify\/Cart\/[\w-]+(\?.*)?$/.test(v);
const isQty = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 99;

async function buyerIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

async function savedCartId() {
  const id = (await cookies()).get(COOKIE)?.value;
  return isCartId(id) ? id : null;
}

async function saveCartId(id: string) {
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 10,
    path: "/",
  });
}

/** Runs one cart mutation. Returns the cart, or a short message for the shopper. */
async function mutate(query: string, variables: Record<string, unknown>, field: string): Promise<CartResult> {
  const r = await shopifyFetch<Payload>({ query, variables, buyerIp: await buyerIp() });
  if (!r.ok) {
    // Server log only. Never includes the token.
    console.error(`[cart] ${field} failed`, JSON.stringify(r.error));
    return { ok: false, message: GENERIC };
  }
  const out = r.data[field];
  const err = out.userErrors[0];
  if (err) {
    console.error(`[cart] ${field} user error`, err.code, err.message);
    const stock = err.code === "MERCHANDISE_NOT_ENOUGH_STOCK" || err.code === "MERCHANDISE_OUT_OF_STOCK";
    return { ok: false, message: stock ? "We do not have that many in stock." : GENERIC };
  }
  if (!out.cart) return { ok: false, message: GENERIC };
  await saveCartId(out.cart.id);
  return { ok: true, cart: mapCart(out.cart) };
}

export async function getCart(): Promise<CartResult> {
  const id = await savedCartId();
  if (!id) return { ok: true, cart: null };
  const r = await shopifyFetch<{ cart: ShopifyCart | null }>({ query: CART_QUERY, variables: { id } });
  if (!r.ok) {
    console.error("[cart] get failed", JSON.stringify(r.error));
    return { ok: false, message: GENERIC };
  }
  // Shopify carts expire. A missing cart just means an empty one.
  return { ok: true, cart: r.data.cart ? mapCart(r.data.cart) : null };
}

export async function addToCart(variantId: string, quantity: number): Promise<CartResult> {
  if (!isVariantId(variantId) || !isQty(quantity)) return { ok: false, message: GENERIC };
  const lines = [{ merchandiseId: variantId, quantity }];
  const id = await savedCartId();
  if (id) {
    const r = await mutate(CART_LINES_ADD, { cartId: id, lines }, "cartLinesAdd");
    // A plain failure can mean the saved cart expired, so fall through and start a new one.
    if (r.ok || r.message !== GENERIC) return r;
  }
  return mutate(CART_CREATE, { input: { lines } }, "cartCreate");
}

export async function setLineQuantity(lineId: string, quantity: number): Promise<CartResult> {
  const id = await savedCartId();
  if (!id || !isLineId(lineId) || !isQty(quantity)) return { ok: false, message: GENERIC };
  return mutate(CART_LINES_UPDATE, { cartId: id, lines: [{ id: lineId, quantity }] }, "cartLinesUpdate");
}

export async function removeLine(lineId: string): Promise<CartResult> {
  const id = await savedCartId();
  if (!id || !isLineId(lineId)) return { ok: false, message: GENERIC };
  return mutate(CART_LINES_REMOVE, { cartId: id, lineIds: [lineId] }, "cartLinesRemove");
}

/** One code at a time. A code Shopify does not accept is removed again straight away. */
export async function applyDiscount(code: string): Promise<CartResult> {
  const id = await savedCartId();
  const clean = typeof code === "string" ? code.trim() : "";
  if (!id || !clean || clean.length > 64) return { ok: false, message: "Enter a valid code." };
  const r = await mutate(CART_DISCOUNT_UPDATE, { cartId: id, discountCodes: [clean] }, "cartDiscountCodesUpdate");
  if (!r.ok || !r.cart) return r;
  if (r.cart.discountCode?.toLowerCase() === clean.toLowerCase()) return r;
  await mutate(CART_DISCOUNT_UPDATE, { cartId: id, discountCodes: [] }, "cartDiscountCodesUpdate");
  return { ok: false, message: "This code is not valid." };
}

export async function clearDiscount(): Promise<CartResult> {
  const id = await savedCartId();
  if (!id) return { ok: true, cart: null };
  return mutate(CART_DISCOUNT_UPDATE, { cartId: id, discountCodes: [] }, "cartDiscountCodesUpdate");
}
