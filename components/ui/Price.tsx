import { cn } from "@/lib/cn";
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
  className,
}: {
  price: Money;
  compareAt?: Money | null;
  size?: "l" | "s";
  /** Prefix with "From", for a price range. */
  from?: boolean;
  /** Greyed price, for sold-out items. */
  muted?: boolean;
  className?: string;
}) {
  const showCompare = !!compareAt && Number(compareAt.amount) > Number(price.amount);
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
    </p>
  );
}
