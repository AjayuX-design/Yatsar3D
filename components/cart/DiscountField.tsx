"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { X } from "@/components/ui/Icons";
import type { Discount } from "@/lib/cart/cart";

/** Empty, typing, loading, applied chip, error. */
export function DiscountField({
  discount,
  onApply,
  onRemove,
}: {
  discount: Discount | null;
  onApply: (code: string) => Promise<string | null>;
  onRemove: () => void;
}) {
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    setLoading(true);
    const err = await onApply(code);
    setLoading(false);
    setError(err);
    if (!err) setCode("");
  };

  return (
    <div>
      {discount && (
        <p className="mb-3 inline-flex h-7 items-center gap-1 rounded-pill bg-moss-tint pl-3 pr-1 t-caption text-moss">
          {discount.code}{discount.percent ? ` (${discount.percent}% off)` : ""}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove code ${discount.code}`}
            className="grid size-6 place-items-center rounded-pill hover:bg-surface/60"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void apply();
        }}
      >
        <label htmlFor={id} className="mb-2 block t-label text-ink">
          Discount code
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="off"
            autoCapitalize="characters"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={
              "h-12 min-w-0 flex-1 rounded-ctl border bg-surface px-3 text-[16px] text-ink placeholder:text-hint " +
              (error ? "border-error" : "border-field")
            }
            placeholder="Enter code"
          />
          <Button type="submit" variant="secondary" loading={loading} disabled={!code.trim()}>
            Apply
          </Button>
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-2 t-small text-error">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
