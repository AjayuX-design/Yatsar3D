import { StatusChip, type Status } from "@/components/ui/Chip";

/** The orange "% off" pill. One style everywhere; "lg" is for the home banner text. */
export function SaleBadge({ percent, size = "sm" }: { percent: number; size?: "sm" | "lg" }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-kiln-deep font-semibold text-surface [font-variant-numeric:tabular-nums] ${
        size === "lg" ? "h-8 px-4 text-[14px] leading-5" : "h-6 px-3 t-caption"
      }`}
    >
      <span className="sr-only">Sale: </span>
      {percent}% off
    </span>
  );
}

/**
 * The badges that sit on a product photo, top-left, the same everywhere
 * (cards, product page, home banners): an orange "% off" pill for a genuine
 * discount, and the white status pill for "Made to order" or "Sold out".
 * "Ready to ship" is the normal case, so it is never shown.
 */
export function ImageBadges({ percent, status }: { percent?: number | null; status?: Status }) {
  const showStatus = status && status !== "ready";
  if (!percent && !showStatus) return null;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
      {!!percent && <SaleBadge percent={percent} />}
      {showStatus && <StatusChip status={status} tone="overlay" />}
    </div>
  );
}
