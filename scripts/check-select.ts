// Runs the variant selection and spec logic against sample products.
// Run with: npm run check:select
import assert from "node:assert/strict";
import { defaultSelection, findVariant, valueState } from "@/lib/product/select";
import { buildSpecRows } from "@/lib/product/spec";
import { formatDays } from "@/lib/format/leadtime";
import { formatDimensions } from "@/lib/format/dimensions";
import { sampleProducts } from "@/lib/sample-products";
import { sortProducts } from "@/lib/product/sort";
import { addLine, cartTotals, checkCode, hasMixedFulfilment, lineFromProduct, lineTotals, setQuantity } from "@/lib/cart/cart";

const bySlug = (h: string) => sampleProducts.find((p) => p.handle === h)!;

// Ready stock, one option. PETG is sold out and costs more.
const desk = bySlug("desk-organiser");
assert.deepEqual(defaultSelection(desk), { Material: "PLA" });
assert.equal(findVariant(desk, { Material: "PETG" })!.availableForSale, false);
assert.deepEqual(valueState(desk, { Material: "PLA" }, "Material", "PETG"), {
  available: false,
  delta: 150,
});
assert.equal(valueState(desk, { Material: "PLA" }, "Material", "PLA").delta, null);

// Made to order, two options. A choice in one option changes availability in the other.
const planter = bySlug("planter-pot");
const sel = defaultSelection(planter);
assert.equal(findVariant(planter, sel)!.availableForSale, true);
assert.equal(valueState(planter, { Size: "Large", Colour: "White" }, "Colour", "Grey").available, false);
assert.equal(valueState(planter, { Size: "Small", Colour: "White" }, "Colour", "Grey").available, true);

// No options, one variant, nothing available.
const stand = bySlug("phone-stand");
assert.deepEqual(defaultSelection(stand), {});
assert.equal(findVariant(stand, {})!.availableForSale, false);

// Variant dimensions win over product dimensions. Empty rows are left out.
const largeSpec = buildSpecRows(planter, findVariant(planter, { Size: "Large", Colour: "White" }));
assert.match(largeSpec.find((r) => r.label === "Dimensions")!.value, /^200 x 200 x 220 mm$/);
assert.equal(buildSpecRows({ ...desk, material: undefined, finish: undefined, colour: undefined, dimensions: undefined, weightG: undefined }, undefined).length, 0);

// Formatting
assert.equal(formatDays({ min: 2, max: 3 }), "2 to 3 days");
assert.equal(formatDays({ min: 1, max: 1 }), "1 day");
assert.equal(formatDimensions({ lengthMm: 180, widthMm: 95, heightMm: 42 })!.cm, "18 x 9.5 x 4.2 cm");
assert.equal(formatDimensions({ lengthMm: 180 }), null);

// Sorting
assert.deepEqual(sortProducts(sampleProducts, "price-asc").map((p) => p.handle).slice(0, 2), ["bookmark-set", "phone-stand"]);
assert.equal(sortProducts(sampleProducts, "newest")[0].handle, "bookmark-set");
assert.equal(sortProducts(sampleProducts, "featured")[0].handle, sampleProducts[0].handle);

// Cart
const deskLine = lineFromProduct(desk, findVariant(desk, { Material: "PLA" })!, 2);
let lines = addLine([], deskLine);
lines = addLine(lines, { ...deskLine, quantity: 10 });
assert.equal(lines.length, 1, "same variant merges");
assert.equal(lines[0].quantity, 6, "capped at stock (6)");
assert.equal(cartTotals(lines).subtotal.amount, "7794");
assert.equal(hasMixedFulfilment(lines), false);
const potLine = lineFromProduct(planter, findVariant(planter, { Size: "Small", Colour: "White" })!, 1);
lines = addLine(lines, potLine);
assert.equal(hasMixedFulfilment(lines), true, "ready + made to order is mixed");
const coded = checkCode(" welcome10 ", { WELCOME10: 10 });
assert.ok(coded.ok);
if (coded.ok) {
  const t = cartTotals(lines, coded.discount);
  assert.equal(t.subtotal.amount, "8693");
  assert.equal(t.discount.amount, "869.3");
  assert.equal(t.total.amount, "7823.7");
  assert.equal(lineTotals(potLine, coded.discount).after.amount, "809.1");
}
assert.equal(checkCode("nope", { WELCOME10: 10 }).ok, false);
assert.equal(setQuantity(lines, potLine.id, 0).length, 1, "quantity 0 removes the line");

console.log("select, spec, format, sort and cart checks passed");
