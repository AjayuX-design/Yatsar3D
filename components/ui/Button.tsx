import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Loader2 } from "@/components/ui/Icons";

export type ButtonVariant = "primary" | "secondary" | "whatsapp" | "text";
export type ButtonSize = "md" | "sm";

type Common = {
  variant?: ButtonVariant;
  /** md is 48px (default). sm is 40px, for compact desktop use. */
  size?: ButtonSize;
  /** Full width. Use for primary actions inside content blocks on mobile. */
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AsButton = Common &
  Omit<ComponentPropsWithoutRef<"button">, keyof Common> & { href?: undefined };
type AsLink = Common &
  Omit<ComponentPropsWithoutRef<"a">, keyof Common> & { href: string };

const base =
  "relative inline-flex items-center justify-center gap-2 " +
  "text-[16px] leading-6 transition-[color,background-color,border-color,transform] duration-150 ease-out select-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "font-semibold bg-ink text-surface rounded-ctl hover:bg-ink-hover active:scale-[0.98] active:bg-ink-pressed",
  secondary:
    "font-semibold bg-surface text-ink border border-ink rounded-ctl hover:bg-mist active:scale-[0.98] active:bg-line",
  whatsapp:
    "font-semibold bg-surface text-moss border border-moss rounded-ctl hover:bg-moss-tint active:scale-[0.98] active:bg-moss-tint",
  text: "text-kiln-deep underline underline-offset-[3px] hover:no-underline min-h-11 px-1 font-medium",
};

const disabledStyles: Record<ButtonVariant, string> = {
  primary: "font-semibold bg-mist text-graphite rounded-ctl cursor-not-allowed",
  secondary: "font-semibold bg-mist text-graphite border border-transparent rounded-ctl cursor-not-allowed",
  whatsapp: "font-semibold bg-mist text-graphite border border-transparent rounded-ctl cursor-not-allowed",
  text: "font-medium text-graphite no-underline min-h-11 px-1 cursor-not-allowed",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-6",
  sm: "h-10 px-4",
};

export function Button(props: AsButton | AsLink) {
  const {
    variant = "primary",
    size = "md",
    block = false,
    loading = false,
    disabled = false,
    icon,
    className,
    children,
    ...rest
  } = props;

  const isDisabled = disabled || loading;
  const classes = cn(
    base,
    variant !== "text" && sizes[size],
    isDisabled ? disabledStyles[variant] : variants[variant],
    block && "w-full",
    className,
  );

  // Loading never changes the button width. With an icon, the spinner takes the
  // icon slot. Without one, the spinner sits centred and the label stays in
  // place but hidden visually, so screen readers still hear it.
  const spinnerOnly = loading && !icon;
  const lead = loading ? (
    <Loader2
      aria-hidden="true"
      className={cn(
        "size-5 animate-spin",
        spinnerOnly && "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
      )}
    />
  ) : (
    icon
  );
  const content = (
    <>
      {lead}
      <span className={cn(spinnerOnly && "opacity-0")}>{children}</span>
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as ComponentPropsWithoutRef<"a"> & {
      href: string;
    };
    if (isDisabled) {
      return (
        <span aria-disabled="true" aria-busy={loading || undefined} className={classes}>
          {content}
        </span>
      );
    }
    return href.startsWith("/") ? (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
