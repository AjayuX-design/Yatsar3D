// Runs the variant selection and spec logic against sample products.
// Run with: npm run check:select
import assert from "node:assert/strict";
import { mapCart, type ShopifyCart } from "@/lib/shopify/cart";
import { defaultSelection, findVariant, valueState } from "@/lib/product/select";
import { buildSpecRows } from "@/lib/product/spec";
import { formatDays } from "@/lib/format/leadtime";
import { formatDimensions } from "@/lib/format/dimensions";
import { sampleProducts } from "@/lib/sample-products";
import { searchProducts } from "@/lib/product/search";
import { buildEmail, escapeHtml, imageKind, newRequestId, readEmailConfig, readFields, validateFields, whatsappDigits } from "@/lib/custom-orders/request";
import { amountSaved, isOnSale, percentOff } from "@/lib/format/discount";
import { isAddressId, mapAddresses, normalisePhone, STATES, toInput, validateAddress } from "@/lib/customer/addresses";
import { mapCustomer } from "@/lib/customer/api";
import { orderStage } from "@/lib/customer/orders";
import { endpointsFor, newPkce, safeReturn, idTokenNonce } from "@/lib/customer/oauth";
import { readAccountConfig } from "@/lib/customer/config";
import { createHash } from "node:crypto";
import { summarise, validateReview } from "@/lib/reviews/validate";
import { activeFilterChips, filterProducts, filterQuery, parseFilters } from "@/lib/product/filter";
import { normaliseDomain, readShopifyConfig } from "@/lib/shopify/config";
import { mapProduct } from "@/lib/shopify/mappers";
import { noOptionsFixture, planterFixture } from "./fixtures";
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
assert.deepEqual(sortProducts(sampleProducts, "price-asc").map((p) => p.handle).slice(0, 3), ["fear-not-fridge-magnet", "bookmark-set", "phone-stand"]);
assert.equal(sortProducts(sampleProducts, "newest")[0].handle, "fear-not-fridge-magnet");
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

