import type { SpecRow } from "@/lib/product/spec";

/** "At a glance". Hides itself when there are no rows. Numbers are tabular. */
export function SpecTable({ rows, title = "At a glance" }: { rows: SpecRow[]; title?: string }) {
  if (!rows.length) return null;
  return (
    <section aria-label={title}>
      <h2 className="mb-2 t-h3 text-ink">{title}</h2>
      <dl className="border-b border-line">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 border-t border-line py-3">
            <dt className="t-small text-graphite">{r.label}</dt>
            <dd className="text-right t-spec text-ink">
              {r.value}
              {r.sub && <span className="block font-normal text-graphite">{r.sub}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
