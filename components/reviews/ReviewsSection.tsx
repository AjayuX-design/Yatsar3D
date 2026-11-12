import { Stars } from "@/components/reviews/Stars";
import { WriteReview } from "@/components/reviews/WriteReview";
import { liveReviews, storeKind } from "@/lib/reviews/store";
import { summarise } from "@/lib/reviews/validate";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Customer reviews for one product: the average, how the stars split, a way
 * to write a review, and every live review with the shop's reply under it.
 * Hidden when there is no review store, so a missing database never shows a broken box.
 */
export async function ReviewsSection({ handle, title }: { handle: string; title: string }) {
  if (storeKind() === "none") return null;
  const reviews = await liveReviews(handle);
  const rating = summarise(reviews);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mt-16 scroll-mt-24 border-t border-line pt-12">
      <span aria-hidden="true" className="mb-3 block h-1 w-10 rounded-pill bg-kiln" />
      <h2 id="reviews-title" className="t-h2 text-ink">
        Customer reviews
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          {rating.count > 0 ? (
            <>
              <p className="flex items-baseline gap-2">
                <span className="t-display text-ink [font-variant-numeric:tabular-nums]">{rating.average.toFixed(1)}</span>
                <span className="t-small text-graphite">out of 5</span>
              </p>
              <Stars value={rating.average} size={20} className="mt-2" />
              <p className="mt-2 t-small text-graphite [font-variant-numeric:tabular-nums]">
                {rating.count} {rating.count === 1 ? "review" : "reviews"}
              </p>
              <ul className="mt-5 space-y-2" aria-label="Reviews by stars">
                {[5, 4, 3, 2, 1].map((n) => (
                  <li key={n} className="flex items-center gap-3 t-small text-graphite [font-variant-numeric:tabular-nums]">
                    <span className="w-10 shrink-0">{n} star</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-pill bg-mist">
                      <span className="block h-full rounded-pill bg-amber-dot" style={{ width: `${(rating.counts[n - 1] / rating.count) * 100}%` }} />
                    </span>
                    <span className="w-6 shrink-0 text-right">{rating.counts[n - 1]}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="t-body text-graphite">No reviews yet. Be the first to share what you think.</p>
          )}
          <div className="mt-6">
            <WriteReview handle={handle} title={title} />
          </div>
        </div>

        <div className="lg:col-span-8">
          {reviews.length > 0 && (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <Stars value={r.rating} />
                  {r.title && <h3 className="mt-2 t-h3 text-ink">{r.title}</h3>}
                  <p className="mt-1 t-small text-graphite">
                    {r.name} · {date(r.createdAt)}
                  </p>
                  <p className="mt-3 max-w-[60ch] whitespace-pre-line t-body text-ink">{r.body}</p>
                  {r.reply && (
                    <div className="mt-4 max-w-[60ch] rounded-card bg-mist p-4">
                      <p className="t-label text-ink">
                        Reply from Yatsar 3D <span className="font-normal text-graphite">· {date(r.reply.at)}</span>
                      </p>
                      <p className="mt-2 whitespace-pre-line t-body text-ink">{r.reply.text}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
