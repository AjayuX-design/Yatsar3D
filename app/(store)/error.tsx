"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/** Something broke while drawing a page. The shop header and footer stay; the page body is replaced. */
export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The digest is safe to log: it is an id, not the message.
    console.error("[store] page error", error.digest ?? "");
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto max-w-[520px] px-4 py-16 text-center lg:py-24">
      <h1 className="t-h1 text-ink">Something went wrong</h1>
      <p className="mt-3 t-body text-graphite">We could not show this page. Please try again, or head back to the shop.</p>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button onClick={reset}>Try again</Button>
        <Button href="/collections/all" variant="secondary">
          Shop all products
        </Button>
      </div>
    </main>
  );
}
