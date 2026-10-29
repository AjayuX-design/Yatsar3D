import type { Collection } from "./types";

// SAMPLE collections. Real ones come from Shopify.
export const sampleCollections: Collection[] = [
  {
    handle: "all",
    title: "All products",
    description: "Everything we print, with size, material and timing on every page.",
    productHandles: [
      "fear-not-fridge-magnet",
      "desk-organiser",
      "planter-pot",
      "phone-stand",
      "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm",
      "bookmark-set",
    ],
  },
  {
    handle: "desk-tech",
    title: "Desk & Tech",
    description: "Cable kits, stands and organisers for your desk and devices.",
    productHandles: ["phone-stand", "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm"],
  },
  {
    handle: "drawers-storage",
    title: "Drawers & Storage",
    description: "Standard modules and custom-fit drawer service.",
    productHandles: ["desk-organiser"],
  },
  {
    handle: "home-essentials",
    title: "Home Essentials",
    description: "Everyday organisers for the bedside, living room and entryway.",
    productHandles: ["planter-pot", "bookmark-set"],
  },
  {
    handle: "gifts",
    title: "Gifts",
    description: "Small prints made to give, from fridge magnets to keepsakes.",
    productHandles: ["fear-not-fridge-magnet"],
  },
  {
    handle: "custom-orders",
    title: "Custom Orders",
    description: "Custom drawers, personalisation and business enquiries.",
    productHandles: [],
  },
  // Deliberately empty, to design the empty state.
  { handle: "seasonal", title: "Seasonal", description: "Limited prints for the season.", productHandles: [] },
];

/** Collections shown in navigation. "seasonal" is for testing the empty state only. */
export const navCollections = sampleCollections.filter((c) => c.handle !== "all" && c.handle !== "seasonal");
