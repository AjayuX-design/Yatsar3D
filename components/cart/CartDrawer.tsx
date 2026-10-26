"use client";

import { Button } from "@/components/ui/Button";
import { InfoCard } from "@/components/ui/InfoCard";
import { Sheet } from "@/components/ui/Sheet";
import { X } from "@/components/ui/Icons";
import { CartLine } from "@/components/cart/CartLine";
import { DiscountField } from "@/components/cart/DiscountField";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { ProductCard } from "@/components/product/ProductCard";
import { hasMixedFulfilment } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import { formatMoney } from "@/lib/format/money";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

const row = "flex items-baseline justify-between gap-4";

/**
 * Mobile: tall bottom sheet. Desktop: 420px drawer on the right.
 * Order: header, lines, mixed-cart notice, discount, summary, then the pinned
 * Check out button. Checkout is disabled while the cart is updating, so it never
 * opens with stale data. No free-delivery progress (not enabled at launch).
 */
export function CartDrawer({
  featured,
  checkoutUrl,
  whatsappNumber,
  mixedCartNote,
}: {
  featured: Product[];
  checkoutUrl: string;
  whatsappNumber?: string;
  mixedCartNote: string;
}) {
  const { lines, discount, totals, open, closeCart, updating, removed, error, checkoutUrl: cartCheckoutUrl, setQuantity, remove, undoRemove, applyCode, removeCode } =
    useCart();
  const empty = lines.length === 0;

  return (
    <Sheet open={open} onClose={closeCart} label="Cart" variant="cart">
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-4 pr-2">
          <h2 className="t-h3 text-ink">
            Cart <span className="font-sans font-normal text-graphite [font-variant-numeric:tabular-nums]">({totals.count})</span>
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="grid size-11 place-items-center rounded-ctl hover:bg-mist"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {empty ? (
            <div className="py-10">
              <p className="t-h3 text-ink">Your cart is empty</p>
              <p className="mt-2 t-small text-graphite">Pick something from the shop, or ask us for a custom print.</p>
              <Button href="/collections/all" onClick={closeCart} block className="mt-6">
                Shop all products
              </Button>
              <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6">
                {featured.slice(0, 4).map((p) => (
                  <div key={p.handle} onClick={closeCart}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              <EnquiryCta
                variant="link"
                className="mt-6"
                number={whatsappNumber}
                message={generalEnquiryMessage}
              />
            </div>
          ) : (
            <>
              <ul>
                {lines.map((line) => (
                  <CartLine
                    key={line.id}
                    line={line}
                    discount={discount}
                    busy={updating}
                    onQuantity={(q) => setQuantity(line.id, q)}
                    onRemove={() => remove(line.id)}
                    onNavigate={closeCart}
                  />
                ))}
              </ul>

              {hasMixedFulfilment(lines) && (
                <InfoCard variant="amber" title="Ready and made-to-order items" className="mt-2">
                  {mixedCartNote}
                </InfoCard>
              )}

              <div className="py-6">
                <DiscountField discount={discount} onApply={applyCode} onRemove={removeCode} />
              </div>
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="shrink-0 bg-error-tint px-4 py-2 t-small text-error">
            {error}
          </p>
        )}

        {removed && (
          <div className="flex shrink-0 items-center justify-between gap-3 bg-ink px-4 py-2 t-small text-surface">
            <span className="min-w-0 truncate">Removed {removed.title}</span>
            <button type="button" onClick={undoRemove} className="min-h-11 shrink-0 px-2 t-label underline underline-offset-[3px]">
              Undo
            </button>
          </div>
        )}

        {!empty && (
          <div className="shrink-0 space-y-3 border-t border-line bg-surface px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-4">
            <dl className="space-y-2 t-small">
              <div className={row}>
                <dt className="text-graphite">Subtotal</dt>
                <dd className="t-value text-ink">{formatMoney(totals.subtotal)}</dd>
              </div>
              {totals.hasDiscount && (
                <div className={row}>
                  <dt className="text-graphite">Discount</dt>
                  <dd className="t-value text-moss">-{formatMoney(totals.discount)}</dd>
                </div>
              )}
              <div className={`${row} border-t border-line pt-2`}>
                <dt className="t-label text-ink">Estimated total</dt>
                <dd className="t-price-s text-ink">{formatMoney(totals.total)}</dd>
              </div>
            </dl>
            <p className="t-caption text-graphite">
              Shipping and taxes are calculated at checkout. Secure checkout by Shopify.
            </p>

            <Button href={cartCheckoutUrl ?? checkoutUrl} disabled={updating} loading={updating} block>
              Check out
            </Button>
            <div className="-mb-1 flex items-center justify-between gap-2">
              <button type="button" onClick={closeCart} className="min-h-11 whitespace-nowrap px-1 t-label text-ink underline underline-offset-[3px]">
                Continue shopping
              </button>
              <EnquiryCta
                variant="link"
                label="Ask on WhatsApp"
                number={whatsappNumber}
                message={generalEnquiryMessage}
              />
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
