import type { Money } from "../format/money";
import type { Fulfilment, Product, ProductVariant } from "../types";

/*
  Cart rules as pure functions, so they can be checked without a browser.
  The real cart is Shopify's (cartLinesAdd, cartLinesUpdate, cartLinesRemove,
  cartDiscountCodesUpdate). The provider calls these until that is wired.
*/

export type CartLine = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  variantTitle?: string;
  imageSrc?: string;
  imageAlt: string;
  price: Money;
  compareAt?: Money | null;
  quantity: number;
  /** Only for tracked ready-stock items. */
  maxQuantity?: number;
  fulfilment: Fulfilment;
};

export type Discount = { code: string; percent: number };

export const money = (n: number): Money => ({
  amount: (Math.round(n * 100) / 100).toString(),
  currencyCode: "INR",
});

const amount = (m: Money) => Number(m.amount);

export function lineFromProduct(product: Product, variant: ProductVariant, quantity: number): CartLine {
  const hero = product.images[0];
  return {
    id: `line-${variant.id}`,
    variantId: variant.id,
    handle: product.handle,
    title: product.title,
    variantTitle: product.options.length ? variant.title : undefined,
    imageSrc: hero?.src,
    imageAlt: hero?.alt ?? product.title,
    price: variant.price,
    compareAt: variant.compareAt,
    quantity,
    maxQuantity: product.fulfilment === "ready_stock" ? variant.quantityAvailable : undefined,
    fulfilment: product.fulfilment,
  };
}

/** Same variant merges into one line. Quantity never passes the stock limit. */
export function addLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  const cap = (l: CartLine, q: number) => (l.maxQuantity ? Math.min(q, l.maxQuantity) : q);
  const existing = lines.find((l) => l.variantId === incoming.variantId);
  if (!existing) return [...lines, { ...incoming, quantity: cap(incoming, incoming.quantity) }];
  return lines.map((l) =>
    l.variantId === incoming.variantId ? { ...l, quantity: cap(l, l.quantity + incoming.quantity) } : l,
  );
}

export function setQuantity(lines: CartLine[], id: string, quantity: number): CartLine[] {
  return lines
    .map((l) => (l.id === id ? { ...l, quantity: Math.min(quantity, l.maxQuantity ?? quantity) } : l))
    .filter((l) => l.quantity > 0);
}

export function cartTotals(lines: CartLine[], discount?: Discount | null) {
  const subtotal = lines.reduce((sum, l) => sum + amount(l.price) * l.quantity, 0);
  const discountAmount = discount ? Math.round(subtotal * discount.percent) / 100 : 0;
  return {
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: money(subtotal),
    discount: money(discountAmount),
    total: money(subtotal - discountAmount),
    hasDiscount: discountAmount > 0,
  };
}

/** What one line costs after the cart discount. */
export function lineTotals(line: CartLine, discount?: Discount | null) {
  const full = amount(line.price) * line.quantity;
  const after = discount ? full - Math.round(full * discount.percent) / 100 : full;
  return { full: money(full), after: money(after), discounted: after < full };
}

export const hasMixedFulfilment = (lines: CartLine[]) =>
  new Set(lines.map((l) => l.fulfilment)).size > 1;

export function checkCode(
  raw: string,
  table: Record<string, number>,
): { ok: true; discount: Discount } | { ok: false; error: string } {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };
  const percent = table[code];
  return percent ? { ok: true, discount: { code, percent } } : { ok: false, error: "This code is not valid." };
}
