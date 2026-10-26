import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Wordmark } from "@/components/layout/Wordmark";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { policyLinks } from "@/components/layout/nav";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import { categoryHref } from "@/lib/categories";
import type { Collection } from "@/lib/types";

const linkClass = "inline-flex min-h-11 min-w-11 items-center t-small text-ink underline-offset-[3px] hover:underline";

/**
 * Brand and WhatsApp first, then link groups (accordions on mobile, columns on
 * desktop), then delivery area, and a legal bar. The business line is a
 * placeholder until trade name, city and GST details are decided.
 */
export function Footer({
  collections,
  whatsappNumber,
  deliveryAreaText,
  responseHours,
  businessLine,
}: {
  collections: Collection[];
  whatsappNumber?: string;
  deliveryAreaText: string;
  responseHours: string;
  businessLine: string;
}) {
  const groups = [
    {
      id: "shop",
      title: "Shop",
      links: [
        { label: "All products", href: "/collections/all" },
        ...collections.map((c) => ({ label: c.title, href: categoryHref(c.handle) })),
      ],
    },
    {
      id: "help",
      title: "Help",
      links: [
        { label: "FAQ", href: "/faq" },
        { label: "Delivery", href: "/delivery" },
        { label: "Custom prints", href: "/custom-print" },
      ],
    },
    { id: "policies", title: "Policies", links: policyLinks },
  ];

  const list = (links: { label: string; href: string }[]) => (
    <ul>
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className={linkClass}>
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-3">
            <Wordmark />
            <p className="mt-3 max-w-[320px] t-small text-graphite">
              Physical 3D-printed products, made in India. Size, material and timing on every page.
            </p>
            <div className="mt-6 max-w-[320px]">
              <WhatsAppButton number={whatsappNumber} message={generalEnquiryMessage} />
            </div>
          </div>

          {/* Mobile: accordions */}
          <div className="mt-10 lg:hidden">
            <Accordion
              single={false}
              items={groups.map((g) => ({ id: g.id, title: g.title, content: list(g.links) }))}
            />
          </div>

          {/* Desktop: columns */}
          <div className="hidden lg:col-span-5 lg:col-start-5 lg:grid lg:grid-cols-3 lg:gap-8">
            {groups.map((g) => (
              <div key={g.id}>
                <h2 className="mb-2 t-label text-graphite">{g.title}</h2>
                {list(g.links)}
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-1 lg:col-span-3 lg:col-start-10 lg:mt-0">
            <h2 className="mb-2 t-label text-graphite">Delivery and contact</h2>
            <p className="t-small text-ink">{deliveryAreaText}</p>
            <p className="t-small text-graphite">{responseHours}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 t-caption text-graphite lg:flex-row lg:justify-between">
          <p>© Yatsar 3D</p>
          <p>{businessLine}</p>
        </div>
      </div>
    </footer>
  );
}
