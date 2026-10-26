import type { Metadata } from "next";
import { NotFoundView } from "@/components/ui/NotFoundView";
import { Wordmark } from "@/components/layout/Wordmark";

export const metadata: Metadata = { title: "Page not found | Yatsar 3D", robots: { index: false, follow: false } };

/**
 * Any address that matches no page. It sits outside the shop layout, so it draws
 * its own small header instead of the full navigation.
 */
export default function RootNotFound() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-center px-4 lg:h-[72px] lg:justify-start lg:px-8">
          <Wordmark />
        </div>
      </header>
      <main>
        <NotFoundView />
      </main>
    </>
  );
}
