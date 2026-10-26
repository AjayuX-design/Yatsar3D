import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Search } from "@/components/ui/Icons";
import { StatePanel } from "@/components/ui/StatePanel";
import { getProducts } from "@/lib/data";
import { searchProducts } from "@/lib/product/search";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Search | Yatsar 3D", robots: { index: false, follow: true } };

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchContent({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 80) ?? "";
  const all = await getProducts(100);

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mt-2 t-h1 text-ink">Search</h1>

      <form action="/search" role="search" className="mt-4 flex max-w-[560px] gap-2">
        <label htmlFor="search-q" className="sr-only">
          Search products
        </label>
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-graphite" />
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            autoFocus={!query}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Search products"
            className="h-12 w-full rounded-ctl border border-line bg-surface pl-10 pr-3 text-[16px] text-ink placeholder:text-graphite/70"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {all.state === "error" ? (
        <StatePanel
          tone="error"
          title="Search is not available right now"
          className="mt-8"
          action={
            <Button href={`/search?q=${encodeURIComponent(query)}`} variant="secondary">
              Try again
            </Button>
          }
        >
          {all.message}
        </StatePanel>
      ) : (
        <Results query={query} products={all.data} />
      )}
    </>
  );
}

function Results({ query, products }: { query: string; products: Product[] }) {
  if (!query) {
    return (
      <>
        <p className="mt-8 t-small text-graphite">Type a product name, a colour or what it is for.</p>
        <Grid products={products.slice(0, 8)} heading="Popular right now" />
      </>
    );
  }
  const found = searchProducts(products, query);
  if (!found.length) {
    return (
      <div className="mt-10 max-w-[480px]">
        <p className="t-h3 text-ink">No products match “{query}”</p>
        <p className="mt-2 t-small text-graphite">Check the spelling, try a shorter word, or browse everything we make.</p>
        <Button href="/collections/all" className="mt-6">
          Shop all products
        </Button>
      </div>
    );
  }
  return (
    <>
      <p className="mt-6 t-small text-graphite [font-variant-numeric:tabular-nums]" role="status">
        {found.length} {found.length === 1 ? "result" : "results"} for “{query}”
      </p>
      <Grid products={found} />
    </>
  );
}

function Grid({ products, heading }: { products: Product[]; heading?: string }) {
  return (
    <section className="mt-6" aria-label={heading ?? "Results"}>
      <h2 className={heading ? "mb-4 t-h3 text-ink" : "sr-only"}>{heading ?? "Results"}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
        {products.map((p, i) => (
          <ProductCard key={p.handle} product={p} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}

function SearchSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading search">
      <div className="mt-4 h-8 w-1/3 rounded-ctl bg-mist" />
      <div className="mt-6 h-12 max-w-[560px] rounded-ctl bg-mist" />
    </div>
  );
}
