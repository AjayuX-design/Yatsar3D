import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { StatusChip, type Status } from "@/components/ui/Chip";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { longestSideCm } from "@/lib/format/dimensions";
import { cn } from "@/lib/cn";
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
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const status = cardStatus(product);
  const soldOut = status === "sold-out";
  const hero = product.images[0];

  const live = product.variants.filter((v) => v.availableForSale);
  const pool = live.length ? live : product.variants;
  const sorted = [...pool].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
  const lowest = sorted[0];
  const hasRange = Number(sorted[sorted.length - 1].price.amount) > Number(lowest.price.amount);

  const size = longestSideCm(product.dimensions);
  const spec = [product.material, size ? `${size} cm` : null].filter(Boolean).join(", ");

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex h-full flex-col rounded-card outline-offset-4"
    >
      <div className="relative aspect-square overflow-hidden rounded-card bg-mist">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
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
        <StatusChip status={status} tone="overlay" className="absolute left-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col px-0.5 pt-2.5">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-5 text-ink group-hover:underline group-hover:underline-offset-[3px]">
          {product.title}
        </h3>
        {spec && <p className="mt-0.5 t-small text-graphite">{spec}</p>}
        <Price
          className="mt-auto pt-2"
          from={hasRange}
          muted={soldOut}
          price={lowest.price}
          compareAt={hasRange ? null : lowest.compareAt}
        />
      </div>
    </Link>
  );
}
