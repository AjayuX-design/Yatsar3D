"use client";

import Link from "next/link";
import { OrderCard } from "@/components/account/OrderCard";
import { CartLine } from "@/components/cart/CartLine";
import { ProductCard } from "@/components/product/ProductCard";
import { money, type CartLine as Line } from "@/lib/cart/cart";
import { demoCustomer } from "@/lib/customer/demo";
import { sampleProducts } from "@/lib/sample-products";
import type { Product } from "@/lib/types";
import type { OrderView } from "@/lib/customer/orders";

type Mode = "demo" | "worst" | "empty" | "one";

const base = sampleProducts[0];
const withVariantPrice = (p: Product, amount: string, compareAt?: string): Product => ({
  ...p,
  variants: p.variants.map((v) => ({
    ...v,
    price: { ...v.price, amount },
    compareAt: compareAt ? { ...v.price, amount: compareAt } : null,
  })),
});

const LONG = "Personalised Wall-Mounted Headphone and Cable Hanger with Wooden Backplate, Matte Black, Set of 2";
const worstProducts: Product[] = [
  { ...withVariantPrice(base, "24999.5", "29999"), title: LONG, handle: "w1" },
  { ...withVariantPrice(base, "4"), title: "A", handle: "w2", images: [] },
  { ...withVariantPrice(base, "1499"), title: "फियर नॉट फ्रिज मैग्नेट 🙏", handle: "w3" },
  { ...base, title: "Unbreakable-Compound-Name-Without-Any-Spaces-Whatsoever-Set", handle: "w4", variants: base.variants.map((v) => ({ ...v, availableForSale: false })) },
];

const line = (over: Partial<Line>): Line => ({
  id: "l", variantId: "v", handle: "x", title: "Fear Not fridge magnet", imageAlt: "", price: money(199), quantity: 1, fulfilment: "made_to_order", ...over,
});
const worstLines: Line[] = [
  line({ id: "a", title: LONG, variantTitle: "Matte Black PLA+ / 120 cm x 60 cm x 45 cm / Tougher, Gift wrapped with message card", price: money(24999.5), compareAt: money(29999), quantity: 99, maxQuantity: 99 }),
  line({ id: "b", title: "A", price: money(4), quantity: 1 }),
  line({ id: "c", title: "Unbreakable-Compound-Name-Without-Any-Spaces-Whatsoever-Set", variantTitle: "Standard", price: money(1499), quantity: 12, fulfilment: "ready_stock", maxQuantity: 12 }),
];
const demoLines: Line[] = [line({ id: "d1" }), line({ id: "d2", title: "Desk organiser", variantTitle: "Standard, 18 cm", price: money(1299) })];

const manyLines = Array.from({ length: 12 }, (_, i) => ({ id: `o${i}`, name: LONG, variantTitle: "Matte Black", quantity: 8 + i }));
const worstOrder: OrderView = { ...demoCustomer.orders[0], name: "#1000123", total: money(1249999), lines: manyLines };

const noop = () => {};

export function WorstCase({ mode }: { mode: Mode }) {
  const products = mode === "worst" ? worstProducts : mode === "empty" ? [] : mode === "one" ? [sampleProducts[0]] : sampleProducts.slice(0, 4);
  const lines = mode === "worst" ? worstLines : mode === "empty" ? [] : mode === "one" ? [demoLines[0]] : demoLines;
  const orders = mode === "worst" ? [worstOrder] : mode === "empty" ? [] : mode === "one" ? [demoCustomer.orders[0]] : demoCustomer.orders.slice(0, 2);
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6">
      <nav aria-label="Data" className="fixed inset-x-0 bottom-3 z-50 flex justify-center">
        <div className="flex rounded-pill bg-mist p-1 text-[14px] shadow">
          {(["demo", "worst", "empty", "one"] as const).map((m) => (
            <Link key={m} href={`/preview/worst?data=${m}`} className={`rounded-pill px-4 py-2 ${m === mode ? "bg-surface font-semibold" : ""}`}>{m}</Link>
          ))}
        </div>
      </nav>
      <h2 className="t-h2">Product cards (two columns, phone width)</h2>
      <ul className="mt-4 grid max-w-[360px] grid-cols-2 gap-3">
        {products.map((p) => <li key={p.handle}><ProductCard product={p} /></li>)}
      </ul>
      {!products.length && <p className="mt-4 text-graphite">No products.</p>}
      <h2 className="mt-10 t-h2">Cart lines (drawer width, 320px)</h2>
      <ul className="mt-4 w-[320px] border border-line px-4">
        {lines.map((l) => <CartLine key={l.id} line={l} busy={false} onQuantity={noop} onRemove={noop} onNavigate={noop} />)}
      </ul>
      <h2 className="mt-10 t-h2">Order cards (phone width)</h2>
      <ul className="mt-4 max-w-[360px] space-y-3">
        {orders.map((o) => <li key={o.id}><OrderCard order={o} /></li>)}
      </ul>
    </div>
  );
}
