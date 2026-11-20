import Link from "next/link";
import { Price } from "@/components/ui/Price";
import type { Status } from "@/components/ui/Chip";
import { ImageBadges } from "@/components/ui/ImageBadges";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { percentOff } from "@/lib/format/discount";
import { longestSideCm } from "@/lib/format/dimensions";
import { cn } from "@/lib/cn";
import { Stars } from "@/components/reviews/Stars";
import { QuickAdd } from "@/components/product/QuickAdd";
import { quickVariant } from "@/lib/product/quick";
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
  const spec = size ? `${size} cm` : "";

  // One option: add in a tap. Several options or sold out: the card opens the product.
  const quick = quickVariant(product);
  const needsChoice = product.variants.length > 1 && !soldOut;

  return (
    <div
      className={cn(
        "group flex h-full flex-col card p-2 transition-[transform,box-shadow] duration-200 ease-out",
        // The card lifts 2px on hover, like every other linked card.
        "[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-lift",
      )}
    >
    <Link href={`/products/${product.handle}`} className="flex flex-1 flex-col rounded-ctl outline-offset-4 active:scale-[0.99]">
      <div className="relative aspect-square overflow-hidden rounded-ctl bg-mist">
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
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-5 text-ink">
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
        {/* Looks like a button, but the card is the link, so it is a span. Products that can be added in one tap get a real button below. */}
        {!quick && (
          <span
            aria-hidden="true"
            className={cn(
              "mt-3 inline-flex h-10 w-full items-center justify-center rounded-ctl whitespace-nowrap px-4 text-[16px] font-semibold leading-6 transition-colors duration-150",
              soldOut ? "border border-line bg-mist text-graphite" : "bg-kiln text-surface group-hover:bg-kiln-deep",
            )}
          >
            {needsChoice ? "Choose" : "View product"}
          </span>
        )}
      </div>
    </Link>
    {quick && (
      <div className="px-1 pb-1 pt-3">
        <QuickAdd product={product} variant={quick} />
      </div>
    )}
    </div>
  );
}
