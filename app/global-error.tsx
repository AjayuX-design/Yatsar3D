"use client";

import "./globals.css";

/**
 * The last safety net: it replaces the whole page, including the layout, so it
 * brings its own html and body. Kept plain on purpose.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <main className="mx-auto max-w-[520px] px-4 py-24 text-center">
          <h1 className="t-h1 text-ink">Something went wrong</h1>
          <p className="mt-3 t-body text-graphite">Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-ctl bg-ink px-6 text-[16px] font-medium text-surface"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
