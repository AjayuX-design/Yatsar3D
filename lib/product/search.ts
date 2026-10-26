import type { Product } from "../types";

/*
  Simple catalogue search for a small shop. Every word typed must match
  somewhere in the product. Title matches rank first. Runs on products already
  loaded from Shopify, so prices and stock stay Shopify's.
  ponytail: filters in memory, which is fine for a few hundred products.
  Switch to Shopify's search query if the catalogue grows past that.
*/

const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

export function searchProducts(products: Product[], raw: string): Product[] {
  const terms = clean(raw).split(" ").filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => {
      const title = clean(p.title);
      const rest = clean(
        [p.collection.title, p.material, p.finish, p.colour, ...p.paragraphs, ...p.options.flatMap((o) => o.values)]
          .filter(Boolean)
          .join(" "),
      );
      const all = terms.every((t) => title.includes(t) || rest.includes(t));
      const score = terms.filter((t) => title.includes(t)).length * 2 + (title.startsWith(terms[0]) ? 1 : 0);
      return { p, all, score };
    })
    .filter((x) => x.all)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
