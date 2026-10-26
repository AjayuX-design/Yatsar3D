import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const chipBase =
  "inline-flex h-7 items-center gap-2 rounded-pill border border-line px-3 t-caption whitespace-nowrap";

/** Spec chip, for facts like PETG or 18 cm. No dot. */
export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(chipBase, "bg-mist text-ink", className)}>{children}</span>;
}

export type Status = "ready" | "made-to-order" | "sold-out";

const statusStyles: Record<Status, { label: string; chip: string; dot: string }> = {
  ready: { label: "Ready to ship", chip: "bg-moss-tint text-moss", dot: "bg-moss" },
  "made-to-order": {
    label: "Made to order",
    chip: "bg-amber-tint text-amber-text",
    dot: "bg-amber-dot",
  },
  "sold-out": { label: "Sold out", chip: "bg-mist text-graphite", dot: "bg-graphite" },
};

/** Stock status. Always dot plus text, never colour alone. */
export function StatusChip({
  status,
  tone = "tint",
  className,
}: {
  status: Status;
  /** overlay: compact white pill for sitting on a photo. Dot carries the colour. */
  tone?: "tint" | "overlay";
  className?: string;
}) {
  const s = statusStyles[status];
  if (tone === "overlay") {
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center gap-2 rounded-pill bg-surface px-3 t-caption whitespace-nowrap",
          status === "sold-out" ? "text-graphite" : "text-ink",
          className,
        )}
      >
        <span aria-hidden="true" className={cn("size-2 rounded-pill", s.dot)} />
        {s.label}
      </span>
    );
  }
  return (
    <span className={cn(chipBase, s.chip, className)}>
      <span aria-hidden="true" className={cn("size-2 rounded-pill", s.dot)} />
      {s.label}
    </span>
  );
}
