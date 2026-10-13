import { cn } from "@/lib/cn";

/** Large step numbers. Vertical on mobile, a row on desktop. */
export function NumberedSteps({
  steps,
  className,
}: {
  steps: Array<{ title: string; text: string }>;
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-6 lg:grid-cols-4 lg:gap-8", className)}>
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4 lg:block">
          <span className="font-heading text-[32px] font-semibold leading-none text-kiln [font-variant-numeric:tabular-nums] lg:block">
            {i + 1}
          </span>
          <div className="lg:mt-3">
            <h3 className="t-label text-ink">{s.title}</h3>
            <p className="mt-1 t-small text-graphite">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
