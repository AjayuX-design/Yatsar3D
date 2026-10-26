"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Layers, PackageCheck, SlidersHorizontal, Tag, Truck, X } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  activeFilterCount,
  filterQuery,
  priceOptions,
  typeOptions,
  type FilterState,
} from "@/lib/product/filter";

/**
 * A Filter button (with a count of active filters) that opens a sheet.
 * Each choice applies at once and lives in the URL, next to the sort.
 */
export function FilterControl({
  filters,
  sort,
  resultCount,
}: {
  filters: FilterState;
  sort: string;
  /** How many products match the current filters. */
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);

  const apply = (next: FilterState) => router.replace(`${pathname}${filterQuery(next, sort)}`, { scroll: false });

  const chip = (selected: boolean) =>
    cn(
      "inline-flex min-h-11 items-center gap-2 rounded-pill border pl-3.5 pr-4 t-label transition-colors duration-150",
      selected ? "border-ink bg-ink text-surface" : "border-line text-ink hover:border-graphite/50",
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-ctl border border-line px-4 t-label text-ink hover:border-graphite/50"
      >
        <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
        Filter
        {count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-ink px-1 text-[11px] font-semibold leading-none text-surface [font-variant-numeric:tabular-nums]">
            {count}
          </span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} label="Filter products">
        <div className="mx-auto max-w-[560px] pb-[calc(16px+env(safe-area-inset-bottom))]">
          <div className="flex h-14 items-center justify-between border-b border-line pl-4 pr-2">
            <h2 className="t-h3 text-ink">Filter</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center rounded-ctl hover:bg-mist"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-6 px-4 py-5">
            <fieldset>
              <legend className="mb-3 t-label text-graphite">Availability</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={filters.stock === "in"}
                  className={chip(filters.stock === "in")}
                  onClick={() => apply({ ...filters, stock: filters.stock === "in" ? undefined : "in" })}
                >
                  <PackageCheck className="size-[18px]" aria-hidden="true" />
                  In stock only
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 t-label text-graphite">Delivery type</legend>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    aria-pressed={filters.type === o.key}
                    className={chip(filters.type === o.key)}
                    onClick={() => apply({ ...filters, type: filters.type === o.key ? undefined : o.key })}
                  >
                    {o.key === "ready_stock" ? (
                      <Truck className="size-[18px]" aria-hidden="true" />
                    ) : (
                      <Layers className="size-[18px]" aria-hidden="true" />
                    )}
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 t-label text-graphite">Price</legend>
              <div className="flex flex-wrap gap-2">
                {priceOptions.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    aria-pressed={filters.price === o.key}
                    className={chip(filters.price === o.key)}
                    onClick={() => apply({ ...filters, price: filters.price === o.key ? undefined : o.key })}
                  >
                    <Tag className="size-[18px]" aria-hidden="true" />
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex items-center gap-3 border-t border-line px-4 pt-4">
            <button
              type="button"
              disabled={count === 0}
              onClick={() => apply({})}
              className="min-h-11 px-1 t-label text-ink underline underline-offset-[3px] disabled:text-graphite/60 disabled:no-underline"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto inline-flex h-12 flex-1 items-center justify-center rounded-ctl bg-ink px-5 t-label text-surface hover:bg-ink-hover sm:max-w-[240px]"
            >
              Show {resultCount} {resultCount === 1 ? "product" : "products"}
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
