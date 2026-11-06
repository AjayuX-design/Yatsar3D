import type { Rating, Review } from "./types";

/*
  Rules for a new review. Pure functions, so they can be checked without a server.
  Reviews go live at once, so the rules do the quiet work of keeping spam out:
  a sensible length, no links, and a whole-number rating.
*/

export type ReviewInput = { name: string; rating: number; title: string; body: string };
export type ReviewErrors = Partial<Record<keyof ReviewInput, string>>;

export const LIMITS = { nameMin: 2, nameMax: 40, titleMax: 80, bodyMin: 10, bodyMax: 1000, replyMax: 1000 } as const;

const link = /https?:\/\/|www\.|\.(com|in|net|org|io)\b/i;

export function validateReview(raw: { name?: unknown; rating?: unknown; title?: unknown; body?: unknown }):
  | { ok: true; value: ReviewInput }
  | { ok: false; errors: ReviewErrors } {
  const name = String(raw.name ?? "").trim().replace(/\s+/g, " ");
  const title = String(raw.title ?? "").trim().replace(/\s+/g, " ");
  const body = String(raw.body ?? "").trim();
  const rating = Number(raw.rating);
  const errors: ReviewErrors = {};

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "Choose 1 to 5 stars.";
  if (name.length < LIMITS.nameMin) errors.name = "Please enter your name.";
  else if (name.length > LIMITS.nameMax) errors.name = `Keep your name under ${LIMITS.nameMax} characters.`;
  else if (link.test(name)) errors.name = "Please use your name, not a link.";
  if (title.length > LIMITS.titleMax) errors.title = `Keep the title under ${LIMITS.titleMax} characters.`;
  else if (link.test(title)) errors.title = "Please leave links out.";
  if (body.length < LIMITS.bodyMin) errors.body = `Tell us a little more (at least ${LIMITS.bodyMin} characters).`;
  else if (body.length > LIMITS.bodyMax) errors.body = `Please keep it under ${LIMITS.bodyMax} characters.`;
  else if (link.test(body)) errors.body = "Please leave links out of your review.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { name, rating, title, body } };
}

/** Average and counts from the live reviews. */
export function summarise(reviews: Pick<Review, "rating" | "status">[]): Rating {
  const counts: Rating["counts"] = [0, 0, 0, 0, 0];
  let sum = 0;
  let count = 0;
  for (const r of reviews) {
    if (r.status !== "live" || r.rating < 1 || r.rating > 5) continue;
    counts[r.rating - 1]++;
    sum += r.rating;
    count++;
  }
  return { average: count ? Math.round((sum / count) * 10) / 10 : 0, count, counts };
}
