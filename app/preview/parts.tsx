import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-line py-12 lg:py-24">
      <h2 className="t-h2 text-ink">{title}</h2>
      {note && <p className="mt-2 max-w-[560px] t-small text-graphite">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** A labelled demo cell. */
export function Demo({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <p className="mb-2 t-caption text-graphite">{label}</p>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 mt-12 first:mt-0 t-h3 text-ink">{children}</h3>;
}

/** WCAG relative luminance contrast, so the numbers on screen are real. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
