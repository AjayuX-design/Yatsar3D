import type { Product } from "../types";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export const isSortKey = (v: unknown): v is SortKey => sortOptions.some((o) => o.key === v);

const lowestPrice = (p: Product) =>
  Math.min(...p.variants.map((v) => Number(v.price.amount)));

/** Featured keeps the collection's own order. Returns a new array. */
export function sortProducts(products: Product[], key: SortKey) {
  const list = [...products];
  if (key === "newest") list.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  if (key === "price-asc") list.sort((a, b) => lowestPrice(a) - lowestPrice(b));
  if (key === "price-desc") list.sort((a, b) => lowestPrice(b) - lowestPrice(a));
  return list;
}
