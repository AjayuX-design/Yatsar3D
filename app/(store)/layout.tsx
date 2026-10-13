import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart/CartProvider";
import { sampleStore } from "@/lib/sample-data";
import { navCollections } from "@/lib/sample-collections";
import { sampleProducts } from "@/lib/sample-products";

/** The storefront shell: announcement, header, page, footer, and the cart. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar text={sampleStore.announcementText} />
      <Header
        collections={navCollections}
        whatsappNumber={sampleStore.whatsappNumber}
        deliveryAreaText={sampleStore.deliveryAreaText}
      />
      {children}
      <Footer
        collections={navCollections}
        whatsappNumber={sampleStore.whatsappNumber}
        deliveryAreaText={sampleStore.deliveryAreaText}
        responseHours={sampleStore.responseHours}
        businessLine={sampleStore.businessLine}
      />
      <CartDrawer
        featured={sampleProducts}
        checkoutUrl={sampleStore.checkoutUrl}
        whatsappNumber={sampleStore.whatsappNumber}
        mixedCartNote={sampleStore.mixedCartNote}
      />
    </CartProvider>
  );
}
