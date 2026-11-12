"use server";

import { getProducts } from "@/lib/data";
import { formatMoney } from "@/lib/format/money";
import { searchProducts } from "@/lib/product/search";

/** Up to five matches for the search box dropdown. Public data only. */
export type Suggestion = { handle: string; title: string; price: string; image?: string; alt?: string };

export async function suggestProducts(q: string): Promise<Suggestion[]> {
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";
  if (query.length < 2) return [];
  const all = await getProducts(100);
  if (all.state === "error") return [];
  return searchProducts(all.data, query)
    .slice(0, 5)
    .map((p) => {
      const lowest = [...p.variants].sort((a, b) => Number(a.price.amount) - Number(b.price.amount))[0];
      return {
        handle: p.handle,
        title: p.title,
        price: lowest ? formatMoney(lowest.price) : "",
        image: p.images[0]?.src,
        alt: p.images[0]?.alt,
      };
    });
}
