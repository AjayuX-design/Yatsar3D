import Link from "next/link";

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-2 t-small text-graphite">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${i}-${item.label}`} className={last ? "min-w-0 truncate text-ink" : "shrink-0"}>
              {item.href && !last ? (
                <Link href={item.href} className="inline-flex min-h-11 items-center underline-offset-[3px] hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              )}
              {!last && <span aria-hidden="true" className="ml-2">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
