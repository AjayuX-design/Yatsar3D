import { Star } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/**
 * Read-only stars. Filled stars are clipped to the exact value, so 4.5 shows
 * four and a half. The text label is for screen readers; the stars are decoration.
 */
export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  const row = (filled: boolean) => (
    <span className="flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} width={size} height={size} aria-hidden="true" className={cn("shrink-0", filled ? "fill-current" : "")} />
      ))}
    </span>
  );
  return (
    <span className={cn("relative inline-flex", className)} role="img" aria-label={`${value} out of 5 stars`}>
      <span className="text-field">{row(false)}</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-dot" style={{ width: `${pct}%` }}>
        {row(true)}
      </span>
    </span>
  );
}
