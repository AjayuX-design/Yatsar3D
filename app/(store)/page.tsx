import type { Metadata } from "next";
import Link from "next/link";
import { NumberedSteps } from "@/components/content/NumberedSteps";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { ProductCard } from "@/components/product/ProductCard";
import { StatePanel } from "@/components/ui/StatePanel";
import { CUSTOM_ORDERS_HANDLE, categoryHref } from "@/lib/categories";
import { getCollection, getNavCollections, getProducts } from "@/lib/data";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/collection/CategoryIcon";
import { ArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { InfoCard } from "@/components/ui/InfoCard";
import { customSteps } from "@/lib/custom-orders";
import { sampleStore } from "@/lib/sample-data";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Yatsar 3D", robots: { index: false, follow: false } };

const section = "mt-16 lg:mt-24";

/**
 * Sections: hero, categories, featured products, delivery area, custom-print steps.
 * The fact strip was removed until delivery, payment and WhatsApp details are settled.
 * Optional sections (materials, maker note, FAQ preview) wait for their real content.
 */
export default function HomePage() {
  const heroAlt = "The Fear Not fridge magnet, a stamp-shaped plum and cream 3D print";

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-4 md:px-6 lg:px-8 lg:pt-8">
      {/* Hero */}
      <section className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-card bg-mist lg:order-2 lg:col-span-7 lg:aspect-[6/5]">
          <ImagePlaceholder src="/products/square/fear-not-magnet-front-1200.jpg" alt={heroAlt} label="Photo coming soon" priority onWhite sizes="(min-width: 1024px) 700px, 100vw" />
        </div>
        <div className="mt-8 lg:order-1 lg:col-span-5 lg:mt-0 lg:pr-4">
          <h1 className="t-display text-balance text-ink">Made layer by layer.</h1>
          <p className="mt-4 max-w-[420px] t-body-l text-graphite">
            3D-printed products for your desk and home, with the size, material and timing shown on every page.
          </p>
          <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
            <Button href="/collections/all" block className="sm:w-auto">
              Shop all products
            </Button>
            <Button href="/custom-print" variant="text" className="-ml-1 decoration-kiln-deep/40! sm:ml-0">
              Ask for a custom print
            </Button>
          </div>
        </div>
      </section>

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
        <div className="mx-auto max-w-[720px]">
          <InfoCard variant="slate" title="Delivery area">
            {sampleStore.deliveryAreaText} Most orders arrive within a few days of dispatch.
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
          <Link href="/custom-print" className="mt-1 inline-flex min-h-11 items-center t-label text-ink underline underline-offset-[3px]">
            See what we can make
          </Link>
          <p className="mt-3 t-small text-graphite">No payment before you approve the quote.</p>
        </div>
      </section>
    </main>
  );
}

/** Shop by category: one tile per category. */
async function Categories() {
  const found = await getNavCollections();
  // Count products in each category from Shopify. Empty categories are not shown.
  const counted = await Promise.all(
    found.map(async (c) => {
      const r = await getCollection(c.handle);
      return { ...c, count: r.state === "ok" && r.data ? r.data.products.length : 0 };
    }),
  );
  // Categories with no products yet show "Coming soon". Custom Orders is an enquiry, so it has no count.
  const collections = counted;
  if (!collections.length) return null;
  return (
    <section className={section} aria-labelledby="categories">
      <h2 id="categories" className="t-h2 text-ink">
        Shop by category
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {collections.map((c) => (
          <li key={c.handle} className="col-span-1 [&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1">
            <Link
              href={categoryHref(c.handle)}
              className="group flex h-full min-h-[120px] flex-col justify-between gap-3 rounded-card bg-mist p-4 transition-colors duration-150 hover:bg-line/60 lg:p-5"
            >
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-pill bg-surface text-ink">
                  <CategoryIcon handle={c.handle} title={c.title} className="size-5" />
                </span>
                <span className="t-h3 text-ink">{c.title}</span>
              </span>
              <span className="flex items-center justify-between gap-2 t-small text-graphite">
                <span className="[font-variant-numeric:tabular-nums]">
                  {c.handle === CUSTOM_ORDERS_HANDLE
                    ? "Get a quote"
                    : c.count === 0
                      ? "Coming soon"
                      : `${c.count} ${c.count === 1 ? "product" : "products"}`}
                </span>
                <ArrowRight aria-hidden="true" className="size-5 text-ink transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
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
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
      {r.data.map((p, i) => (
        <ProductCard key={p.handle} product={p} priority={i < 2} />
      ))}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
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
