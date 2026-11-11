import { StatusChip, type Status } from "@/components/ui/Chip";

/**
 * The badges that sit on a product photo, top-left, the same everywhere
 * (cards, product page, home banners): a black "% off" pill for a genuine
 * discount, and the white status pill for "Made to order" or "Sold out".
 * "Ready to ship" is the normal case, so it is never shown.
 */
export function ImageBadges({ percent, status }: { percent?: number | null; status?: Status }) {
  const showStatus = status && status !== "ready";
  if (!percent && !showStatus) return null;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
      {!!percent && (
        <span className="inline-flex h-6 items-center rounded-pill bg-ink px-3 t-caption font-semibold text-surface [font-variant-numeric:tabular-nums]">
          <span className="sr-only">Sale: </span>
          {percent}% off
        </span>
      )}
      {showStatus && <StatusChip status={status} tone="overlay" />}
    </div>
  );
}