// Shopify config
assert.equal(normaliseDomain(" https://Store.myshopify.com/ "), "store.myshopify.com");
assert.deepEqual(readShopifyConfig({}), { ok: false, missing: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_STOREFRONT_PRIVATE_TOKEN"] });
const cfg = readShopifyConfig({ SHOPIFY_STORE_DOMAIN: "a.myshopify.com", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "x" });
assert.ok(cfg.ok && cfg.config.apiVersion === "2026-07");
assert.ok(cfg.ok && cfg.config.tokenKind === "public", "32-char token is public");
const priv = readShopifyConfig({ SHOPIFY_STORE_DOMAIN: "a.myshopify.com", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "shpat_abc" });
assert.ok(priv.ok && priv.config.tokenKind === "private");

// Shopify response to Product
const mapped = mapProduct(planterFixture);
assert.equal(mapped.fulfilment, "made_to_order");
assert.deepEqual(mapped.productionDays, { min: 2, max: 3 });
assert.equal(mapped.deliveryDays, undefined);
assert.deepEqual(mapped.dimensions, { lengthMm: 100, widthMm: 100, heightMm: 110 });
assert.deepEqual(mapped.included, ["1 planter pot", "1 drip tray"]);
assert.equal(mapped.customAvailable, true);
assert.deepEqual(mapped.paragraphs, ["A small planter.", "Printed in PETG."]);
assert.deepEqual(mapProduct({ ...planterFixture, descriptionHtml: "<p>One &amp; more.</p><p>Two.<br>Three.</p>" }).paragraphs, ["One & more.", "Two.", "Three."], "html paragraphs, entities and line breaks");
assert.equal(mapped.variants[0].weightG, 280, "kg to g");
assert.equal(mapped.variants[1].availableForSale, false);
assert.equal(mapped.variants[1].compareAt?.amount, "1999.00");
assert.deepEqual(mapped.images.map((i) => i.kind), ["hero", "scale"], "empty media skipped, order kept");
assert.equal(mapped.images[1].alt, "Planter pot, image 2", "alt falls back when missing");
assert.equal(mapped.collection.handle, "living");
const plain = mapProduct(noOptionsFixture);
assert.deepEqual(plain.options, [], "Default Title option is hidden");
assert.deepEqual(plain.variants[0].selectedOptions, []);
assert.equal(plain.fulfilment, "ready_stock");
assert.equal(plain.collection.handle, "all", "no collection falls back to all");
assert.equal(plain.paragraphs.length, 0);
assert.equal(mapProduct({ ...noOptionsFixture, metafields: [] }).fulfilment, "made_to_order", "missing field defaults to the safer claim");

// The Fear Not magnet: price, size, one variant, no options
const magnet = sampleProducts.find((p) => p.handle === "fear-not-fridge-magnet")!;
assert.equal(magnet.variants[0].price.amount, "199");
assert.deepEqual(magnet.options, []);
assert.equal(buildSpecRows(magnet, magnet.variants[0]).find((r) => r.label === "Dimensions")!.value, "64 x 70 x 5 mm");
assert.equal(buildSpecRows(magnet, magnet.variants[0]).some((r) => r.label === "Material"), false, "no material shown");
assert.match(magnet.careNote ?? "", /direct sunlight/);

// Shopify cart mapper
const cartFixture = (total: string, codes: { code: string; applicable: boolean }[]): ShopifyCart => ({
  id: "gid://shopify/Cart/abc",
  checkoutUrl: "https://example.myshopify.com/cart/c/abc",
  totalQuantity: 2,
  cost: { subtotalAmount: { amount: "398.0", currencyCode: "INR" }, totalAmount: { amount: total, currencyCode: "INR" } },
  discountCodes: codes,
  lines: {
    nodes: [
      {
        id: "gid://shopify/CartLine/1",
        quantity: 2,
        merchandise: {
          id: "gid://shopify/ProductVariant/9",
          title: "Default Title",
          quantityAvailable: 11,
          price: { amount: "199.0", currencyCode: "INR" },
          compareAtPrice: null,
          image: null,
          product: {
            handle: "fear-not-fridge-magnet",
            title: "Fear Not fridge magnet",
            options: [{ name: "Title" }],
            featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: null },
            fulfilment: { value: "ready_stock" },
          },
        },
      },
      { id: "gid://shopify/CartLine/2", quantity: 1, merchandise: null },
    ],
  },
});
const plainCart = mapCart(cartFixture("398.0", []));
assert.equal(plainCart.lines.length, 1, "line with no merchandise is dropped");
assert.equal(plainCart.lines[0].variantTitle, undefined, "Default Title hidden");
assert.equal(plainCart.lines[0].maxQuantity, 11, "ready stock caps at available quantity");
assert.equal(plainCart.lines[0].imageSrc, "https://cdn.shopify.com/a.jpg", "falls back to product image");
assert.equal(plainCart.totals.subtotal.amount, "398");
assert.equal(plainCart.totals.hasDiscount, false);
assert.equal(plainCart.discountCode, null);
const discounted = mapCart(cartFixture("358.2", [{ code: "TEN", applicable: true }]));
assert.equal(discounted.totals.discount.amount, "39.8", "discount is subtotal minus Shopify total");
assert.equal(discounted.discountCode, "TEN");
assert.equal(mapCart(cartFixture("398.0", [{ code: "BAD", applicable: false }])).discountCode, null, "rejected code is not shown as applied");

// Search
const names = (q: string) => searchProducts(sampleProducts, q).map((p) => p.handle);
assert.deepEqual(names(""), [], "empty query finds nothing");
assert.equal(names("magnet")[0], "fear-not-fridge-magnet", "title match");
assert.equal(names("FEAR not")[0], "fear-not-fridge-magnet", "case and word order do not matter");
assert.ok(names("petg").includes("planter-pot"), "matches material and option values");
assert.deepEqual(names("zzzz"), [], "no match gives an empty list");
assert.deepEqual(names("magnet planter"), [], "every word must match");

// Filters
const handles = (f: ReturnType<typeof parseFilters>) => filterProducts(sampleProducts, f).map((p) => p.handle);
assert.equal(handles({}).length, sampleProducts.length, "no filters keeps everything");
assert.ok(!handles({ stock: "in" }).includes("phone-stand"), "in stock only hides sold out");
assert.ok(handles({ type: "made_to_order" }).every((h) => h === "planter-pot"), "made to order filter");
assert.ok(handles({ price: "under-500" }).includes("fear-not-fridge-magnet"), "price under 500");
assert.ok(!handles({ price: "under-500" }).includes("desk-organiser"), "desk organiser costs more than 500");
assert.ok(handles({ price: "over-1000" }).includes("desk-organiser"));
assert.deepEqual(parseFilters({ type: "bogus", price: ["500-1000", "x"], stock: "in" }), { type: undefined, stock: "in", sale: undefined, price: "500-1000" }, "unknown values ignored");
assert.equal(filterQuery({ type: "ready_stock", price: "over-1000" }, "price-asc"), "?sort=price-asc&type=ready_stock&price=over-1000");
assert.equal(filterQuery({}, "featured"), "");

// Custom order requests
const ok = readFields((n) => ({ type: "drawers", name: "Asha", phone: "+91 98765 43210", city: "Hyderabad", details: "A drawer organiser for kitchen cutlery.", size: "18 x 9 x 4 cm" } as Record<string, string>)[n]);
assert.deepEqual(validateFields(ok), {}, "a complete request is valid");
const bad = validateFields(readFields(() => "x"));
assert.ok(bad.type && bad.name && bad.phone && bad.city && bad.details, "empty request lists every required field");
assert.ok(validateFields({ ...ok, size: "" }).size, "a drawer request needs its size");
assert.equal(validateFields({ ...ok, type: "personalised", size: "" }).size, undefined, "other types do not need a size");
assert.equal(readFields((n) => (n === "type" ? "hack" : "")).type, "", "unknown type is dropped");
assert.equal(readFields((n) => (n === "name" ? "a".repeat(500) : "")).name.length, 80, "long input is cut");
assert.ok(validateFields({ ...ok, email: "nope" }).email, "bad email flagged");
assert.deepEqual(validateFields({ ...ok, email: "a@b.in" }), {});
assert.ok(validateFields({ ...ok, phone: "12345" }).phone, "short phone flagged");
assert.match(newRequestId((n) => new Uint8Array(n).fill(7)), /^YC-[2-9A-HJKMNP-Z]{5}$/, "request number shape");
assert.equal(escapeHtml(`<b onclick="x">&'`), "&lt;b onclick=&quot;x&quot;&gt;&amp;&#39;", "html is escaped");
const mail = buildEmail("YC-AAAAA", { ...ok, details: "<script>alert(1)</script>" }, 2);
assert.ok(!mail.html.includes("<script>"), "shopper text cannot inject html");
assert.match(mail.subject, /^\[YC-AAAAA\] Custom-fit drawers from Asha \(Hyderabad\)$/);
assert.equal(whatsappDigits("98765 43210"), "919876543210", "10 digit number gets the country code");
assert.equal(imageKind(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), "jpeg");
assert.equal(imageKind(new TextEncoder().encode("<html>not an image at all</html>")), null, "non-image refused");
assert.deepEqual(readEmailConfig({ SMTP_USER: "a@b.in" }), { ok: false, missing: ["SMTP_PASSWORD"] }, "password required");
const mailCfg = readEmailConfig({ SMTP_USER: "hello@yatsar3d.com", SMTP_PASSWORD: "pw" });
assert.ok(mailCfg.ok && mailCfg.config.host === "smtp.hostinger.com" && mailCfg.config.port === 465, "Hostinger defaults");
assert.ok(mailCfg.ok && mailCfg.config.to === "hello@yatsar3d.com", "delivers to the mailbox by default");
assert.ok(mailCfg.ok && mailCfg.config.from === "Yatsar 3D <hello@yatsar3d.com>", "sends as the mailbox");
const mailCfg2 = readEmailConfig({ SMTP_USER: "hello@yatsar3d.com", SMTP_PASSWORD: "pw", CUSTOM_ORDER_TO_EMAIL: "me@x.in", SMTP_PORT: "587" });
assert.ok(mailCfg2.ok && mailCfg2.config.to === "me@x.in" && mailCfg2.config.port === 587, "overrides work")

console.log("select, spec, format, sort, cart, shopify config, mapper and cart-mapper checks passed");

// Active filter chips: one per filter, each removes only itself
{
  const chips = activeFilterChips({ stock: "in", price: "under-500" });
  assert.deepEqual(chips.map((c) => c.label), ["In stock only", "Under ₹500"]);
  assert.deepEqual(chips[0].without, { stock: undefined, price: "under-500" });
  assert.equal(activeFilterChips({}).length, 0);
}
console.log("active filter chip checks passed");

// Reviews: rules and the average
{
  const ok = validateReview({ name: "  Asha  ", rating: "5", title: "", body: "Lovely little magnet, sits well on the fridge." });
  assert.ok(ok.ok && ok.value.name === "Asha" && ok.value.rating === 5);
  const bad = validateReview({ name: "A", rating: 0, title: "x", body: "short" });
  assert.ok(!bad.ok && bad.errors.name && bad.errors.rating && bad.errors.body, "name, rating and body are checked");
  const spam = validateReview({ name: "Raj", rating: 4, body: "Great, visit www.spam.com now for deals" });
  assert.ok(!spam.ok && spam.errors.body, "links are blocked");
  const s = summarise([
    { rating: 5, status: "live" },
    { rating: 4, status: "live" },
    { rating: 1, status: "hidden" },
  ]);
  assert.equal(s.count, 2);
  assert.equal(s.average, 4.5);
  assert.deepEqual(s.counts, [0, 0, 0, 1, 1]);
  assert.equal(summarise([]).average, 0);
}
console.log("review checks passed");

// Customer accounts: sign-in helpers and order status
{
  const { verifier, challenge } = newPkce();
  assert.equal(challenge, createHash("sha256").update(verifier).digest("base64url"), "PKCE challenge is the SHA-256 of the verifier");
  assert.ok(verifier.length >= 43 && verifier.length <= 128);
  assert.equal(safeReturn("/account/orders/1001"), "/account/orders/1001");
  assert.equal(safeReturn("https://evil.example"), "/account", "only /account paths are allowed");
  assert.equal(safeReturn("//evil.example"), "/account");
  const payload = Buffer.from(JSON.stringify({ nonce: "abc" })).toString("base64url");
  assert.equal(idTokenNonce(`x.${payload}.y`), "abc");
  assert.equal(idTokenNonce("garbage"), undefined);
  assert.ok(!readAccountConfig({ SHOPIFY_STORE_DOMAIN: "a.myshopify.com" }).ok, "client id is required");
  const cfg = readAccountConfig({ SHOPIFY_STORE_DOMAIN: "https://A.myshopify.com/", SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: "id" });
  assert.ok(cfg.ok && cfg.config.domain === "a.myshopify.com" && cfg.config.apiVersion === "2026-10");
  const withId = readAccountConfig({ SHOPIFY_STORE_DOMAIN: "a.myshopify.com", SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: "id", SHOPIFY_SHOP_ID: " 78292451500 " });
  assert.ok(withId.ok && withId.config.shopId === "78292451500");
  assert.equal(endpointsFor("78292451500").token_endpoint, "https://shopify.com/authentication/78292451500/oauth/token", "matches the address Shopify shows");

  const ship = (latest?: string) => ({ latest });
  assert.equal(orderStage({ fulfillmentStatus: "UNFULFILLED", shipments: [] }), "placed");
  assert.equal(orderStage({ fulfillmentStatus: "FULFILLED", shipments: [ship("IN_TRANSIT")] }), "shipped");
  assert.equal(orderStage({ fulfillmentStatus: "FULFILLED", shipments: [ship("OUT_FOR_DELIVERY")] }), "out_for_delivery");
  assert.equal(orderStage({ fulfillmentStatus: "FULFILLED", shipments: [ship("DELIVERED")] }), "delivered");
  assert.equal(orderStage({ fulfillmentStatus: "FULFILLED", shipments: [ship("DELIVERED"), ship("IN_TRANSIT")] }), "shipped", "delivered only when every shipment is");
  assert.equal(orderStage({ cancelledAt: "2026-11-01", fulfillmentStatus: "UNFULFILLED", shipments: [] }), "cancelled");

  const c = mapCustomer({
    displayName: "Asha Rao",
    firstName: "Asha",
    emailAddress: { emailAddress: "a@x.com" },
    orders: { nodes: [{
      id: "o1", name: "#1001", number: 1001, processedAt: "2026-11-01T10:00:00Z", financialStatus: "PAID", fulfillmentStatus: "FULFILLED", statusPageUrl: "https://x",
      totalPrice: { amount: "199.0", currencyCode: "INR" },
      lineItems: { nodes: [{ id: "l1", name: "Magnet", quantity: 2, image: { url: "https://cdn.shopify.com/a.jpg" } }] },
      fulfillments: { nodes: [{ latestShipmentStatus: "IN_TRANSIT", trackingInformation: [{ company: "Delhivery", number: "123", url: "https://t" }] }] },
    }] },
  });
  assert.equal(c.orders[0].lines[0].image?.alt, "Magnet", "image alt falls back to the product name");
  assert.equal(c.orders[0].shipments[0].carrier, "Delhivery");
  assert.equal(c.email, "a@x.com");
}
console.log("account checks passed");

// Saved addresses
{
  assert.equal(normalisePhone("98765 43210"), "+919876543210");
  assert.equal(normalisePhone("+91 98765-43210"), "+919876543210");
  assert.equal(normalisePhone("098765 43210"), "+919876543210");
  assert.equal(normalisePhone("12345"), null);
  assert.equal(normalisePhone("5876543210"), null, "Indian mobiles start with 6 to 9");
  const good = validateAddress({ firstName: " Asha ", lastName: "Rao", phone: "9876543210", address1: "12 Road No 5", address2: "", city: "Hyderabad", state: "TS", zip: "500034" });
  assert.ok(good.ok && good.value.firstName === "Asha" && good.phoneE164 === "+919876543210");
  if (good.ok) {
    const input = toInput(good.value, good.phoneE164);
    assert.equal(input.countryCode, "IN");
    assert.equal(input.zoneCode, "TS");
    assert.equal(input.address2, null, "empty line 2 is sent as null");
  }
  const bad = validateAddress({ firstName: "", lastName: "R", phone: "1", address1: "x", city: "", state: "ZZ", zip: "05" });
  assert.ok(!bad.ok && ["firstName", "phone", "address1", "city", "state", "zip"].every((k) => (bad.errors as Record<string, string>)[k]), "every bad field is reported");
  assert.ok(STATES.some((x) => x.code === "TS" && x.name === "Telangana"));
  assert.ok(isAddressId("gid://shopify/CustomerAddress/123?model_name=CustomerAddress") && !isAddressId("123") && !isAddressId("gid://shopify/Order/1"));
  const book = mapAddresses({
    defaultAddress: { id: "b" },
    addresses: { nodes: [{ id: "a", formatted: ["A"] }, { id: "b", formatted: ["B"] }] },
  });
  assert.deepEqual(book.map((x) => [x.id, x.isDefault]), [["b", true], ["a", false]], "the default address comes first");
}
console.log("address checks passed");

// Discounts: only genuine, never overstated
{
  const inr = (a: string) => ({ amount: a, currencyCode: "INR" });
  assert.equal(percentOff(inr("1299"), inr("1599")), 18, "rounded down: 18.76% is shown as 18%");
  assert.equal(percentOff(inr("500"), inr("1000")), 50);
  assert.equal(percentOff(inr("1299"), null), null, "no compare-at, no discount");
  assert.equal(percentOff(inr("1299"), inr("1299")), null, "equal prices are not a discount");
  assert.equal(percentOff(inr("1299"), inr("1000")), null, "a lower compare-at is not a discount");
  assert.equal(percentOff(inr("999"), inr("1000")), null, "under 1% is not shown");
  assert.equal(amountSaved(inr("1299"), inr("1599"))?.amount, "300");
  assert.equal(amountSaved(inr("1299"), null), null);
  const v = (price: string, compareAt: string | null, availableForSale = true) => ({ price: inr(price), compareAt: compareAt ? inr(compareAt) : null, availableForSale });
  assert.equal(isOnSale({ variants: [v("100", "150")] } as never), true);
  assert.equal(isOnSale({ variants: [v("100", "150", false)] } as never), false, "sold-out markdowns do not count");
  assert.equal(isOnSale({ variants: [v("100", null)] } as never), false);
  const f = parseFilters({ sale: "on" });
  assert.equal(f.sale, "on");
  assert.equal(filterQuery(f), "?sale=on");
  assert.deepEqual(activeFilterChips(f).map((c) => c.label), ["On sale"]);
}
console.log("discount checks passed");
