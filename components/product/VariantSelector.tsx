"use client";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { valueState, type Selection } from "@/lib/product/select";
import type { Product } from "@/lib/types";

/** One pill. Selected = 2px orange border. Unavailable = struck through, still focusable. */
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
        "relative inline-flex min-h-11 w-full min-w-[4.5rem] items-center justify-center gap-2 rounded-ctl border px-4 t-label transition-colors duration-150",
        selected
          ? "border-kiln bg-mist font-semibold text-ink"
          : "border-line bg-surface text-ink hover:border-graphite/50",
        !available && "text-graphite",
      )}
    >
      {swatch && (
        <span
          aria-hidden="true"
          className="size-5 shrink-0 rounded-pill border border-ink/20"
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
  // An option with one value is not a choice, so it is not shown (for example "Material: PLA").
  const choices = product.options.filter((o) => o.values.length > 1);
  if (!choices.length) return null;
  return (
    <div className={cn("space-y-6", className)}>
      {choices.map((opt) => (
        <div key={opt.name} role="radiogroup" aria-label={opt.name}>
          <p className="mb-3 t-label text-graphite">
            {opt.name}{" "}
            <span className="ml-1 inline-flex items-center gap-2 font-semibold text-ink">
              {opt.swatches?.[selection[opt.name]] && (
                <span aria-hidden="true" className="size-4 rounded-pill border border-ink/20" style={{ background: opt.swatches[selection[opt.name]] }} />
              )}
              {selection[opt.name]}
            </span>
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
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
