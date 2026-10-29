/*
  The shop's five categories (Shopify collections):
    Desk & Tech, Drawers & Storage, Home Essentials, Gifts, Custom Orders.
  Custom Orders is an enquiry, not a shelf of products, so it opens the
  custom print page instead of a collection page.
*/

import type { Collection } from "@/lib/types";

export const CUSTOM_ORDERS_HANDLE = "custom-orders";

export const categoryHref = (handle: string) =>
  handle === CUSTOM_ORDERS_HANDLE ? "/custom-print" : `/collections/${handle}`;

/**
 * Always shown in the shop navigation, even before the Shopify collection exists
 * or while it is empty. When Shopify has a collection with the same handle, its
 * title and description win. Handles match what Shopify makes from the titles.
 */
export const defaultCategories: Collection[] = [
  {
    handle: "desk-tech",
    title: "Desk & Tech",
    description: "Cable kits, stands and organisers for your desk and devices.",
    productHandles: [],
  },
  {
    handle: "drawers-storage",
    title: "Drawers & Storage",
    description: "Standard modules and custom-fit drawer service.",
    productHandles: [],
  },
  {
    handle: "home-essentials",
    title: "Home Essentials",
    description: "Everyday organisers for the bedside, living room and entryway.",
    productHandles: [],
  },
  {
    handle: "gifts",
    title: "Gifts",
    description: "Small prints made to give, from fridge magnets to keepsakes.",
    productHandles: [],
  },
  {
    handle: CUSTOM_ORDERS_HANDLE,
    title: "Custom Orders",
    description: "Custom drawers, personalisation and business enquiries.",
    productHandles: [],
  },
];

export const isDefaultCategory = (handle: string) => defaultCategories.some((c) => c.handle === handle);

/** Shopify collections merged onto the default categories. Extra Shopify collections follow. */
export function mergeCategories(fromShopify: Collection[]): Collection[] {
  const byHandle = new Map(fromShopify.map((c) => [c.handle, c]));
  const defaults = defaultCategories.map((d) => {
    const s = byHandle.get(d.handle);
    return s ? { ...d, ...s, description: s.description || d.description } : d;
  });
  return [...defaults, ...fromShopify.filter((c) => !isDefaultCategory(c.handle))];
}
