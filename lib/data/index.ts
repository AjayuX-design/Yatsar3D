import { cacheLife } from "next/cache";
import { isShopifyConfigured, shopifyFetch } from "@/lib/shopify/client";
import { mapProduct, type ShopifyProduct } from "@/lib/shopify/mappers";
import { COLLECTIONS, COLLECTION_BY_HANDLE, PRODUCTS, PRODUCT_BY_HANDLE } from "@/lib/shopify/queries";
import { sampleCollections } from "@/lib/sample-collections";
import { sampleProducts } from "@/lib/sample-products";
import type { Collection, Product } from "@/lib/types";

/*
  Where the storefront gets its data.

  shopify : the real store (Shopify is the source of truth for prices, stock, variants)
  sample  : built-in sample data, for building the interface. Used when Shopify is
            not set up on a developer machine or a preview, or when
            SHOPIFY_USE_SAMPLE_DATA=true.
  blocked : production without Shopify settings. Shows an error, never fake prices.

  Reads are cached for about a minute so pages are fast and Shopify is not hit on
  every view. Failed reads are cached for only a few seconds.
*/

export type Source = "shopify" | "sample" | "blocked";

export function getSource(): Source {
  if (process.env.SHOPIFY_USE_SAMPLE_DATA === "true") return "sample";
  if (isShopifyConfigured()) return "shopify";
  return process.env.VERCEL_ENV === "production" ? "blocked" : "sample";
}

export type Loaded<T> = { state: "ok"; data: T } | { state: "error"; message: string };

export type CollectionPage = {
  handle: string;
  title: string;
  description: string;
  products: Product[];
};

const BLOCKED = "The store is not connected yet.";
const FAILED = "We could not load this right now. Please try again in a moment.";

const fail = (label: string, error: unknown): Loaded<never> => {
  // Server log only. Never includes the token.
  console.error(`[shopify] ${label} failed`, JSON.stringify(error));
  return { state: "error", message: FAILED };
};

export async function getProduct(handle: string): Promise<Loaded<Product | null>> {
  "use cache";
  const source = getSource();
  if (source === "blocked") {
    cacheLife("seconds");
    return { state: "error", message: BLOCKED };
  }
  if (source === "sample") {
    cacheLife("minutes");
    return { state: "ok", data: sampleProducts.find((p) => p.handle === handle) ?? null };
  }
  const r = await shopifyFetch<{ product: ShopifyProduct | null }>({ query: PRODUCT_BY_HANDLE, variables: { handle } });
  if (!r.ok) {
    cacheLife("seconds");
    return fail(`product ${handle}`, r.error);
  }
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  return { state: "ok", data: r.data.product ? mapProduct(r.data.product) : null };
}

export async function getProducts(first = 24): Promise<Loaded<Product[]>> {
  "use cache";
  const source = getSource();
  if (source === "blocked") {
    cacheLife("seconds");
    return { state: "error", message: BLOCKED };
  }
  if (source === "sample") {
    cacheLife("minutes");
    return { state: "ok", data: sampleProducts.slice(0, first) };
  }
  const r = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({ query: PRODUCTS, variables: { first } });
  if (!r.ok) {
    cacheLife("seconds");
    return fail("products", r.error);
  }
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  return { state: "ok", data: r.data.products.nodes.map(mapProduct) };
}

export async function getCollection(handle: string): Promise<Loaded<CollectionPage | null>> {
  "use cache";
  const source = getSource();
  if (source === "blocked") {
    cacheLife("seconds");
    return { state: "error", message: BLOCKED };
  }
  if (source === "sample") {
    cacheLife("minutes");
    const c = sampleCollections.find((x) => x.handle === handle);
    if (!c) return { state: "ok", data: null };
    const products = c.productHandles
      .map((h) => sampleProducts.find((p) => p.handle === h))
      .filter((p): p is Product => !!p);
    return { state: "ok", data: { handle: c.handle, title: c.title, description: c.description, products } };
  }
  const r = await shopifyFetch<{
    collection: { handle: string; title: string; description: string; products: { nodes: ShopifyProduct[] } } | null;
  }>({ query: COLLECTION_BY_HANDLE, variables: { handle, first: 48 } });
  if (!r.ok) {
    cacheLife("seconds");
    return fail(`collection ${handle}`, r.error);
  }
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  const c = r.data.collection;
  if (!c && handle === "all") {
    // No collection called "all" in Shopify: show every product instead.
    const all = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({ query: PRODUCTS, variables: { first: 48 } });
    if (!all.ok) return fail("all products", all.error);
    return {
      state: "ok",
      data: {
        handle: "all",
        title: "All products",
        description: "Everything we print, with size, material and timing on every page.",
        products: all.data.products.nodes.map(mapProduct),
      },
    };
  }
  return {
    state: "ok",
    data: c ? { handle: c.handle, title: c.title, description: c.description, products: c.products.nodes.map(mapProduct) } : null,
  };
}

/** Collections for the menu and footer. A failure just means no collection links. */
export async function getNavCollections(): Promise<Collection[]> {
  "use cache";
  const source = getSource();
  if (source === "sample") {
    cacheLife("minutes");
    return sampleCollections.filter((c) => c.handle !== "all" && c.handle !== "seasonal");
  }
  if (source === "blocked") {
    cacheLife("seconds");
    return [];
  }
  const r = await shopifyFetch<{ collections: { nodes: { handle: string; title: string; description: string }[] } }>({
    query: COLLECTIONS,
  });
  if (!r.ok) {
    cacheLife("seconds");
    return [];
  }
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  return r.data.collections.nodes
    .filter((c) => c.handle !== "all" && c.handle !== "frontpage")
    .map((c) => ({ handle: c.handle, title: c.title, description: c.description, productHandles: [] }));
}
