"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CUSTOM_ORDERS_HANDLE, categoryHref } from "@/lib/categories";
import { Sheet } from "@/components/ui/Sheet";
import { X } from "@/components/ui/Icons";
import { Wordmark } from "@/components/layout/Wordmark";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { mainNav } from "@/components/layout/nav";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import type { Collection } from "@/lib/types";

const row = "flex min-h-14 items-center border-b border-line t-body font-medium text-ink";

/** Full-screen menu. 56px rows. WhatsApp and the delivery area sit at the bottom. */
export function MobileMenu({
  open,
  onClose,
  collections,
  whatsappNumber,
  deliveryAreaText,
}: {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
  whatsappNumber?: string;
  deliveryAreaText: string;
}) {
  const pathname = usePathname();
  // The page you are on is marked, so the menu also tells you where you are.
  const current = (href: string) => (pathname === href ? ({ "aria-current": "page" } as const) : {});
  return (
    <Sheet open={open} onClose={onClose} label="Menu" variant="menu">
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-4 pr-2">
          <Wordmark />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-ctl hover:bg-mist"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-4">
          <Link href="/collections/all" className={row} onClick={onClose} {...current("/collections/all")}>
            Shop all
          </Link>
          {collections
            .filter((c) => c.handle !== CUSTOM_ORDERS_HANDLE) // Custom orders is listed below with the other links
            .map((c) => (
            <Link key={c.handle} href={categoryHref(c.handle)} className={`${row} pl-4 font-normal text-graphite`} onClick={onClose} {...current(categoryHref(c.handle))}>
              {c.title}
            </Link>
          ))}
          {mainNav.slice(1).map((l) => (
            <Link key={l.href} href={l.href} className={row} onClick={onClose} {...current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-line p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
          <p className="t-small text-graphite">{deliveryAreaText}</p>
          <WhatsAppButton number={whatsappNumber} message={generalEnquiryMessage} />
        </div>
      </div>
    </Sheet>
  );
}
