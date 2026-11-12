import Link from "next/link";
import { Price } from "@/components/ui/Price";
import type { Status } from "@/components/ui/Chip";
import { ImageBadges } from "@/components/ui/ImageBadges";
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
      className={cn(
        "group flex h-full flex-col rounded-card outline-offset-4 transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.99]",
        // Home cards sit in a soft box that lifts on hover.
        compact && "border border-line bg-surface p-2 shadow-[0_1px_2px_rgba(23,23,23,0.05)] [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_12px_28px_-12px_rgba(23,23,23,0.28)]",
      )}
    >
      <div className={cn("relative aspect-square overflow-hidden bg-mist", compact ? "rounded-ctl" : "rounded-card")}>
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
        {/* Home (compact) shows only a discount or "Sold out". Elsewhere "Made to order" shows too. */}
        <ImageBadges percent={soldOut ? null : off} status={compact && !soldOut ? undefined : status} />
      </div>
      <div className={cn("flex flex-1 flex-col", compact ? "px-1 pb-1 pt-3" : "pt-3")}>
        <h3 className={cn("line-clamp-2 text-ink", compact ? "text-[16px] font-semibold leading-5" : "text-[15px] font-medium leading-5 group-hover:underline group-hover:underline-offset-[3px]")}>
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
          price={lowest.price}
          compareAt={hasRange ? null : lowest.compareAt}
        />
        {/* Looks like a button, but the whole card is the link, so it is a span. */}
        {compact && (
          <span
            aria-hidden="true"
            className={cn(
              "mt-3 inline-flex h-10 w-full items-center justify-center rounded-ctl text-[15px] font-semibold transition-colors duration-150",
              soldOut ? "border border-line bg-mist text-graphite" : "bg-kiln text-surface group-hover:bg-kiln-deep",
            )}
          >
            View product
          </span>
        )}
      </div>
    </Link>
  );
}
