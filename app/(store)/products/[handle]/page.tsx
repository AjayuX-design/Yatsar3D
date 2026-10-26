import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { getProduct, getProducts, getSource } from "@/lib/data";
import { sampleStore } from "@/lib/sample-data";
import { siteUrl } from "@/lib/site";
import { sampleStoreDefaults } from "@/lib/sample-products";

// At least one path is needed at build time. Real products are added on demand.
export async function generateStaticParams() {
  const all = await getProducts(24);
  const handles = all.state === "ok" ? all.data.map((p) => p.handle) : [];
  return (handles.length ? handles : ["no-products-yet"]).map((handle) => ({ handle }));
}

export async function generateMetadata(props: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const r = await getProduct(handle);
  const title = r.state === "ok" && r.data ? `${r.data.title} | Yatsar 3D` : "Product | Yatsar 3D";
  return { title, robots: getSource() === "sample" ? { index: false, follow: false } : undefined };
}

export default function ProductPage(props: PageProps<"/products/[handle]">) {
  return (
    <>
      {getSource() === "sample" && (
        <p className="bg-ink px-4 py-2 text-center t-caption text-surface">
          Sample data. Names, prices, sizes and wording are placeholders.
        </p>
      )}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-2 md:px-6 lg:px-8 lg:pb-16">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductContent params={props.params} />
        </Suspense>
      </main>
    </>
  );
}

async function ProductContent({ params }: { params: PageProps<"/products/[handle]">["params"] }) {
  const { handle } = await params;
  const [result, all] = await Promise.all([getProduct(handle), getProducts(5)]);

  if (result.state === "error") {
    return (
      <StatePanel
        tone="error"
        title="This product could not be loaded"
        className="mt-10"
        action={
          <Button href={`/products/${handle}`} variant="secondary">
            Try again
          </Button>
        }
      >
        {result.message}
      </StatePanel>
    );
  }
  const product = result.data;
  if (!product) notFound();

  const related = all.state === "ok" ? all.data.filter((p) => p.handle !== product.handle).slice(0, 4) : [];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.collection.title, href: `/collections/${product.collection.handle}` },
          { label: product.title },
        ]}
      />
      <div className="mt-2">
        <ProductDetail
          product={product}
          store={{
            whatsappNumber: sampleStore.whatsappNumber,
            deliveryAreaText: sampleStore.deliveryAreaText,
            defaultDeliveryDays: sampleStoreDefaults.deliveryDays,
            productUrl: `${siteUrl()}/products/${product.handle}`,
          }}
        />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16 border-t border-line pt-12">
          <h2 id="related" className="t-h2 text-ink">
            You may also like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
          <p className="sr-only">
            <Link href="/collections/all">All products</Link>
          </p>
        </section>
      )}
    </>
  );
}
