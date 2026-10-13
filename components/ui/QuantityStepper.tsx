"use client";

import { cn } from "@/lib/cn";
import { Minus, Plus } from "@/components/ui/Icons";

const part =
  "grid size-11 place-items-center text-ink transition-colors duration-150 " +
  "hover:bg-mist active:bg-line disabled:cursor-not-allowed disabled:text-graphite " +
  "disabled:hover:bg-transparent";

/**
 * Controlled stepper. min is 1. Pass max when Shopify limits stock.
 * Parts are 44px for the touch-target floor.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  loading = false,
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  loading?: boolean;
  label?: string;
  className?: string;
}) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;
  return (
    <div
      role="group"
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-ctl border border-line bg-surface",
        className,
      )}
    >
      <button
        type="button"
        className={part}
        aria-label="Decrease quantity"
        disabled={atMin || loading}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className={cn(
          "grid h-11 min-w-11 place-items-center px-2 t-spec text-ink",
          loading && "text-graphite",
        )}
      >
        {value}
      </output>
      <button
        type="button"
        className={part}
        aria-label={atMax ? "Maximum quantity reached" : "Increase quantity"}
        disabled={atMax || loading}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
