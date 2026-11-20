import type { Product, ProductVariant } from "../types";

/** The one variant a product can be added with in a single tap, or null when it needs a choice or is sold out. */
export function quickVariant(product: Product): ProductVariant | null {
  return product.variants.length === 1 && product.variants[0].availableForSale ? product.variants[0] : null;
}
