import type { MetadataRoute } from "next";
import { getNavCollections, getProducts } from "@/lib/data";
import { categoryHref } from "@/lib/categories";
import { policies } from "@/lib/policies";
import { siteUrl } from "@/lib/site";

/** Home, shop pages, every category, every product, and the policies. Private pages are left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [collections, products] = await Promise.all([getNavCollections(), getProducts(100)]);
  const fixed = ["/", "/collections/all", "/custom-print", "/delivery", "/faq", "/track-order"];
  const urls = [
    ...fixed.map((p) => ({ url: `${base}${p}` })),
    ...collections.map((c) => ({ url: `${base}${categoryHref(c.handle)}` })),
    ...(products.state === "ok" ? products.data.map((p) => ({ url: `${base}/products/${p.handle}` })) : []),
    ...policies.map((p) => ({ url: `${base}/policies/${p.slug}` })),
  ];
  return [...new Set(urls.map((u) => u.url))].map((url) => ({ url })); // Custom orders is also a category, so drop repeats
}
