import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A calm message block for empty and error states.
 * tone "error" is for failures, "empty" is for nothing-to-show.
 */
export function StatePanel({
  title,
  children,
  action,
  tone = "empty",
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "empty" | "error";
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "mx-auto max-w-[480px] rounded-card px-6 py-12 text-center",
        tone === "error" ? "bg-error-tint" : "bg-mist",
        className,
      )}
    >
      <p className="t-h3 text-ink">{title}</p>
      {children && <div className="mt-2 t-small text-graphite">{children}</div>}
      {action && <div className="mt-6 flex flex-col items-center gap-1">{action}</div>}
    </div>
  );
}
