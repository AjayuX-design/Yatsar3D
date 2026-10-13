import { Check, X } from "@/components/ui/Icons";

function List({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="mb-3 t-label text-graphite">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 t-small text-ink lg:t-body">
            <span className="mt-0.5 shrink-0 text-graphite" aria-hidden="true">
              {icon}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two short lists. Either one hides when empty. */
export function IncludedList({ included, notIncluded }: { included: string[]; notIncluded: string[] }) {
  if (!included.length && !notIncluded.length) return null;
  return (
    <section aria-labelledby="included-heading">
      <h2 id="included-heading" className="t-h3 text-ink">
        What is included
      </h2>
      <div className="mt-4 space-y-6">
        <List title="In the box" items={included} icon={<Check className="size-4" />} />
        <List title="Not included" items={notIncluded} icon={<X className="size-4" />} />
      </div>
    </section>
  );
}
