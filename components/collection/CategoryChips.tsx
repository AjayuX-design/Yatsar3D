import Link from "next/link";
import { CategoryIcon } from "@/components/collection/CategoryIcon";
import { categoryHref } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { Collection } from "@/lib/types";

/**
 * Shop by category: one chip per collection, scrolls sideways on a phone.
 * The current collection is marked. Plain links, so it works without scripts.
 */
export function CategoryChips({ collections, current }: { collections: Collection[]; current: string }) {
  if (!collections.length) return null;
  const items = [{ handle: "all", title: "All" }, ...collections];
  return (
    <nav aria-label="Shop by category" className="-mx-4 md:-mx-6 lg:mx-0">
      <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:px-6 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((c) => {
          const active = c.handle === current;
          return (
            <li key={c.handle} className="shrink-0">
              <Link
                href={categoryHref(c.handle)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-pill border pl-3 pr-4 t-label transition-colors duration-150",
                  active ? "border-ink bg-ink text-surface" : "border-line text-ink hover:border-graphite/50",
                )}
              >
                <CategoryIcon handle={c.handle} title={c.title} className="size-[18px] shrink-0" />
                {c.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
