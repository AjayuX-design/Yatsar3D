import Link from "next/link";
import { X } from "@/components/ui/Icons";
import { activeFilterChips, filterQuery, type FilterState } from "@/lib/product/filter";

/**
 * The filters in use, each with a button to remove just that one, and Clear all.
 * Plain links, so removing a filter works without JavaScript and keeps the sort.
 */
export function ActiveFilters({ filters, sort, path }: { filters: FilterState; sort: string; path: string }) {
  const chips = activeFilterChips(filters);
  if (!chips.length) return null;
  return (
    <ul aria-label="Active filters" className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <li key={c.key}>
          <Link
            href={`${path}${filterQuery(c.without, sort)}`}
            replace
            scroll={false}
            aria-label={`Remove filter: ${c.label}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line pl-4 pr-3 t-label text-ink hover:border-graphite/50"
          >
            {c.label}
            <X className="size-4" aria-hidden="true" />
          </Link>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <Link
            href={`${path}${filterQuery({}, sort)}`}
            replace
            scroll={false}
            className="inline-flex min-h-11 items-center px-2 t-label text-ink underline underline-offset-[3px]"
          >
            Clear all
          </Link>
        </li>
      )}
    </ul>
  );
}
