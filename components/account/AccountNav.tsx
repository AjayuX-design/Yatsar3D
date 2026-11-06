import Link from "next/link";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/account", label: "Orders" },
  { href: "/account/addresses", label: "Saved addresses" },
];

/** Two tabs under the account heading. Plain links, so it works without JavaScript. */
export function AccountNav({ current }: { current: string }) {
  return (
    <nav aria-label="Account" className="mt-6 flex gap-2">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.href === current ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 items-center rounded-pill border px-4 t-label",
            t.href === current ? "border-ink bg-ink text-surface" : "border-line text-ink hover:border-graphite/50",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
