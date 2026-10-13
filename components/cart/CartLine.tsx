"use client";

import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { StatusChip } from "@/components/ui/Chip";
import { formatMoney } from "@/lib/format/money";
import { lineTotals, type CartLine as Line, type Discount } from "@/lib/cart/cart";

/**
 * One cart line: photo, title and option, fulfilment chip, stepper, price.
 * With a discount, the full price is struck through and the new one shown.
 */
export function CartLine({
  line,
  discount,
  busy,
  onQuantity,
  onRemove,
  onNavigate,
}: {
  line: Line;
  discount?: Discount | null;
  busy: boolean;
  onQuantity: (q: number) => void;
  onRemove: () => void;
  onNavigate: () => void;
}) {
  const totals = lineTotals(line, discount);
  return (
    <li className="flex gap-4 border-b border-line py-4 last:border-b-0">
      <Link
        href={`/products/${line.handle}`}
        onClick={onNavigate}
        className="relative block aspect-[4/5] w-[72px] shrink-0 self-start overflow-hidden rounded-ctl bg-mist"
        aria-hidden="true"
        tabIndex={-1}
      >
        <ImagePlaceholder src={line.imageSrc} alt="" label="" sizes="72px" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${line.handle}`}
              onClick={onNavigate}
              className="line-clamp-2 text-[15px] font-medium leading-5 text-ink hover:underline hover:underline-offset-[3px]"
            >
              {line.title}
            </Link>
            {line.variantTitle && <p className="mt-0.5 t-small text-graphite">{line.variantTitle}</p>}
          </div>
          <p className="shrink-0 text-right t-price-s text-ink">
            {totals.discounted && (
              <s className="block t-caption font-normal text-graphite [font-variant-numeric:tabular-nums]">
                {formatMoney(totals.full)}
              </s>
            )}
            {formatMoney(totals.after)}
          </p>
        </div>

        <StatusChip
          className="mt-2 h-6 px-2.5"
          status={line.fulfilment === "made_to_order" ? "made-to-order" : "ready"}
        />

        <div className="mt-3 flex items-center justify-between">
          <QuantityStepper
            value={line.quantity}
            onChange={onQuantity}
            max={line.maxQuantity}
            loading={busy}
            label={`Quantity for ${line.title}`}
          />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex min-h-11 items-center px-1 t-label text-graphite underline underline-offset-[3px] hover:text-ink"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
