"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "bottom" | "cart" | "menu";

const variants: Record<Variant, string> = {
  // Short sheet from the bottom (sort).
  bottom: "sheet inset-x-0 bottom-0 top-auto max-h-[85dvh] rounded-t-sheet",
  // Mobile: tall sheet from the bottom. Desktop: 420px drawer on the right.
  cart:
    "sheet sheet-cart inset-x-0 bottom-0 top-auto h-[calc(100dvh-24px)] rounded-t-sheet " +
    "lg:inset-y-0 lg:left-auto lg:right-0 lg:top-0 lg:h-dvh lg:w-[420px] lg:rounded-none",
  // Full-screen menu from the left.
  menu: "sheet sheet-menu inset-0 h-dvh",
};

/**
 * Native <dialog>: focus is trapped, Esc closes, the page behind is inert, and
 * focus returns to the trigger on close. Clicking the dim area closes it.
 * No display utilities on the dialog itself, so a closed dialog stays hidden.
 */
export function Sheet({
  open,
  onClose,
  label,
  variant = "bottom",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: Variant;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Stop the page scrolling behind an open sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "fixed m-0 w-full max-w-none overflow-hidden bg-surface p-0 text-ink backdrop:bg-ink/40",
        variants[variant],
      )}
    >
      {children}
    </dialog>
  );
}
