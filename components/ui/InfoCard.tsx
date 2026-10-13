import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AlertTriangle, Info, MapPin } from "@/components/ui/Icons";

export type InfoCardVariant = "neutral" | "slate" | "amber";

const styles: Record<InfoCardVariant, { box: string; icon: string; Default: typeof Info }> = {
  neutral: { box: "bg-mist", icon: "text-graphite", Default: Info },
  slate: { box: "bg-slate-tint", icon: "text-slate", Default: MapPin },
  amber: { box: "bg-amber-tint", icon: "text-amber-text", Default: AlertTriangle },
};

/**
 * Light grey panel with an icon. neutral for general facts, slate for the delivery
 * area, amber for warnings such as the mixed-cart note.
 * Use at most one tinted card per section.
 */
export function InfoCard({
  variant = "neutral",
  title,
  icon,
  children,
  className,
}: {
  variant?: InfoCardVariant;
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const s = styles[variant];
  return (
    <div className={cn("flex gap-3 rounded-card p-4", s.box, className)}>
      <span className={cn("mt-0.5 shrink-0", s.icon)} aria-hidden="true">
        {icon ?? <s.Default className="size-5" />}
      </span>
      <div className="min-w-0">
        {title && <p className="t-label text-ink">{title}</p>}
        <div className={cn("t-small text-ink", title && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}
