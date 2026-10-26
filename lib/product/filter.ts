import type { Product } from "../types";

/*
  Collection filters. The choices live in the URL (?type=, ?stock=, ?price=) so
  the server filters and links can be shared. Prices come from Shopify's variants.
*/

export type FilterState = {
  type?: "ready_stock" | "made_to_order";
  stock?: "in";
  price?: "under-500" | "500-1000" | "over-1000";
};

export const typeOptions = [
  { key: "ready_stock", label: "Ready to ship" },
  { key: "made_to_order", label: "Made to order" },
] as const;

export const priceOptions = [
  { key: "under-500", label: "Under ₹500" },
  { key: "500-1000", label: "₹500 to ₹1,000" },
  { key: "over-1000", label: "Over ₹1,000" },
] as const;

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Reads filters from the URL. Anything unknown is ignored. */
export function parseFilters(params: Params): FilterState {
  const type = one(params.type);
  const stock = one(params.stock);
  const price = one(params.price);
  return {
    type: typeOptions.find((o) => o.key === type)?.key,
    stock: stock === "in" ? "in" : undefined,
    price: priceOptions.find((o) => o.key === price)?.key,
  };
}

export const activeFilterCount = (f: FilterState) => [f.type, f.stock, f.price].filter(Boolean).length;

const lowestPrice = (p: Product) => Math.min(...p.variants.map((v) => Number(v.price.amount)));
const inStock = (p: Product) => p.variants.some((v) => v.availableForSale);

export function filterProducts(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => {
    if (f.type && p.fulfilment !== f.type) return false;
    if (f.stock === "in" && !inStock(p)) return false;
    if (f.price) {
      const low = lowestPrice(p);
      if (f.price === "under-500" && !(low < 500)) return false;
      if (f.price === "500-1000" && !(low >= 500 && low <= 1000)) return false;
      if (f.price === "over-1000" && !(low > 1000)) return false;
    }
    return true;
  });
}

/** Builds the query string for a path, keeping the sort and the active filters. */
export function filterQuery(f: FilterState, sort?: string) {
  const q = new URLSearchParams();
  if (sort && sort !== "featured") q.set("sort", sort);
  if (f.type) q.set("type", f.type);
  if (f.stock) q.set("stock", f.stock);
  if (f.price) q.set("price", f.price);
  const s = q.toString();
  return s ? `?${s}` : "";
}
