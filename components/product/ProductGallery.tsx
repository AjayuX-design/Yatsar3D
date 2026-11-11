"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ArrowLeft, ArrowRight, Search, X } from "@/components/ui/Icons";
import { ImageBadges } from "@/components/ui/ImageBadges";
import { Sheet } from "@/components/ui/Sheet";
import type { Status } from "@/components/ui/Chip";
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
export function ProductGallery({ images, title, percent, status }: { images: ProductImage[]; title: string; percent?: number | null; status?: Status }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomAt, setZoomAt] = useState<number | null>(null);

  const goTo = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (!images.length) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-card bg-mist">
        <ImagePlaceholder alt={title} label="Photos coming soon" />
        <ImageBadges percent={percent} status={status} />
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
          <ImageBadges percent={percent} status={status} />
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
                {img.src && (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoomAt(i)}
                      aria-label={`Zoom image ${i + 1}`}
                      className="absolute inset-0 cursor-zoom-in outline-offset-[-4px]"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-3 right-3 grid size-11 place-items-center rounded-pill bg-surface/90 text-ink backdrop-blur-sm"
                    >
                      <Search className="size-5" />
                    </span>
                  </>
                )}
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
      <ZoomViewer
        images={images}
        at={zoomAt}
        onClose={() => setZoomAt(null)}
        onChange={(i) => {
          setZoomAt(i);
          goTo(i);
        }}
      />
    </div>
  );
}

/**
 * Full-screen viewer. Tap the photo to magnify it and scroll around; tap again
 * to fit it back. Arrow keys and the side buttons change photo. Esc closes.
 */
function ZoomViewer({
  images,
  at,
  onClose,
  onChange,
}: {
  images: ProductImage[];
  at: number | null;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const [magnified, setMagnified] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const [seenAt, setSeenAt] = useState(at);
  // Back to "fit" whenever the photo changes or the viewer closes.
  if (seenAt !== at) {
    setSeenAt(at);
    setMagnified(false);
  }
  const open = at !== null;
  const i = at ?? 0;
  const img = images[i];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && i > 0) onChange(i - 1);
      if (e.key === "ArrowRight" && i < images.length - 1) onChange(i + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, i, images.length, onChange]);

  const nav = "absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-pill bg-surface text-ink shadow-sm disabled:hidden";

  return (
    <Sheet open={open} onClose={onClose} label="Zoom product image" variant="full">
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-4 pr-2">
          <p className="t-label text-ink [font-variant-numeric:tabular-nums]" role="status">
            {images.length > 1 ? `Image ${i + 1} of ${images.length}` : "Product image"}
          </p>
          <button
            type="button"
            aria-label="Close zoom"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-ctl hover:bg-mist"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>
        <div className="relative min-h-0 flex-1 bg-mist">
          {img?.src && (
            <div ref={scroller} className="flex h-full overflow-auto">
              <button
                type="button"
                onClick={() => {
                  setMagnified((m) => !m);
                  // Start the magnified view at the middle of the photo, not its corner.
                  requestAnimationFrame(() => {
                    const el = scroller.current;
                    if (el) el.scrollTo({ left: (el.scrollWidth - el.clientWidth) / 2, top: (el.scrollHeight - el.clientHeight) / 2 });
                  });
                }}
                aria-label={magnified ? "Fit image to screen" : "Magnify image"}
                aria-pressed={magnified}
                className={cn("m-auto block shrink-0", magnified ? "cursor-zoom-out" : "h-full w-full cursor-zoom-in")}
              >
                {/* Plain img: the original file, not a resized copy, so zooming stays sharp. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className={cn(
                    "block",
                    magnified ? "h-auto w-[max(200%,900px)] max-w-none" : "h-full w-full object-contain",
                    img.onWhite && "mix-blend-multiply",
                  )}
                />
              </button>
            </div>
          )}
          {images.length > 1 && (
            <>
              <button type="button" className={cn(nav, "left-3")} disabled={i === 0} aria-label="Previous image" onClick={() => onChange(i - 1)}>
                <ArrowLeft className="size-5" aria-hidden="true" />
              </button>
              <button type="button" className={cn(nav, "right-3")} disabled={i === images.length - 1} aria-label="Next image" onClick={() => onChange(i + 1)}>
                <ArrowRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}
