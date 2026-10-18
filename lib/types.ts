import type { Money } from "./format/money";

/*
  UI-side product shape. A Shopify mapper (later) turns Storefront API data and
  `yatsar.*` metafields into this. Components only ever see these types.
*/

export type Fulfilment = "ready_stock" | "made_to_order";
export type Days = { min: number; max: number };
export type Dimensions = { lengthMm?: number; widthMm?: number; heightMm?: number };

export type ProductImage = {
  id: string;
  kind: "hero" | "scale" | "closeup" | "in-use" | "in-box";
  alt: string;
  /** Photo shot on pure white. It is blended into the grey image backing so it matches other products. */
  onWhite?: boolean;
  /** Show the whole photo, never cropped. ratio is width divided by height. */
  fit?: "whole";
  ratio?: number;
  /** Missing until real photography exists. A labelled placeholder shows instead. */
  src?: string;
};

export type ProductOption = {
  name: string;
  values: string[];
  /** Optional colour dots for colour options, value -> hex. */
  swatches?: Record<string, string>;
};

export type ProductVariant = {
  id: string;
  title: string;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAt?: Money | null;
  availableForSale: boolean;
  /** Only for tracked ready-stock items. */
  quantityAvailable?: number;
  weightG?: number;
  /** Variant values win over product values. */
  dimensions?: Dimensions;
  productionDays?: Days;
};

export type Product = {
  handle: string;
  title: string;
  /** ISO date, for the Newest sort. */
  publishedAt?: string;
  paragraphs: string[];
  fulfilment: Fulfilment;
  productionDays?: Days;
  deliveryDays?: Days;
  dimensions?: Dimensions;
  weightG?: number;
  material?: string;
  finish?: string;
  colour?: string;
  included: string[];
  notIncluded: string[];
  printNote?: string;
  careNote?: string;
  scaleCaption?: string;
  customAvailable: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  images: ProductImage[];
  collection: { handle: string; title: string };
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  productHandles: string[];
};
