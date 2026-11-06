import type { Metadata } from "next";
import Link from "next/link";
import { NumberedSteps } from "@/components/content/NumberedSteps";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { ProductCard } from "@/components/product/ProductCard";
import { StatePanel } from "@/components/ui/StatePanel";
import { CUSTOM_ORDERS_HANDLE, categoryHref, categoryImage } from "@/lib/categories";
import { getCollection, getNavCollections, getProducts } from "@/lib/data";
import { ratingsFor } from "@/lib/reviews/store";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/collection/CategoryIcon";
import { ArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { InfoCard } from "@/components/ui/InfoCard";
import { customSteps } from "@/lib/custom-orders";
import { sampleStore } from "@/lib/sample-data";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Yatsar 3D", robots: { index: false, follow: false } };

const section = "mt-16 lg:mt-24";

/**
 * Sections: hero (product banners), categories, featured products, delivery area, custom-print steps.
 * The fact strip was removed until delivery, payment and WhatsApp details are settled.
 * Optional sections (materials, maker note, FAQ preview) wait for their real content.
 */
export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-[1200px] px-4 pt-4 md:px-6 lg:px-8 lg:pt-8">
      {/* Hero: product banners */}
      <h1 className="sr-only">Yatsar 3D, 3D-printed products for your desk and home</h1>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      {/* Shop by category */}
      <Suspense fallback={null}>
        <Categories />
      </Suspense>

      {/* Featured */}
      <section className={section} aria-labelledby="featured">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="featured" className="t-h2 text-ink">
            Featured
          </h2>
          <Link href="/collections/all" className="inline-flex min-h-11 items-center t-label text-kiln-deep underline underline-offset-[3px] hover:no-underline">
            View all
          </Link>
        </div>
        <Suspense fallback={<FeaturedSkeleton />}>
          <Featured />
        </Suspense>
      </section>

      {/* Delivery area */}
      <section className={section} aria-label="Delivery area">
        <div className="max-w-[720px]">
          <InfoCard variant="slate" title="Delivery area">
            {sampleStore.deliveryAreaText} {sampleStore.freeDeliveryText} Most orders arrive within a few days of dispatch.
            <Link href="/delivery" className="-mb-3 flex min-h-11 items-center font-medium text-ink underline underline-offset-[3px]">
              How delivery works
            </Link>
          </InfoCard>
        </div>
      </section>

      {/* Custom printing */}
      <section className={section} aria-labelledby="custom">
        <h2 id="custom" className="t-h2 text-ink">
          How custom printing works
        </h2>
        <NumberedSteps steps={customSteps} className="mt-8" />
        <div className="mt-8 max-w-[420px]">
          <WhatsAppButton number={sampleStore.whatsappNumber} message={generalEnquiryMessage} />
          <p className="mt-3 t-small text-graphite">No payment before you approve the quote.</p>
          <Link href="/custom-print" className="mt-1 inline-flex min-h-11 items-center t-label text-ink underline underline-offset-[3px]">
            See what we can make
          </Link>
        </div>
      </section>
    </main>
  );
}

/** Shop by category: one tile per category. */
async function Categories() {
  const found = await getNavCollections();
  // Count products in each category from Shopify. Each default category has its own cover image.
  const counted = await Promise.all(
    found.map(async (c) => {
      const r = await getCollection(c.handle);
      const products = r.state === "ok" && r.data ? r.data.products : [];
      const cover = categoryImage(c.handle);
      return { ...c, count: products.length, image: cover ? { src: cover, onWhite: false } : products[0]?.images[0] };
    }),
  );
  const collections = counted;
  if (!collections.length) return null;
  return (
    <section className={section} aria-labelledby="categories">
      <h2 id="categories" className="t-h2 text-ink">
        Shop by category
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
        {collections.map((c) => (
          <li key={c.handle}>
            <Link href={categoryHref(c.handle)} className="group flex h-full flex-col rounded-card outline-offset-4">
              <span className="relative block aspect-square overflow-hidden rounded-card bg-mist">
                <span className="absolute inset-0 transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover:scale-[1.03]">
                  <ImagePlaceholder src={c.image?.src} alt="" label="" sizes="(min-width: 1024px) 220px, 50vw" onWhite={c.image?.onWhite} />
                </span>
                {!c.image?.src && (
                  <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-graphite">
                    <CategoryIcon handle={c.handle} title={c.title} className="size-10" />
                  </span>
                )}
              </span>
              <span className="mt-3 flex items-start justify-between gap-2">
                <span>
                  <span className="block t-h3 text-ink group-hover:underline group-hover:underline-offset-[3px]">{c.title}</span>
                  <span className="mt-1 block t-small text-graphite [font-variant-numeric:tabular-nums]">
                    {c.handle === CUSTOM_ORDERS_HANDLE
                      ? "Get a quote"
                      : c.count === 0
                        ? "Coming soon"
                        : `${c.count} ${c.count === 1 ? "product" : "products"}`}
                  </span>
                </span>
                <ArrowRight aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Up to four product banners, from products that have a photo. */
async function Hero() {
  const r = await getProducts(8);
  const slides: HeroSlide[] = r.state === "ok" ? r.data.filter((p) => p.images[0]?.src).slice(0, 4).map((p) => {
    const live = p.variants.filter((v) => v.availableForSale);
    const variants = [...(live.length ? live : p.variants)].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    const prices = variants.map((v) => v.price);
    const img = p.images[0];
    return {
      handle: p.handle,
      title: p.title,
      price: prices[0],
      compareAt: variants[0].compareAt,
      from: Number(prices[prices.length - 1].amount) > Number(prices[0].amount),
      image: { src: img.src!, alt: img.alt, onWhite: img.onWhite },
    };
  }) : [];
  if (slides.length === 0) {
    return (
      <section className="grid min-h-[320px] place-items-center rounded-card bg-mist px-6 py-12 text-center">
        <div>
          <p className="t-display text-ink">Yatsar 3D</p>
          <p className="mt-3 t-body-l text-graphite">3D-printed products for your desk and home.</p>
          <Button href="/custom-print" className="mt-6">Ask for a custom print</Button>
        </div>
      </section>
    );
  }
  return <HeroCarousel slides={slides} />;
}

function HeroSkeleton() {
  return <div aria-busy="true" aria-label="Loading featured products" className="aspect-[5/4] rounded-card bg-mist md:aspect-auto md:min-h-[440px] lg:min-h-[480px]" />;
}

/** Four products from the store. Loading, empty and error states included. */
async function Featured() {
  const r = await getProducts(4);
  if (r.state === "error") {
    return (
      <StatePanel tone="error" title="Products could not be loaded" className="mt-6" action={<Button href="/" variant="secondary">Try again</Button>}>
        {r.message}
      </StatePanel>
    );
  }
  if (r.data.length === 0) {
    return (
      <StatePanel title="Products are coming soon" className="mt-6">
        Our first prints are being added. Ask us on WhatsApp if you want something made.
      </StatePanel>
    );
  }
  const ratings = await ratingsFor(r.data.map((p) => p.handle));
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
      {r.data.map((p, i) => (
        <ProductCard key={p.handle} product={p} priority={i < 2} rating={ratings[p.handle]} />
      ))}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-x-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="aspect-square rounded-card bg-mist" />
          <div className="mt-3 h-4 w-3/4 rounded-ctl bg-mist" />
          <div className="mt-2 h-4 w-1/3 rounded-ctl bg-mist" />
        </div>
      ))}
    </div>
  );
}
