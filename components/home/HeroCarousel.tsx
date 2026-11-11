"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { SaleBadge } from "@/components/ui/ImageBadges";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { percentOff } from "@/lib/format/discount";
import { ArrowLeft, ArrowRight, Pause, Play } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/cn";
import type { Money } from "@/lib/format/money";

export type HeroSlide = {
  handle: string;
  title: string;
  price: Money;
  /** Shopify's higher "was" price, when the product is marked down. */
  compareAt?: Money | null;
  /** The price is a range, so it reads "From ...". */
  from: boolean;
  image?: { src: string; alt: string; onWhite?: boolean };
};

// One soft tint per banner, from the palette.
const tints = ["bg-mist", "bg-amber-tint", "bg-slate-tint", "bg-moss-tint"];
const SECONDS = 5;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(reducedQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/**
 * Product banners, one product each, that slide every few seconds. Swipe,
 * arrows and dots work too. It stops while the pointer or focus is on it, while
 * the tab is hidden, when the visitor taps Pause, and always when they prefer
 * reduced motion.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
  const playing = !paused && !reduced;
  const many = slides.length > 1;

  const goTo = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };

  // Restarts after every slide change, so a swipe gets a full pause before the next move.
  useEffect(() => {
    if (!many || !playing || hold) return;
    const t = setTimeout(() => goTo((index + 1) % slides.length), SECONDS * 1000);
    return () => clearTimeout(t);
    // goTo only reads refs and `reduced`, which cannot change while this timer waits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, hold, many, slides.length]);

  // Do not keep moving in a background tab.
  useEffect(() => {
    const onVis = () => setHold(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const control =
    "grid size-11 place-items-center rounded-pill bg-surface text-ink shadow-sm hover:bg-mist disabled:opacity-0";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
      className="relative"
    >
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        // Live only while it is not moving by itself, so screen readers are not interrupted.
        aria-live={playing ? "off" : "polite"}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div
            key={s.handle}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            inert={i !== index ? true : undefined}
            className={cn("grid w-full shrink-0 snap-center md:grid-cols-2", tints[i % tints.length])}
          >
            <div className="relative aspect-[5/4] md:order-2 md:aspect-auto md:min-h-[440px] lg:min-h-[480px]">
              <ImagePlaceholder
                src={s.image?.src}
                alt={s.image?.alt ?? s.title}
                label="Photo coming soon"
                priority={i === 0}
                onWhite={s.image?.onWhite}
                sizes="(min-width: 1024px) 600px, 100vw"
                whole
              />
            </div>
            <div className="flex flex-col justify-center px-6 pb-14 pt-6 md:order-1 md:px-10 md:py-12 lg:px-14">
              {/* The discount sits with the text, above the name, so it never floats over the photo. */}
              {!s.from && percentOff(s.price, s.compareAt) !== null && (
                <span className="mb-4 self-start">
                  <SaleBadge percent={percentOff(s.price, s.compareAt)!} size="lg" />
                </span>
              )}
              <h2 className="line-clamp-3 text-balance t-display text-ink">{s.title}</h2>
              <Price className="mt-4" size="l" from={s.from} price={s.price} compareAt={s.from ? null : s.compareAt} />
              <Button href={`/products/${s.handle}`} block className="mt-6 sm:w-auto sm:self-start">
                Shop now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {many && (
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between md:inset-x-10 md:bottom-4 lg:inset-x-14">
          <div className="flex items-center rounded-pill bg-surface/90 px-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              disabled={reduced}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              className="grid size-11 place-items-center rounded-pill text-ink disabled:hidden"
            >
              {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
            </button>
            {slides.map((s, i) => (
              <button
                key={s.handle}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show banner ${i + 1}: ${s.title}`}
                aria-current={i === index}
                className="grid h-11 w-6 place-items-center"
              >
                <span className={cn("h-1.5 rounded-pill transition-all duration-300", i === index ? "w-6 bg-ink" : "w-1.5 bg-graphite/40")} />
              </button>
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            <button type="button" className={control} disabled={index === 0} aria-label="Previous banner" onClick={() => goTo(index - 1)}>
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" className={control} disabled={index === slides.length - 1} aria-label="Next banner" onClick={() => goTo(index + 1)}>
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
