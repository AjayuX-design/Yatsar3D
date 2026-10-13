import type { Product, ProductVariant } from "../types";

export type Selection = Record<string, string>;

const toSelection = (v: ProductVariant): Selection =>
  Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value]));

const matches = (v: ProductVariant, sel: Selection) =>
  v.selectedOptions.every((o) => sel[o.name] === o.value);

export function findVariant(product: Product, sel: Selection) {
  return product.variants.find((v) => matches(v, sel));
}

/** First available variant, else the first variant. */
export function defaultSelection(product: Product): Selection {
  const v = product.variants.find((x) => x.availableForSale) ?? product.variants[0];
  return v ? toSelection(v) : {};
}

/**
 * State of one option value if the buyer picked it now, keeping their other
 * choices. delta is the price change against the current variant, in rupees.
 */
export function valueState(
  product: Product,
  sel: Selection,
  optionName: string,
  value: string,
) {
  const next = findVariant(product, { ...sel, [optionName]: value });
  const current = findVariant(product, sel);
  const delta =
    next && current ? Number(next.price.amount) - Number(current.price.amount) : null;
  return {
    available: !!next?.availableForSale,
    delta: delta === 0 ? null : delta,
  };
}
