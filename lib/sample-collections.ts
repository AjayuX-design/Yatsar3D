import type { Collection } from "./types";

// SAMPLE collections. Real ones come from Shopify.
export const sampleCollections: Collection[] = [
  {
    handle: "all",
    title: "All products",
    description: "Everything we print, with size, material and timing on every page.",
    productHandles: [
      "desk-organiser",
      "planter-pot",
      "phone-stand",
      "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm",
      "bookmark-set",
    ],
  },
  {
    handle: "desk",
    title: "Desk",
    description: "Small prints that keep a desk in order.",
    productHandles: [
      "desk-organiser",
      "phone-stand",
      "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm",
    ],
  },
  { handle: "home", title: "Living", description: "Prints for shelves, windowsills and walls.", productHandles: ["planter-pot"] },
  { handle: "gifts", title: "Gifts", description: "Small, light and easy to post.", productHandles: ["bookmark-set"] },
  // Deliberately empty, to design the empty state.
  { handle: "seasonal", title: "Seasonal", description: "Limited prints for the season.", productHandles: [] },
];

/** Collections shown in navigation. "seasonal" is for testing the empty state only. */
export const navCollections = sampleCollections.filter((c) => c.handle !== "all" && c.handle !== "seasonal");
