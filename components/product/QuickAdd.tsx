"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import { useCart } from "@/lib/cart/CartProvider";
import type { Product, ProductVariant } from "@/lib/types";

/**
 * Adds one of a product that has no options, straight from a card or the cart.
 * Shows Adding, then Added with a tick. A failure stays on the button with a short message.
 */
export function QuickAdd({
  product,
  variant,
  openOnAdd = true,
  className,
  label = "Add to cart",
}: {
  product: Product;
  variant: ProductVariant;
  openOnAdd?: boolean;
  className?: string;
  label?: string;
}) {
  const { add, openCart } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added" | "failed">("idle");

  const onClick = async () => {
    if (state === "adding" || state === "added") return;
    setState("adding");
    const ok = await add(product, variant, 1);
    if (!ok) return setState("failed");
    setState("added");
    if (openOnAdd) openCart();
    setTimeout(() => setState("idle"), 1500);
  };

  return (
    <>
      <Button
        block
        size="sm"
        className={className}
        loading={state === "adding"}
        icon={state === "added" ? <Check className="size-5" aria-hidden="true" /> : undefined}
        onClick={onClick}
        aria-label={`${label}: ${product.title}`}
      >
        {state === "added" ? "Added" : state === "failed" ? "Try again" : label}
      </Button>
      {state === "failed" && (
        <p role="alert" className="mt-1 t-caption text-error">
          Could not add. Please try again.
        </p>
      )}
    </>
  );
}
