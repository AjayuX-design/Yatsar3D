import type { Product, ProductImage } from "./types";
import { inr } from "./sample-data";

/*
  SAMPLE PRODUCTS ONLY. Invented to exercise every product state.
  Names, prices, sizes, lead times and wording are placeholders.
  Real data will come from Shopify and `custom.*` metafields.
  No photography exists yet. All five products use generated mock images
  (see scripts/make-mock-images.mjs). Every sample product has a full set.
*/

// mock: handle of a product that has generated mock imagery in /public/mock.
// Mock images are illustrations for layout testing, not photography.
const images = (name: string, mock?: string): ProductImage[] =>
  (
    [
      { id: "1", kind: "hero", alt: `${name}, front view` },
      { id: "2", kind: "scale", alt: `${name} next to a mug for scale` },
      { id: "3", kind: "closeup", alt: `Close-up of the printed surface of ${name}` },
      { id: "4", kind: "in-use", alt: `${name} in use` },
      { id: "5", kind: "in-box", alt: `${name} with everything included` },
    ] as ProductImage[]
  ).map((img) => (mock ? { ...img, src: `/mock/${mock}-${img.kind}.svg` } : img));

const para = [
  "Placeholder description. Two or three short, factual sentences about what the product is and where it is used.",
  "Placeholder detail. Final product copy comes from the product description in Shopify.",
];

