import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryChips } from "@/components/collection/CategoryChips";
import { FilterControl } from "@/components/collection/FilterControl";
import { SortControl } from "@/components/collection/SortControl";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { activeFilterCount, filterProducts, parseFilters } from "@/lib/product/filter";
import { isSortKey, sortProducts } from "@/lib/product/sort";
import { StatePanel } from "@/components/ui/StatePanel";
import { getCollection, getNavCollections, getSource } from "@/lib/data";
import { sampleStore } from "@/lib/sample-data";
import { generalEnquiryMessage } from "@/lib/whatsapp";

// "all" is built ahead. Other collections are built on first visit.
export function generateStaticParams() {
  return [{ handle: "all" }];
}

export async function generateMetadata(props: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const r = await getCollection(handle);
  const title = r.state === "ok" && r.data ? `${r.data.title} | Yatsar 3D` : "Collection | Yatsar 3D";
  return { title, robots: getSource() === "sample" ? { index: false, follow: false } : undefined };
}

export default function CollectionPage(props: PageProps<"/collections/[handle]">) {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-2 md:px-6 lg:px-8">
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionContent params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function CollectionContent({
  params,
  searchParams,
}: {
  params: PageProps<"/collections/[handle]">["params"];
  searchParams: PageProps<"/collections/[handle]">["searchParams"];
}) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const [result, categories] = await Promise.all([getCollection(handle), getNavCollections()]);

  if (result.state === "error") {
    return (
      <StatePanel
        tone="error"
        title="Products could not be loaded"
        className="mt-10"
        action={
          <Button href={`/collections/${handle}`} variant="secondary">
            Try again
          </Button>
        }
      >
        {result.message}
      </StatePanel>
    );
  }
  const collection = result.data;
  if (!collection) notFound();

  const sort = isSortKey(query.sort) ? query.sort : "featured";
  const filters = parseFilters(query);
  const filtered = filterProducts(collection.products, filters);
  const products = sortProducts(filtered, sort);
  const count = products.length;
  const filtering = activeFilterCount(filters) > 0;
  const total = collection.products.length;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: collection.title }]} />
      <header className="mt-2 pb-4">
        <h1 className="t-h1 text-ink">{collection.title}</h1>
        <p className="mt-2 max-w-[560px] t-body text-graphite">{collection.description}</p>
      </header>

      <CategoryChips collections={categories} current={collection.handle} />

      {total > 0 && (
        <div className="sticky top-14 z-20 -mx-4 mt-4 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-2 backdrop-blur-md md:-mx-6 md:px-6 lg:top-[72px] lg:-mx-8 lg:px-8">
          <p className="whitespace-nowrap t-small text-graphite [font-variant-numeric:tabular-nums]" role="status">
            {count} {count === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <FilterControl filters={filters} sort={sort} resultCount={count} />
            <SortControl current={sort} />
          </div>
        </div>
      )}

      {total === 0 ? (
        <div className="mx-auto max-w-[480px] py-16 text-center">
          <p className="t-h3 text-ink">Nothing here yet</p>
          <p className="mt-2 t-small text-graphite">Products in this category are coming soon.</p>
          <Button href="/collections/all" className="mt-6">
            Shop all products
          </Button>
          <EnquiryCta variant="link" className="mt-2" number={sampleStore.whatsappNumber} message={generalEnquiryMessage} />
        </div>
      ) : count === 0 && filtering ? (
        <div className="mx-auto max-w-[480px] py-16 text-center">
          <p className="t-h3 text-ink">No products match these filters</p>
          <p className="mt-2 t-small text-graphite">Try removing a filter to see more.</p>
          <Button href={`/collections/${collection.handle}`} variant="secondary" className="mt-6">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {products.map((p, i) => (
            <ProductCard key={p.handle} product={p} priority={i < 2} />
          ))}
        </div>
      )}
    </>
  );
}

function CollectionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className="mt-4 h-8 w-1/2 rounded-ctl bg-mist" />
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="aspect-square rounded-card bg-mist" />
            <div className="mt-3 h-4 w-3/4 rounded-ctl bg-mist" />
            <div className="mt-2 h-4 w-1/3 rounded-ctl bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}
