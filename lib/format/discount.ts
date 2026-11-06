import type { Money } from "./money";
import type { Product } from "../types";

/*
  Discounts come from Shopify only. A product is "on sale" when a variant has a compare-at
  price above its price. We never invent a discount, and the percentage is rounded down,
  so the label never claims more than the real saving.
*/

const higher = (price: Money, compareAt?: Money | null): compareAt is Money => !!compareAt && Number(compareAt.amount) > Number(price.amount);

/** Whole percent saved, or null when there is no genuine discount (or it is under 1%). */
export function percentOff(price: Money, compareAt?: Money | null): number | null {
  if (!higher(price, compareAt)) return null;
  const pct = Math.floor(((Number(compareAt.amount) - Number(price.amount)) / Number(compareAt.amount)) * 100);
  return pct >= 1 ? pct : null;
}

/** The rupee amount saved, or null when there is no genuine discount. */
export function amountSaved(price: Money, compareAt?: Money | null): Money | null {
  if (!higher(price, compareAt)) return null;
  const saved = Math.round((Number(compareAt.amount) - Number(price.amount)) * 100) / 100;
  return { amount: String(saved), currencyCode: price.currencyCode };
}

/** True when a variant you can buy is marked down. */
export const isOnSale = (p: Pick<Product, "variants">) => p.variants.some((v) => v.availableForSale && percentOff(v.price, v.compareAt) !== null);
