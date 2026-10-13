import type { Days, Product, ProductImage, ProductVariant } from "../types";

/*
  Turns Storefront API data into the Product shape the interface uses.
  Pure functions, so they can be checked with a saved sample response.
  Custom fields are read from the `yatsar` metafield namespace.
*/

export const METAFIELD_NAMESPACE = "yatsar";
export const METAFIELD_KEYS = [
  "fulfilment_type",
  "production_days_min",
  "production_days_max",
  "delivery_days_min",
  "delivery_days_max",
  "length_mm",
  "width_mm",
  "height_mm",
  "material",
  "finish",
  "colour_note",
  "included_items",
  "not_included_items",
  "print_note",
  "care_note",
  "scale_caption",
  "custom_available",
] as const;

type Money = { amount: string; currencyCode: string };

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice: Money | null;
  weight: number | null;
  weightUnit: "GRAMS" | "KILOGRAMS" | "OUNCES" | "POUNDS";
};

export type ShopifyProduct = {
  handle: string;
  title: string;
  description: string;
  publishedAt: string;
  options: { name: string; values: string[] }[];
  variants: { nodes: ShopifyVariant[] };
  media: { nodes: Array<{ image?: { url: string; altText: string | null } | null }> };
  collections: { nodes: { handle: string; title: string }[] };
  metafields: Array<{ key: string; value: string } | null>;
};

const IMAGE_KINDS: ProductImage["kind"][] = ["hero", "scale", "closeup", "in-use", "in-box"];

const toGrams = (w: number | null, unit: ShopifyVariant["weightUnit"]) => {
  if (!w) return undefined;
  const factor = { GRAMS: 1, KILOGRAMS: 1000, OUNCES: 28.3495, POUNDS: 453.592 }[unit];
  return Math.round(w * factor);
};

const num = (v?: string) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) ? n : undefined;
};

const list = (v?: string): string[] => {
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // not JSON: fall through to one item per line
  }
  return v.split("\n").map((s) => s.trim()).filter(Boolean);
};

const days = (min?: string, max?: string): Days | undefined => {
  const lo = num(min);
  const hi = num(max);
  if (lo === undefined && hi === undefined) return undefined;
  return { min: lo ?? hi!, max: hi ?? lo! };
};

export function mapProduct(p: ShopifyProduct): Product {
  const meta = new Map<string, string>();
  for (const m of p.metafields) if (m?.value) meta.set(m.key, m.value);

  // A product with no options has one "Title: Default Title" option in Shopify.
  const noOptions =
    p.options.length === 1 && p.options[0].name === "Title" && p.options[0].values[0] === "Default Title";

  // Safer default when the field is missing: made to order, so a buyer never
  // expects stock that is not there.
  const fulfilment = meta.get("fulfilment_type") === "ready_stock" ? "ready_stock" : "made_to_order";

  const variants: ProductVariant[] = p.variants.nodes.map((v) => ({
    id: v.id,
    title: noOptions ? "Default" : v.title,
    selectedOptions: noOptions ? [] : v.selectedOptions,
    price: v.price,
    compareAt: v.compareAtPrice,
    availableForSale: v.availableForSale,
    quantityAvailable: v.quantityAvailable ?? undefined,
    weightG: toGrams(v.weight, v.weightUnit),
  }));

  const images: ProductImage[] = p.media.nodes
    .filter((m): m is { image: { url: string; altText: string | null } } => !!m.image)
    .map((m, i) => ({
      id: String(i + 1),
      kind: IMAGE_KINDS[i] ?? "in-use",
      alt: m.image.altText || `${p.title}, image ${i + 1}`,
      src: m.image.url,
    }));

  const collection = p.collections.nodes[0] ?? { handle: "all", title: "All products" };

  return {
    handle: p.handle,
    title: p.title,
    publishedAt: p.publishedAt,
    paragraphs: p.description.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
    fulfilment,
    productionDays: days(meta.get("production_days_min"), meta.get("production_days_max")),
    deliveryDays: days(meta.get("delivery_days_min"), meta.get("delivery_days_max")),
    dimensions: {
      lengthMm: num(meta.get("length_mm")),
      widthMm: num(meta.get("width_mm")),
      heightMm: num(meta.get("height_mm")),
    },
    weightG: variants[0]?.weightG,
    material: meta.get("material"),
    finish: meta.get("finish"),
    colour: meta.get("colour_note"),
    included: list(meta.get("included_items")),
    notIncluded: list(meta.get("not_included_items")),
    printNote: meta.get("print_note"),
    careNote: meta.get("care_note"),
    scaleCaption: meta.get("scale_caption"),
    customAvailable: meta.get("custom_available") === "true",
    options: noOptions ? [] : p.options.map((o) => ({ name: o.name, values: o.values })),
    variants,
    images,
    collection,
  };
}
