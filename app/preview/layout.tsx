import { CartProvider } from "@/lib/cart/CartProvider";

/** The component preview shows real product cards, whose Add button needs a cart. A sample one is enough. */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider mode="sample">{children}</CartProvider>;
}
