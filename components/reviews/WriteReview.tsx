"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Star } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { submitReview, type ReviewState } from "@/lib/reviews/actions";
import { LIMITS } from "@/lib/reviews/validate";

const input =
  "w-full rounded-ctl border border-field bg-surface px-3 text-[16px] text-ink placeholder:text-hint aria-[invalid=true]:border-error";
const words = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** A button that opens the review form. The review shows on the page as soon as it is sent. */
export function WriteReview({ handle, title }: { handle: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [chars, setChars] = useState(0);
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, { status: "idle" });
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  // Re-reads the page so the new review appears in the list.
  useEffect(() => {
    if (state.status === "ok") router.refresh();
  }, [state, router]);

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-card bg-moss-tint p-4">
        <p className="t-label text-ink">Thank you. Your review is live.</p>
        <p className="mt-1 t-small text-graphite">It is now in the list. We read every one.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" block className="sm:w-auto" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );
  }

  const shown = hover || rating;
  return (
    <form action={action} className="space-y-5 rounded-card border border-line p-4 lg:p-5" noValidate>
      <p className="t-h3 text-ink">Review {title}</p>
      <input type="hidden" name="handle" value={handle} />
      {/* Hidden trap field for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 t-label text-ink">Your rating</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="group relative grid size-11 cursor-pointer place-items-center" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
                aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${words[n]}`}
              />
              <Star
                aria-hidden="true"
                className={cn("size-8 transition-colors duration-100", n <= shown ? "fill-amber-dot text-amber-dot" : "text-field", "peer-focus-visible:rounded-ctl peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink")}
              />
            </label>
          ))}
          <span className="ml-2 t-small text-graphite" aria-live="polite">
            {words[shown]}
          </span>
        </div>
        {errors.rating && <p className="mt-1 t-small text-error">{errors.rating}</p>}
      </fieldset>

      <div>
        <label htmlFor="rv-name" className="mb-1 block t-label text-ink">
          Your name
        </label>
        <input id="rv-name" name="name" required maxLength={LIMITS.nameMax} autoComplete="given-name" defaultValue={values.name} aria-invalid={!!errors.name} className={cn(input, "h-12")} />
        {errors.name && <p className="mt-1 t-small text-error">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="rv-title" className="mb-1 block t-label text-ink">
          Title <span className="font-normal text-graphite">(optional)</span>
        </label>
        <input id="rv-title" name="title" maxLength={LIMITS.titleMax} placeholder="Sum it up in a few words" defaultValue={values.title} aria-invalid={!!errors.title} className={cn(input, "h-12")} />
        {errors.title && <p className="mt-1 t-small text-error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="rv-body" className="mb-1 block t-label text-ink">
          Your review
        </label>
        <textarea
          id="rv-body"
          name="body"
          required
          rows={5}
          maxLength={LIMITS.bodyMax}
          placeholder="What did you like? How does it look and feel? Anything others should know?"
          defaultValue={values.body}
          onChange={(e) => setChars(e.target.value.length)}
          aria-invalid={!!errors.body}
          className={cn(input, "py-3")}
        />
        <p className="mt-1 flex justify-between gap-3 t-caption text-graphite">
          <span className={errors.body ? "text-error" : ""}>{errors.body ?? "No links, please."}</span>
          <span className="[font-variant-numeric:tabular-nums]">
            {chars}/{LIMITS.bodyMax}
          </span>
        </p>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="t-small text-error">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="submit" block className="sm:w-auto" loading={pending}>
          Post review
        </Button>
        <Button variant="text" type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
