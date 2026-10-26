import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** A dead end that points somewhere: home, the shop, or search. Used by every not-found screen. */
export function NotFoundView() {
  return (
    <div className="mx-auto max-w-[520px] px-4 py-16 text-center lg:py-24">
      <p className="font-heading text-[64px] font-semibold leading-none tracking-tight text-kiln [font-variant-numeric:tabular-nums] lg:text-[80px]">
        404
      </p>
      <h1 className="mt-6 t-h1 text-ink">This page is not here</h1>
      <p className="mt-3 t-body text-graphite">
        The link may be old, or the product may have moved. Try the shop, or search for what you were after.
      </p>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button href="/collections/all">Shop all products</Button>
        <Button href="/search" variant="secondary">
          Search
        </Button>
      </div>
      <p className="mt-6 t-small text-graphite">
        <Link href="/" className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-[3px]">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}
