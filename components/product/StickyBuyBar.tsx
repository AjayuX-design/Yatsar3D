import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Mobile only. A light floating bar that rises once the main Add to cart
 * button has scrolled out of view. Rounded, inset from the screen edges, with
 * a soft shadow instead of a hard top border. Hidden from keyboards and screen
 * readers while off screen.
 */
export function StickyBuyBar({
  visible,
  price,
  summary,
  children,
}: {
  visible: boolean;
  price: ReactNode;
  summary?: string;
  children: ReactNode;
}) {
  return (
    <div
      inert={!visible}
      className={cn(
        "fixed inset-x-3 z-30 lg:hidden",
        "bottom-[calc(12px+env(safe-area-inset-bottom))]",
        "rounded-sheet border border-line/70 bg-surface/90 py-2 pl-4 pr-2 backdrop-blur-md",
        "shadow-[0_8px_30px_rgb(23_23_23/0.10)]",
        "transition-[transform,opacity] duration-[250ms] ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-[calc(100%+24px)] opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="min-w-0 flex-1 leading-none">
          {price}
          {summary && <p className="mt-0.5 truncate t-caption text-graphite">{summary}</p>}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}
