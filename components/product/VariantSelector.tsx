"use client";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { valueState, type Selection } from "@/lib/product/select";
import type { Product } from "@/lib/types";

/** One pill. Selected = 2px ink border. Unavailable = struck through, still focusable. */
export function VariantPill({
  label,
  selected,
  available = true,
  delta,
  swatch,
  onSelect,
  name,
}: {
  label: string;
  selected: boolean;
  available?: boolean;
  /** Price change in rupees against the current choice. */
  delta?: number | null;
  /** Colour dot, for colour options. */
  swatch?: string;
  onSelect: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${name}: ${label}${available ? "" : ", sold out"}`}
      title={available ? undefined : "Sold out"}
      onClick={onSelect}
      className={cn(
        "relative inline-flex min-h-11 min-w-[4.5rem] items-center justify-center gap-2 rounded-ctl border px-3.5 t-label transition-colors duration-150",
        selected
          ? "border-ink bg-mist font-semibold text-ink"
          : "border-line bg-surface text-ink hover:border-graphite/50",
        !available && "text-graphite",
      )}
    >
      {swatch && (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-pill border border-ink/15"
          style={{ background: swatch }}
        />
      )}
      <span className={cn(!available && "line-through decoration-graphite")}>{label}</span>
      {delta ? (
        <span className="t-spec font-normal text-graphite">
          {delta > 0 ? "+" : "-"}
          {formatMoney({ amount: String(Math.abs(delta)), currencyCode: "INR" })}
        </span>
      ) : null}
    </button>
  );
}

/** One radio group per option (Material, Size, Colour). */
export function VariantSelector({
  product,
  selection,
  onChange,
  className,
}: {
  className?: string;
  product: Product;
  selection: Selection;
  onChange: (next: Selection) => void;
}) {
  if (!product.options.length) return null;
  return (
    <div className={cn("space-y-6", className)}>
      {product.options.map((opt) => (
        <div key={opt.name} role="radiogroup" aria-label={opt.name}>
          <p className="mb-3 t-label text-graphite">
            {opt.name} <span className="ml-1 font-semibold text-ink">{selection[opt.name]}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((value) => {
              const s = valueState(product, selection, opt.name, value);
              return (
                <VariantPill
                  key={value}
                  name={opt.name}
                  label={value}
                  selected={selection[opt.name] === value}
                  available={s.available}
                  delta={selection[opt.name] === value ? null : s.delta}
                  swatch={opt.swatches?.[value]}
                  onSelect={() => onChange({ ...selection, [opt.name]: value })}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
