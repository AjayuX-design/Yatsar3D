import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { StatusChip, type Status } from "@/components/ui/Chip";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { percentOff } from "@/lib/format/discount";
import { longestSideCm } from "@/lib/format/dimensions";
import { cn } from "@/lib/cn";
import { Stars } from "@/components/reviews/Stars";
import type { Rating } from "@/lib/reviews/types";
import type { Product } from "@/lib/types";

function cardStatus(p: Product): Status {
  if (!p.variants.some((v) => v.availableForSale)) return "sold-out";
  return p.fulfilment === "made_to_order" ? "made-to-order" : "ready";
}

/**
 * Photo first, text beneath on the page background. No card box, so the
 * product leads. One white status pill on the photo, top-left. Title (2 lines
 * max), one spec line, price pinned to the bottom so prices align across a row.
 * The whole card is one link.
 * compact (home page): only the name and price. No size line, no rating, no "Ready to ship".
 * A genuine discount shows as one neat badge on the photo; "Sold out" still shows, because it matters.
 */
export function ProductCard({
  product,
  priority = false,
  rating,
  compact = false,
}: {
  product: Product;
  priority?: boolean;
  rating?: Rating;
  compact?: boolean;
}) {
  const status = cardStatus(product);
  const soldOut = status === "sold-out";
  const hero = product.images[0];

  const live = product.variants.filter((v) => v.availableForSale);
  const pool = live.length ? live : product.variants;
  const sorted = [...pool].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
  const lowest = sorted[0];
  const hasRange = Number(sorted[sorted.length - 1].price.amount) > Number(lowest.price.amount);

  const off = hasRange ? null : percentOff(lowest.price, lowest.compareAt);
  const size = longestSideCm(product.dimensions);
  const spec = [product.material, size ? `${size} cm` : null].filter(Boolean).join(", ");

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex h-full flex-col rounded-card outline-offset-4 transition-transform duration-150 ease-out active:scale-[0.99]"
    >
      <div className="relative aspect-square overflow-hidden rounded-card bg-mist">
        <div
          className={cn(
            "absolute inset-0 transition-[opacity,transform] duration-300 ease-out [@media(hover:hover)]:group-hover:scale-[1.03]",
            soldOut && "opacity-70 grayscale",
          )}
        >
          <ImagePlaceholder
            src={hero?.src}
            alt={hero?.alt ?? product.title}
            label="Photo coming soon"
            sizes="(min-width: 1024px) 280px, 50vw"
            priority={priority}
            onWhite={hero?.onWhite}
          />
        </div>
        {compact ? (
          soldOut ? (
            <StatusChip status={status} tone="overlay" className="absolute left-3 top-3" />
          ) : (
            off !== null && (
              <span className="absolute left-3 top-3 inline-flex h-6 items-center rounded-pill bg-ink px-3 t-caption font-semibold text-surface [font-variant-numeric:tabular-nums]">
                <span className="sr-only">Sale: </span>
                {off}% off
              </span>
            )
          )
        ) : (
          <StatusChip status={status} tone="overlay" className="absolute left-3 top-3" />
        )}
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-5 text-ink group-hover:underline group-hover:underline-offset-[3px]">
          {product.title}
        </h3>
        {!compact && spec && <p className="mt-1 t-small text-graphite">{spec}</p>}
        {!compact && rating && rating.count > 0 && (
          <p className="mt-1 flex items-center gap-1.5 t-small text-graphite [font-variant-numeric:tabular-nums]">
            <Stars value={rating.average} size={14} />
            <span>
              {rating.average.toFixed(1)} ({rating.count})
            </span>
          </p>
        )}
        <Price
          className="mt-auto pt-2"
          from={hasRange}
          muted={soldOut}
          saving={compact ? undefined : "chip"}
          price={lowest.price}
          compareAt={hasRange ? null : lowest.compareAt}
        />
      </div>
    </Link>
  );
}
