import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/components/reviews/AdminLogin";
import { AdminReview } from "@/components/reviews/AdminReview";
import { Button } from "@/components/ui/Button";
import { adminLogout } from "@/lib/reviews/actions";
import { adminPassword, isAdmin } from "@/lib/reviews/admin";
import { allReviews, storeKind } from "@/lib/reviews/store";

export const metadata: Metadata = { title: "Reviews admin | Yatsar 3D", robots: { index: false, follow: false } };

/** Private page for the owner: every review, with reply, hide and delete. Not linked anywhere. */
export default function AdminReviewsPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-[860px] px-4 pb-8 pt-6 md:px-6 lg:px-8">
      <h1 className="t-h1 text-ink">Reviews</h1>
      <Suspense fallback={<p className="mt-6 t-small text-graphite">Loading</p>}>
        <Content />
      </Suspense>
    </main>
  );
}

async function Content() {
  if (!adminPassword()) {
    return <p className="mt-6 max-w-[56ch] t-body text-graphite">Owner sign-in is not set up yet. Add ADMIN_PASSWORD in Vercel, then redeploy.</p>;
  }
  if (!(await isAdmin())) {
    return (
      <>
        <p className="mt-3 t-body text-graphite">Sign in to read and reply to reviews.</p>
        <AdminLogin />
      </>
    );
  }
  if (storeKind() === "none") {
    return <p className="mt-6 max-w-[56ch] t-body text-graphite">No review database is connected yet. Add Upstash Redis from the Vercel Marketplace, then redeploy.</p>;
  }
  const reviews = await allReviews();
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="t-body text-graphite [font-variant-numeric:tabular-nums]">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}, newest first. New reviews go live at once.
        </p>
        <form action={adminLogout}>
          <Button type="submit" size="sm" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
      {reviews.length === 0 ? (
        <p className="mt-8 t-body text-graphite">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <AdminReview key={r.id} r={r} />
          ))}
        </ul>
      )}
    </>
  );
}
