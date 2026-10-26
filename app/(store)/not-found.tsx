import type { Metadata } from "next";
import { NotFoundView } from "@/components/ui/NotFoundView";

export const metadata: Metadata = { title: "Page not found | Yatsar 3D", robots: { index: false, follow: false } };

/** A missing product or collection, shown inside the normal shop header and footer. */
export default function StoreNotFound() {
  return (
    <main id="main" tabIndex={-1}>
      <NotFoundView />
    </main>
  );
}
