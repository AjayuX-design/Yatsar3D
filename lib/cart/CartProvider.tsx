"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sampleDiscountCodes } from "@/lib/sample-data";
import {
  addLine,
  cartTotals,
  checkCode,
  lineFromProduct,
  setQuantity as setLineQuantity,
  type CartLine,
  type Discount,
} from "./cart";
import type { Product, ProductVariant } from "@/lib/types";

/*
  Client cart with the same actions the Shopify cart will have. Each action
  takes about 250ms so the "updating" states are real. Later, each one calls a
  server action (cartLinesAdd, cartLinesUpdate, cartLinesRemove,
  cartDiscountCodesUpdate) and the lines come back from Shopify.
  Sample only: lines are kept in localStorage so a reload keeps the test cart.
*/

const STORAGE_KEY = "yatsar-sample-cart";
const LATENCY = 250;

type CartContextValue = {
  lines: CartLine[];
  discount: Discount | null;
  totals: ReturnType<typeof cartTotals>;
  open: boolean;
  /** True while any cart action is in flight. Checkout waits for it. */
  updating: boolean;
  /** The line just removed, available for Undo for a few seconds. */
  removed: CartLine | null;
  openCart: () => void;
  closeCart: () => void;
  add: (product: Product, variant: ProductVariant, quantity: number) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  undoRemove: () => void;
  applyCode: (code: string) => Promise<string | null>;
  removeCode: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const [removed, setRemoved] = useState<CartLine | null>(null);
  const loaded = useRef(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the sample cart once, after hydration. Deferred to a microtask so the
  // first client render matches the server render.
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (saved?.lines) setLines(saved.lines);
        if (saved?.discount) setDiscount(saved.discount);
      } catch {}
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, discount }));
    } catch {}
  }, [lines, discount]);

  const run = useCallback(<T,>(fn: () => T): Promise<T> => {
    setPending((n) => n + 1);
    return new Promise((resolve) =>
      setTimeout(() => {
        const result = fn();
        setPending((n) => n - 1);
        resolve(result);
      }, LATENCY),
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      discount,
      totals: cartTotals(lines, discount),
      open,
      updating: pending > 0,
      removed,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add: async (product, variant, quantity) => {
        await run(() => setLines((l) => addLine(l, lineFromProduct(product, variant, quantity))));
      },
      setQuantity: (id, quantity) => void run(() => setLines((l) => setLineQuantity(l, id, quantity))),
      remove: (id) => {
        const line = lines.find((l) => l.id === id);
        void run(() => {
          setLines((l) => l.filter((x) => x.id !== id));
          if (line) {
            setRemoved(line);
            if (undoTimer.current) clearTimeout(undoTimer.current);
            undoTimer.current = setTimeout(() => setRemoved(null), 5000);
          }
        });
      },
      undoRemove: () => {
        if (!removed) return;
        const line = removed;
        setRemoved(null);
        void run(() => setLines((l) => addLine(l, line)));
      },
      applyCode: (code) =>
        run(() => {
          const result = checkCode(code, sampleDiscountCodes);
          if (!result.ok) return result.error;
          setDiscount(result.discount);
          return null;
        }),
      removeCode: () => void run(() => setDiscount(null)),
    }),
    [lines, discount, open, pending, removed, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
