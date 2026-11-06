import { cn } from "@/lib/cn";
import { stageLabel, type Stage } from "@/lib/customer/orders";

const styles: Record<Stage, { chip: string; dot: string }> = {
  placed: { chip: "bg-amber-tint text-amber-text", dot: "bg-amber-dot" },
  shipped: { chip: "bg-slate-tint text-slate", dot: "bg-slate" },
  out_for_delivery: { chip: "bg-slate-tint text-slate", dot: "bg-slate" },
  delivered: { chip: "bg-moss-tint text-moss", dot: "bg-moss" },
  cancelled: { chip: "bg-mist text-graphite", dot: "bg-graphite" },
};

/** Where the order is, as a dot and words (never colour alone). */
export function OrderStageChip({ stage, className }: { stage: Stage; className?: string }) {
  const s = styles[stage];
  return (
    <span className={cn("inline-flex h-7 items-center gap-2 whitespace-nowrap rounded-pill border border-line px-3 t-caption", s.chip, className)}>
      <span aria-hidden="true" className={cn("size-2 rounded-pill", s.dot)} />
      {stageLabel[stage]}
    </span>
  );
}
