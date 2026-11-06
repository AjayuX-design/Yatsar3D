import { cn } from "@/lib/cn";
import { amountSaved, percentOff } from "@/lib/format/discount";
import { formatMoney, type Money } from "@/lib/format/money";

/**
 * Price from Shopify money values. Shows the compare-at price struck through
 * only when Shopify sends one and it is higher than the price.
 */
export function Price({
  price,
  compareAt,
  size = "s",
  from = false,
  muted = false,
  saving,
  className,
}: {
  price: Money;
  compareAt?: Money | null;
  size?: "l" | "s";
  /** Prefix with "From", for a price range. */
  from?: boolean;
  /** Greyed price, for sold-out items. */
  muted?: boolean;
  /** chip: a small "19% off" beside the price. line: a "You save" line under it. Only shown for a real discount. */
  saving?: "chip" | "line";
  className?: string;
}) {
  const showCompare = !!compareAt && Number(compareAt.amount) > Number(price.amount);
  const percent = percentOff(price, compareAt);
  const saved = amountSaved(price, compareAt);
  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-2",
        muted ? "text-graphite" : "text-ink",
        size === "l" ? "t-price-l" : "t-price-s",
        className,
      )}
    >
      {from && <span className="t-small font-normal text-graphite">From</span>}
      <span>
        <span className="sr-only">Price: </span>
        {formatMoney(price)}
      </span>
      {showCompare && (
        <s className="t-small font-normal text-graphite [font-variant-numeric:tabular-nums]">
          <span className="sr-only">Original price: </span>
          {formatMoney(compareAt!)}
        </s>
      )}
      {showCompare && saving === "chip" && percent !== null && (
        <span className="rounded-pill bg-amber-tint px-2 py-0.5 t-caption font-semibold text-amber-text [font-variant-numeric:tabular-nums]">{percent}% off</span>
      )}
      {showCompare && saving === "line" && percent !== null && saved && (
        <span className="basis-full t-small font-medium text-amber-text [font-variant-numeric:tabular-nums]">
          You save {formatMoney(saved)} ({percent}% off)
        </span>
      )}
    </p>
  );
}