export const sampleProducts: Product[] = [
  {
    handle: "fear-not-fridge-magnet",
    title: "Fear Not fridge magnet",
    publishedAt: "2026-10-15",
    // SAMPLE copy written for layout testing. Replace with your own wording.
    paragraphs: [
      "A stamp-shaped fridge magnet with the words FEAR NOT and the verse reference ISAIAH 41:10, in raised lettering. A white shield with a cross sits beside the text.",
      "A small reminder for the fridge, a locker or a metal board. Printed in two colours, with a plum face and a cream stamp edge.",
    ],
    fulfilment: "ready_stock",
    productionDays: { min: 1, max: 2 },
    // Width 64 mm, height 70 mm, total thickness 5 mm (back to top of the raised text).
    dimensions: { lengthMm: 64, widthMm: 70, heightMm: 5 },
    finish: "Matte",
    colour: "Plum and cream",
    included: ["1 Fear Not fridge magnet"],
    notIncluded: [],
    printNote: "Raised lettering and fine layer lines are part of a printed surface. Colours can vary slightly between prints.",
    careNote: "Do not keep it in direct sunlight or near heat. Wipe with a dry or slightly damp cloth.",
    scaleCaption: "Shown on a fridge door, next to the handle",
    customAvailable: true,
    collection: { handle: "home-essentials", title: "Home Essentials" },
    options: [],
    images: [
      {
        id: "1",
        kind: "hero",
        alt: "Fear Not, Isaiah 41:10, a stamp-shaped plum and cream 3D-printed fridge magnet with a shield and cross",
        src: "/products/fear-not-magnet-front.jpg",
        onWhite: true,
      },
      {
        id: "2",
        kind: "scale",
        alt: "The Fear Not fridge magnet on a fridge door beside the handle, showing its size",
        src: "/products/fear-not-magnet-fridge.jpg",
        fit: "whole",
        ratio: 1312 / 1199,
      },
    ],
    variants: [
      {
        id: "v-fear-not-magnet",
        title: "Default",
        selectedOptions: [],
        price: inr("199"),
        compareAt: null,
        availableForSale: true,
        quantityAvailable: 12,
      },
    ],
  },
  {
    handle: "desk-organiser",
    title: "Desk organiser",
    publishedAt: "2026-09-01",
    paragraphs: para,
    fulfilment: "ready_stock",
    productionDays: { min: 1, max: 1 },
    deliveryDays: { min: 1, max: 2 },
    dimensions: { lengthMm: 180, widthMm: 95, heightMm: 42 },
    weightG: 210,
    material: "PLA",
    finish: "Matte",
    colour: "Charcoal",
    included: ["1 desk organiser"],
    notIncluded: ["Pens and stationery"],
    printNote: "Fine layer lines are part of a printed surface. Small variations between prints are normal.",
    careNote: "Wipe with a dry or slightly damp cloth. Keep away from heat above 50 C.",
    scaleCaption: "Shown next to a hand",
    customAvailable: true,
    collection: { handle: "drawers-storage", title: "Drawers & Storage" },
    options: [{ name: "Material", values: ["PLA", "PETG"] }],
    images: images("Desk organiser", "desk-organiser"),
    variants: [
      {
        id: "v-desk-pla",
        title: "PLA",
        selectedOptions: [{ name: "Material", value: "PLA" }],
        price: inr("1299"),
        compareAt: inr("1599"),
        availableForSale: true,
        quantityAvailable: 6,
        weightG: 210,
      },
      {
        id: "v-desk-petg",
        title: "PETG",
        selectedOptions: [{ name: "Material", value: "PETG" }],
        price: inr("1449"),
        compareAt: null,
        availableForSale: false,
        quantityAvailable: 0,
        weightG: 225,
      },
    ],
  },
  {
    handle: "planter-pot",
    title: "Planter pot",
    publishedAt: "2026-09-12",
    paragraphs: para,
    fulfilment: "made_to_order",
    productionDays: { min: 2, max: 3 },
    deliveryDays: { min: 1, max: 2 },
    dimensions: { lengthMm: 100, widthMm: 100, heightMm: 110 },
    material: "PETG",
    finish: "Smooth",
    included: ["1 planter pot", "1 drip tray"],
    notIncluded: ["Plant and soil"],
    printNote: "Printed to order. Colour may vary slightly between batches.",
    careNote: "Safe for indoor use. Rinse with water, no dishwasher.",
    scaleCaption: "Shown next to a coffee mug",
    customAvailable: true,
    collection: { handle: "home-essentials", title: "Home Essentials" },
    options: [
      { name: "Size", values: ["Small", "Medium", "Large"] },
      { name: "Colour", values: ["White", "Grey"], swatches: { White: "#f4f2ee", Grey: "#9a9a98" } },
    ],
    images: images("Planter pot", "planter-pot"),
    variants: [
      v("small-white", "Small", "White", "899", true, { l: 100, w: 100, h: 110 }, 280),
      v("small-grey", "Small", "Grey", "899", true, { l: 100, w: 100, h: 110 }, 280),
      v("medium-white", "Medium", "White", "1199", true, { l: 150, w: 150, h: 165 }, 520),
      v("medium-grey", "Medium", "Grey", "1199", true, { l: 150, w: 150, h: 165 }, 520),
      v("large-white", "Large", "White", "1599", true, { l: 200, w: 200, h: 220 }, 880),
      v("large-grey", "Large", "Grey", "1599", false, { l: 200, w: 200, h: 220 }, 880),
    ],
  },
  {
    handle: "phone-stand",
    title: "Phone stand",
    publishedAt: "2026-08-20",
    paragraphs: para,
    fulfilment: "ready_stock",
    productionDays: { min: 1, max: 1 },
    dimensions: { lengthMm: 90, widthMm: 80, heightMm: 70 },
    weightG: 95,
    material: "PLA",
    finish: "Matte",
    colour: "White",
    included: ["1 phone stand"],
    notIncluded: [],
    scaleCaption: "Shown with a phone",
    customAvailable: false,
    collection: { handle: "desk-tech", title: "Desk & Tech" },
    options: [],
    images: images("Phone stand", "phone-stand"),
    variants: [
      {
        id: "v-stand",
        title: "Default",
        selectedOptions: [],
        price: inr("499"),
        availableForSale: false,
        quantityAvailable: 0,
      },
    ],
  },
  {
    handle: "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm",
    title: "Wall-mounted headphone and cable hanger with adjustable arm",
    publishedAt: "2026-09-25",
    paragraphs: para,
    fulfilment: "ready_stock",
    productionDays: { min: 1, max: 2 },
    deliveryDays: { min: 1, max: 2 },
    dimensions: { lengthMm: 140, widthMm: 60, heightMm: 190 },
    weightG: 160,
    material: "PETG",
    finish: "Smooth",
    colour: "Black",
    included: ["1 hanger", "2 screws", "2 wall plugs"],
    notIncluded: ["Drill"],
    scaleCaption: "Shown next to a hand",
    customAvailable: true,
    collection: { handle: "desk-tech", title: "Desk & Tech" },
    options: [],
    images: images("Headphone hanger", "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm"),
    variants: [
      {
        id: "v-hanger",
        title: "Default",
        selectedOptions: [],
        price: inr("749"),
        availableForSale: true,
        quantityAvailable: 3,
      },
    ],
  },
  {
    handle: "bookmark-set",
    title: "Bookmark set",
    publishedAt: "2026-10-02",
    paragraphs: para,
    fulfilment: "ready_stock",
    productionDays: { min: 1, max: 1 },
    dimensions: { lengthMm: 140, widthMm: 30, heightMm: 2 },
    material: "PLA",
    included: ["Set of 3 bookmarks"],
    notIncluded: [],
    customAvailable: false,
    collection: { handle: "home-essentials", title: "Home Essentials" },
    options: [],
    images: images("Bookmark set", "bookmark-set"),
    variants: [
      {
        id: "v-bookmarks",
        title: "Default",
        selectedOptions: [],
        price: inr("249"),
        availableForSale: true,
        quantityAvailable: 20,
      },
    ],
  },
];

function v(
  id: string,
  size: string,
  colour: string,
  price: string,
  available: boolean,
  d: { l: number; w: number; h: number },
  weightG: number,
) {
  return {
    id: `v-planter-${id}`,
    title: `${size} / ${colour}`,
    selectedOptions: [
      { name: "Size", value: size },
      { name: "Colour", value: colour },
    ],
    price: inr(price),
    availableForSale: available,
    weightG,
    dimensions: { lengthMm: d.l, widthMm: d.w, heightMm: d.h },
  };
}

export const sampleStoreDefaults = {
  deliveryDays: { min: 1, max: 2 },
};
