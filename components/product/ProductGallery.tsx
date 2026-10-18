"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { ProductImage } from "@/lib/types";

const labels: Record<ProductImage["kind"], string> = {
  hero: "Photo coming soon",
  scale: "Photo coming soon",
  closeup: "Photo coming soon",
  "in-use": "Photo coming soon",
  "in-box": "Photo coming soon",
};

/**
 * Swipe track (scroll snap) with dots and a counter. 4:5.
 * On desktop, vertical thumbnails sit to the left.
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (!images.length) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-card bg-mist">
        <ImagePlaceholder alt={title} label="Photos coming soon" />
      </div>
    );
  }

  return (
    <div className="lg:flex lg:gap-4">
      {images.length > 1 && (
        <div className="hidden w-16 shrink-0 flex-col gap-3 lg:flex" aria-label="Image thumbnails">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}: ${img.alt}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-ctl bg-mist outline-offset-2 transition-opacity duration-150",
                i === index
                  ? "outline outline-1 outline-ink"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              <ImagePlaceholder src={img.src} alt="" label="" sizes="64px" onWhite={img.onWhite} whole />
            </button>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="relative">
          <div
            ref={track}
            role="region"
            aria-roledescription="carousel"
            aria-label={`${title} images`}
            tabIndex={0}
            onScroll={(e) => {
              const el = e.currentTarget;
              setIndex(Math.round(el.scrollLeft / el.clientWidth));
            }}
            className="flex snap-x snap-mandatory overflow-x-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <div
                key={img.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${images.length}`}
                className="relative aspect-square w-full shrink-0 snap-center overflow-hidden bg-mist"
              >
                <ImagePlaceholder src={img.src} alt={img.alt} label={labels[img.kind]} priority={i === 0} onWhite={img.onWhite} whole />
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center lg:hidden">
              <div className="flex rounded-pill bg-surface/90 px-2 backdrop-blur-sm">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === index}
                    className="grid h-11 w-5 place-items-center"
                  >
                    <span className={cn("size-1.5 rounded-pill", i === index ? "bg-ink" : "bg-graphite/30")} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {images.length > 1 && (
            <p className="pointer-events-none absolute right-3 top-3 rounded-pill bg-surface px-3 py-1 t-caption text-ink [font-variant-numeric:tabular-nums]">
              {index + 1} / {images.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
