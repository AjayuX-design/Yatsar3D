import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart/CartProvider";
import { getNavCollections, getProducts } from "@/lib/data";
import { sampleStore } from "@/lib/sample-data";
import type { Collection } from "@/lib/types";

/*
  The storefront shell: announcement, header, page, footer, and the cart.
  Header, footer and cart read from Shopify, so each sits in its own Suspense
  boundary. The shell shows at once, without collection links, and the links
  appear when the data arrives. If Shopify fails, the shell still works.
*/

const header = (collections: Collection[]) => (
  <Header
    collections={collections}
    whatsappNumber={sampleStore.whatsappNumber}
    deliveryAreaText={sampleStore.deliveryAreaText}
  />
);

const footer = (collections: Collection[]) => (
  <Footer
    collections={collections}
    whatsappNumber={sampleStore.whatsappNumber}
    deliveryAreaText={sampleStore.deliveryAreaText}
    responseHours={sampleStore.responseHours}
    businessLine={sampleStore.businessLine}
  />
);

async function HeaderSlot() {
  return header(await getNavCollections());
}

async function FooterSlot() {
  return footer(await getNavCollections());
}

const cartDrawer = (featured: Awaited<ReturnType<typeof getProducts>>) => (
  <CartDrawer
    featured={featured.state === "ok" ? featured.data : []}
    checkoutUrl={sampleStore.checkoutUrl}
    whatsappNumber={sampleStore.whatsappNumber}
    mixedCartNote={sampleStore.mixedCartNote}
  />
);

async function CartSlot() {
  return cartDrawer(await getProducts(4));
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar text={sampleStore.announcementText} />
      <Suspense fallback={header([])}>
        <HeaderSlot />
      </Suspense>
      {children}
      <Suspense fallback={footer([])}>
        <FooterSlot />
      </Suspense>
      <Suspense fallback={cartDrawer({ state: "ok", data: [] })}>
        <CartSlot />
      </Suspense>
    </CartProvider>
  );
}
