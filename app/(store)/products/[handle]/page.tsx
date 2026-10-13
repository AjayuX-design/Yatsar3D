import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { sampleStore } from "@/lib/sample-data";
import { sampleProducts, sampleStoreDefaults } from "@/lib/sample-products";

export function generateStaticParams() {
  return sampleProducts.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata(props: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const product = sampleProducts.find((p) => p.handle === handle);
  return {
    title: product ? `${product.title} | Yatsar 3D` : "Product not found",
    // Sample data. Remove when real products are live.
    robots: { index: false, follow: false },
  };
}

export default function ProductPage(props: PageProps<"/products/[handle]">) {
  return (
    <>
      {/* Temporary. Remove when real Shopify data replaces the sample products. */}
      <p className="bg-ink px-4 py-2 text-center t-caption text-surface">
        Sample data. Names, prices, sizes and wording are placeholders.
      </p>
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
  const product = sampleProducts.find((p) => p.handle === handle);
  if (!product) notFound();

  const related = sampleProducts.filter((p) => p.handle !== product.handle).slice(0, 4);

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
            productUrl: `https://example.com/products/${product.handle}`,
          }}
        />
      </div>

      <section aria-labelledby="related" className="mt-16 border-t border-line pt-12">
        <h2 id="related" className="t-h2 text-ink">
          You may also like
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {related.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
