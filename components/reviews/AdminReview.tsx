"use client";

import Link from "next/link";
import { Stars } from "@/components/reviews/Stars";
import { Button } from "@/components/ui/Button";
import { deleteReview, replyToReview, setReviewStatus } from "@/lib/reviews/actions";
import type { Review } from "@/lib/reviews/types";
import { LIMITS } from "@/lib/reviews/validate";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** One review for the owner: reply, hide or show, delete. */
export function AdminReview({ r }: { r: Review }) {
  const hidden = r.status === "hidden";
  return (
    <li className={`rounded-card border p-4 lg:p-5 ${hidden ? "border-line bg-mist" : "border-line"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Stars value={r.rating} />
        <span className={`rounded-pill px-3 py-1 t-caption ${hidden ? "bg-amber-tint text-amber-text" : "bg-moss-tint text-moss"}`}>{hidden ? "Hidden" : "Live"}</span>
      </div>
      {r.title && <p className="mt-2 t-h3 text-ink">{r.title}</p>}
      <p className="mt-1 t-small text-graphite">
        {r.name} · {when(r.createdAt)} ·{" "}
        <Link href={`/products/${r.handle}#reviews`} className="underline underline-offset-[3px]">
          {r.handle}
        </Link>
      </p>
      <p className="mt-3 max-w-[70ch] whitespace-pre-line t-body text-ink">{r.body}</p>

      <form action={replyToReview} className="mt-4 space-y-2">
        <input type="hidden" name="id" value={r.id} />
        <label htmlFor={`reply-${r.id}`} className="block t-label text-ink">
          Your public reply
        </label>
        <textarea
          id={`reply-${r.id}`}
          name="reply"
          rows={3}
          maxLength={LIMITS.replyMax}
          defaultValue={r.reply?.text}
          placeholder="Thank them, or answer their question. Leave empty to remove your reply."
          className="w-full rounded-ctl border border-field bg-surface px-3 py-3 text-[16px] text-ink placeholder:text-hint"
        />
        <Button type="submit" size="sm">
          {r.reply ? "Update reply" : "Post reply"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        <form action={setReviewStatus}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="status" value={hidden ? "live" : "hidden"} />
          <Button type="submit" size="sm" variant="secondary">
            {hidden ? "Show on site" : "Hide from site"}
          </Button>
        </form>
        <form
          action={deleteReview}
          onSubmit={(e) => {
            if (!confirm("Delete this review for good?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={r.id} />
          <Button type="submit" size="sm" variant="text" className="text-error">
            Delete
          </Button>
        </form>
      </div>
    </li>
  );
}
