"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag } from "@/components/ui/Icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Wordmark } from "@/components/layout/Wordmark";
import { mainNav } from "@/components/layout/nav";
import { useCart } from "@/lib/cart/CartProvider";
import type { Collection } from "@/lib/types";

/**
 * Sticky header. Mobile: menu, wordmark, cart. Desktop: wordmark, links, cart.
 * Search: a field in the header on desktop, an icon on mobile. The cart count comes from the cart.
 */
export function Header({
  collections,
  whatsappNumber,
  deliveryAreaText,
}: {
  collections: Collection[];
  whatsappNumber?: string;
  deliveryAreaText: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totals, openCart } = useCart();

  const iconButton =
    "grid size-11 place-items-center rounded-ctl text-ink transition-colors duration-150 hover:bg-mist";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto grid h-14 max-w-[1200px] grid-cols-[88px_1fr_88px] items-center px-2 md:px-3 lg:flex lg:h-[72px] lg:px-8">
        <button
          type="button"
          aria-label="Open menu"
          className={`${iconButton} lg:hidden`}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>

        <Wordmark className="justify-self-center lg:justify-self-start" />

        <nav aria-label="Main" className="ml-12 hidden items-center gap-8 lg:flex">
          {mainNav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center t-label text-ink underline-offset-[6px] hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end lg:ml-auto lg:gap-3">
          <form action="/search" role="search" className="relative hidden lg:block">
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite" />
            <input
              id="header-search"
              name="q"
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Search"
              className="h-10 w-[200px] rounded-pill border border-line bg-mist/60 pl-9 pr-3 text-[14px] text-ink transition-[width] duration-200 placeholder:text-graphite focus:w-[260px] focus:bg-surface"
            />
          </form>
          <Link href="/search" aria-label="Search" className={`${iconButton} lg:hidden`}>
            <Search className="size-6" aria-hidden="true" />
          </Link>
          <button
            type="button"
            aria-label={`Cart, ${totals.count} ${totals.count === 1 ? "item" : "items"}`}
            className={`${iconButton} relative`}
            onClick={openCart}
          >
            <ShoppingBag className="size-6" aria-hidden="true" />
            {totals.count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-ink px-1 text-[11px] font-semibold leading-none text-surface [font-variant-numeric:tabular-nums]"
              >
                {totals.count > 9 ? "9+" : totals.count}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collections={collections}
        whatsappNumber={whatsappNumber}
        deliveryAreaText={deliveryAreaText}
      />
    </header>
  );
}
