import type { ShopifyProduct } from "@/lib/shopify/mappers";

// A saved response shaped like the Storefront API returns. Invented values.
const money = (a: string) => ({ amount: a, currencyCode: "INR" });

export const planterFixture: ShopifyProduct = {
  handle: "planter-pot",
  title: "Planter pot",
  description: "A small planter.\n\nPrinted in PETG.",
  publishedAt: "2026-09-12T00:00:00Z",
  options: [{ name: "Size", values: ["Small", "Large"] }],
  variants: {
    nodes: [
      {
        id: "gid://shopify/ProductVariant/1",
        title: "Small",
        availableForSale: true,
        quantityAvailable: null,
        selectedOptions: [{ name: "Size", value: "Small" }],
        price: money("899.00"),
        compareAtPrice: null,
        weight: 0.28,
        weightUnit: "KILOGRAMS",
      },
      {
        id: "gid://shopify/ProductVariant/2",
        title: "Large",
        availableForSale: false,
        quantityAvailable: 0,
        selectedOptions: [{ name: "Size", value: "Large" }],
        price: money("1599.00"),
        compareAtPrice: money("1999.00"),
        weight: 880,
        weightUnit: "GRAMS",
      },
    ],
  },
  media: {
    nodes: [
      { image: { url: "https://cdn.shopify.com/a.jpg", altText: "Front view" } },
      {},
      { image: { url: "https://cdn.shopify.com/b.jpg", altText: null } },
    ],
  },
  collections: { nodes: [{ handle: "living", title: "Living" }] },
  metafields: [
    { key: "fulfilment_type", value: "made_to_order" },
    { key: "production_days_min", value: "2" },
    { key: "production_days_max", value: "3" },
    { key: "length_mm", value: "100.0" },
    { key: "width_mm", value: "100" },
    { key: "height_mm", value: "110" },
    { key: "material", value: "PETG" },
    { key: "included_items", value: '["1 planter pot","1 drip tray"]' },
    { key: "custom_available", value: "true" },
    null,
  ],
};

export const noOptionsFixture: ShopifyProduct = {
  handle: "bookmark-set",
  title: "Bookmark set",
  description: "",
  publishedAt: "2026-10-02T00:00:00Z",
  options: [{ name: "Title", values: ["Default Title"] }],
  variants: {
    nodes: [
      {
        id: "gid://shopify/ProductVariant/9",
        title: "Default Title",
        availableForSale: true,
        quantityAvailable: 20,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: money("249.00"),
        compareAtPrice: null,
        weight: null,
        weightUnit: "GRAMS",
      },
    ],
  },
  media: { nodes: [] },
  collections: { nodes: [] },
  metafields: [{ key: "fulfilment_type", value: "ready_stock" }],
};
