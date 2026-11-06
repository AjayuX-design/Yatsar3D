import { Check } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { stageStep, trackerSteps, type Stage } from "@/lib/customer/orders";

/** Order placed, Shipped, Delivered. Only steps Shopify can confirm; a cancelled order shows no progress. */
export function OrderTracker({ stage }: { stage: Stage }) {
  const at = stageStep[stage];
  const cancelled = stage === "cancelled";
  return (
    <ol aria-label="Order progress" className="grid grid-cols-3">
      {trackerSteps.map((label, i) => {
        const done = !cancelled && i <= at;
        const current = !cancelled && i === at;
        return (
          <li key={label} aria-current={current ? "step" : undefined} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span aria-hidden="true" className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", !cancelled && i <= at ? "bg-ink" : "bg-line")} />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 place-items-center rounded-pill border-2",
                done ? "border-ink bg-ink text-surface" : "border-line bg-surface text-graphite",
              )}
            >
              {done ? <Check className="size-4" aria-hidden="true" /> : <span className="t-caption">{i + 1}</span>}
            </span>
            <span className={cn("mt-2 t-small", current ? "font-medium text-ink" : "text-graphite")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
