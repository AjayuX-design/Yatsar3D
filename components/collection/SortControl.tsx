"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { ArrowUpDown, Check, ChevronDown, X } from "@/components/ui/Icons";
import { sortOptions, type SortKey } from "@/lib/product/sort";

/**
 * Mobile: a Sort button that opens a bottom sheet. Desktop: a native select.
 * The choice lives in the URL (?sort=), so the server can sort and links can be shared.
 * Filters in the URL are kept when the sort changes.
 */
export function SortControl({ current }: { current: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const choose = (key: SortKey) => {
    // Keep any active filters; only the sort changes.
    const next = new URLSearchParams(params.toString());
    if (key === "featured") next.delete("sort");
    else next.set("sort", key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  };
  const currentLabel = sortOptions.find((o) => o.key === current)?.label;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-ctl border border-line px-4 t-label text-ink hover:border-graphite/50 lg:hidden"
      >
        <ArrowUpDown className="size-[18px]" aria-hidden="true" />
        Sort
        {current !== "featured" && <span aria-hidden="true" className="size-1.5 rounded-pill bg-ink" />}
        <span className="sr-only">{currentLabel}</span>
      </button>

      {/* Looks like the Filter button: icon, the word Sort, then the choice. Still a native select underneath. */}
      <label className="relative hidden h-11 cursor-pointer items-center gap-2 rounded-ctl border border-line pl-4 pr-3 t-label text-ink transition-colors duration-150 hover:border-graphite/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-kiln lg:flex">
        <ArrowUpDown className="size-[18px]" aria-hidden="true" />
        Sort
        <select
          value={current}
          onChange={(e) => choose(e.target.value as SortKey)}
          aria-label="Sort products"
          className="cursor-pointer appearance-none bg-transparent pr-6 font-semibold text-ink outline-none"
        >
          {sortOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 size-4 text-graphite" aria-hidden="true" />
      </label>

      <Sheet open={open} onClose={() => setOpen(false)} label="Sort products">
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div className="flex h-14 items-center justify-between border-b border-line pl-4 pr-2">
            <h2 className="t-h3 text-ink">Sort</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center rounded-ctl hover:bg-mist"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>
          <div role="radiogroup" aria-label="Sort products" className="px-4 py-2">
            {sortOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={o.key === current}
                onClick={() => choose(o.key)}
                className="flex min-h-14 w-full items-center justify-between border-b border-line t-body text-ink last:border-b-0"
              >
                <span className={o.key === current ? "font-semibold" : undefined}>{o.label}</span>
                {o.key === current && <Check className="size-5" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  );
}
