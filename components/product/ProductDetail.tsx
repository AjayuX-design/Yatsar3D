"use client";

import { useEffect, useRef, useState } from "react";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { StatusChip, type Status } from "@/components/ui/Chip";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Check } from "@/components/ui/Icons";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { FulfilmentBox } from "@/components/product/FulfilmentBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { VariantSelector } from "@/components/product/VariantSelector";
import { defaultSelection, findVariant } from "@/lib/product/select";
import { formatDays } from "@/lib/format/leadtime";
import { productEnquiryMessage } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart/CartProvider";
import type { Days, Product } from "@/lib/types";

type Store = {
  whatsappNumber?: string;
  deliveryAreaText: string;
  defaultDeliveryDays?: Days;
  /** Absolute URL of this product, for the WhatsApp message. */
  productUrl: string;
};

type CartState = "idle" | "adding" | "added";

/**
 * Everything on the product page that depends on the chosen variant.
 * Order follows the blueprint: gallery, title and price, variants, button,
 * fulfilment, specs, scale, included, description, accordions, custom card.
 */
export function ProductDetail({ product, store }: { product: Product; store: Store }) {
  const [selection, setSelection] = useState(() => defaultSelection(product));
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<CartState>("idle");
  const [stickyVisible, setStickyVisible] = useState(false);
  const { add: addLine, openCart, open: cartOpen } = useCart();
  const buyButton = useRef<HTMLDivElement>(null);

  const variant = findVariant(product, selection);
  const canBuy = !!variant?.availableForSale;
  const maxQty = product.fulfilment === "ready_stock" ? variant?.quantityAvailable : undefined;

  // Show the sticky bar once the main button has scrolled above the screen.
  // A scroll listener, not IntersectionObserver, so a jump past the button
  // (anchor link, fast flick) is still caught.
  useEffect(() => {
    const el = buyButton.current;
    if (!el) return;
    const update = () => {
      const buttonAbove = el.getBoundingClientRect().bottom < 0;
      // Step aside once the footer comes into view, so the bar never covers it.
      const footer = document.querySelector("footer");
      const atFooter = !!footer && footer.getBoundingClientRect().top < window.innerHeight - 72;
      setStickyVisible(buttonAbove && !atFooter);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Keep quantity inside stock when the variant changes.
  const qtyShown = maxQty ? Math.min(qty, maxQty) : qty;

  // Adds the line, then opens the cart. The cart is a sample client cart for now;
  // it will call cartLinesAdd on Shopify.
  const addToCart = async () => {
    if (!variant || cart !== "idle") return;
    setCart("adding");
    await addLine(product, variant, qtyShown);
    setCart("added");
    openCart();
    setTimeout(() => setCart("idle"), 1500);
  };

  const status: Status = !canBuy
    ? "sold-out"
    : product.fulfilment === "made_to_order"
      ? "made-to-order"
      : "ready";

  const variantLabel = product.options.length ? variant?.title : undefined;
  const addLabel = !canBuy ? "Sold out" : cart === "adding" ? "Adding" : cart === "added" ? "Added" : "Add to cart";
  const addButton = (block: boolean, className?: string) => (
    <Button
      block={block}
      className={className}
      disabled={!canBuy}
      loading={cart === "adding"}
      icon={cart === "added" ? <Check className="size-5" aria-hidden="true" /> : undefined}
      onClick={addToCart}
    >
      {addLabel}
    </Button>
  );

  const price = variant ? (
    <Price size="l" price={variant.price} compareAt={variant.compareAt} />
  ) : null;

  const d = product.dimensions;
  const size = d?.lengthMm && d.widthMm && d.heightMm ? `${d.lengthMm} × ${d.widthMm} × ${d.heightMm} mm` : null;
  const delivery = product.deliveryDays ?? store.defaultDeliveryDays;
  const production = variant?.productionDays ?? product.productionDays;
  const weight = variant?.weightG ?? product.weightG;
  const bullets = (items: string[]) => (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );

  const accordionItems: AccordionItem[] = [
    {
      id: "about",
      title: "Description",
      content: (
        <div className="space-y-3">
          {product.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ),
    },
    {
      id: "details",
      title: "Size and what is included",
      content: (
        <div className="space-y-4">
          {(size || weight) && (
            <p className="text-ink">
              {[size && `Size: ${size}`, weight && `Weight: ${weight} g`].filter(Boolean).join(". ")}
            </p>
          )}
          {product.included.length > 0 && (
            <div>
              <p className="mb-1.5 t-label text-ink">In the box</p>
              {bullets(product.included)}
            </div>
          )}
          {product.notIncluded.length > 0 && (
            <div>
              <p className="mb-1.5 t-label text-ink">Not included</p>
              {bullets(product.notIncluded)}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "care",
      title: "Care and print finish",
      content: (
        <div className="space-y-3">
          <p>{product.careNote ?? "Wipe with a dry or slightly damp cloth. Keep away from direct sunlight and heat."}</p>
          <p>
            {product.printNote ??
              "Fine layer lines are part of a printed surface. Small variations between prints are normal."}
          </p>
        </div>
      ),
    },
    {
      id: "delivery",
      // Draft wording. Final delivery and returns policy is a pending business decision.
      title: "Delivery and returns",
      content: (
        <div className="space-y-3">
          <p>
            {product.fulfilment === "ready_stock" ? "Ships in" : "Printed to order in"}{" "}
            {production ? formatDays(production) : "a few days"}.
            {delivery && ` Delivery takes ${formatDays(delivery)} after dispatch.`}
          </p>
          <p>{store.deliveryAreaText} Delivery charges are shown at checkout.</p>
          <p>
            Returns: if your item arrives damaged or is not what you ordered, message us on WhatsApp within 48
            hours with photos. We will replace it or refund you.
          </p>
          {product.customAvailable && <p>Custom orders are made for you and cannot be returned.</p>}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
        <div>
          <div className="lg:sticky lg:top-6">
            <ProductGallery images={product.images} title={product.title} />
          </div>
        </div>

        <div className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
          <header>
            <h1 className="t-h1 text-ink">{product.title}</h1>
            {(product.material || product.finish) && (
              <p className="mt-1.5 t-small text-graphite">
                {[product.material, product.finish].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              {price}
              <StatusChip status={status} />
            </div>
          </header>

          {/* Price and options belong together: 24px, not the 32px between blocks. */}
          <VariantSelector
            className="-mt-2"
            product={product}
            selection={selection}
            onChange={setSelection}
          />

          <div ref={buyButton} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {canBuy && (
              <QuantityStepper
                className="self-start sm:self-auto"
                value={qtyShown}
                onChange={setQty}
                max={maxQty}
              />
            )}
            <div className="flex-1">{addButton(true)}</div>
          </div>
          {variant && !canBuy && (
            <p className="t-small text-graphite">
              This option is not available right now.
              {product.customAvailable && " You can ask us about a custom one below."}
            </p>
          )}

          <FulfilmentBox
            fulfilment={product.fulfilment}
            productionDays={variant?.productionDays ?? product.productionDays}
            deliveryDays={product.deliveryDays}
            defaultDeliveryDays={store.defaultDeliveryDays}
            deliveryAreaText={store.deliveryAreaText}
            whatsappNumber={store.whatsappNumber}
          />

          <Accordion items={accordionItems} defaultOpenId="about" single={false} />
        </div>
      </div>

      <div className="mt-12 space-y-16 lg:mx-auto lg:max-w-[960px]">
        {product.customAvailable && (
          <EnquiryCta
            variant="card"
            number={store.whatsappNumber}
            message={productEnquiryMessage({
              title: product.title,
              variant: variantLabel,
              url: store.productUrl,
            })}
          />
        )}
      </div>

      <StickyBuyBar
        // Hidden while the cart is open, and when there is nothing to buy.
        visible={stickyVisible && canBuy && !cartOpen}
        price={variant && <Price price={variant.price} compareAt={variant.compareAt} />}
        summary={variantLabel}
      >
        {addButton(false, "h-11 px-5")}
      </StickyBuyBar>
    </>
  );
}
