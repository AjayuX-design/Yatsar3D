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
import { IncludedList } from "@/components/product/IncludedList";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ScaleImage } from "@/components/product/ScaleImage";
import { SpecTable } from "@/components/product/SpecTable";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { VariantSelector } from "@/components/product/VariantSelector";
import { defaultSelection, findVariant } from "@/lib/product/select";
import { buildSpecRows } from "@/lib/product/spec";
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

  const accordionItems: AccordionItem[] = [
    {
      id: "material",
      title: product.material ? "Material and care" : "Care",
      content: product.careNote ?? "Care notes are added per product.",
    },
    {
      id: "finish",
      title: "About the print finish",
      content:
        product.printNote ??
        "Fine layer lines are part of a printed surface. Small variations between prints are normal.",
    },
    {
      id: "delivery",
      // Placeholder wording. Final delivery and returns text is a pending business decision.
      title: "Delivery and returns",
      content: "Placeholder text. Final delivery and returns wording is pending.",
    },
  ];

  return (
    <>
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-6">
            <ProductGallery images={product.images} title={product.title} />
          </div>
        </div>

        <div className="mt-6 space-y-8 lg:col-span-5 lg:mt-0">
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

          <div className="pt-4">
            <SpecTable rows={buildSpecRows(product, variant)} />
          </div>
        </div>
      </div>

      {/* Rhythm: 64px between groups, 48px inside the facts group, 16px from a heading to its content. */}
      <div className="mt-16 space-y-16 lg:mx-auto lg:max-w-[960px]">
        <ScaleImage
          image={product.images.find((i) => i.kind === "scale")}
          caption={product.scaleCaption}
        />
        <div className="grid gap-12 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
          <IncludedList included={product.included} notIncluded={product.notIncluded} />
          <section aria-labelledby="about">
            <h2 id="about" className="t-h3 text-ink">
              About this product
            </h2>
            <div className="mt-4 space-y-4">
              {product.paragraphs.map((p) => (
                <p key={p} className="max-w-[56ch] t-body text-graphite lg:t-body-l">
                  {p}
                </p>
              ))}
            </div>
          </section>
        </div>
        <Accordion items={accordionItems} />
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
