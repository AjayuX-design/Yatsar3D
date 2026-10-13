import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

type Props = {
  number?: string;
  message: string;
  className?: string;
};

/**
 * Three forms of the custom-print prompt:
 * card  : mist panel, for product pages and the collection grid
 * block : bordered section block, for the homepage and custom-print page
 * link  : quiet text link, for the cart and footer
 * All return null when no valid WhatsApp number is set.
 */
export function EnquiryCta({
  variant,
  title = "Need a different size or colour?",
  description = "Message us. We send a quote before you pay anything.",
  label,
  number,
  message,
  className,
}: Props & {
  variant: "card" | "block" | "link";
  title?: string;
  description?: string;
  label?: string;
}) {
  const url = buildWhatsAppUrl(number, message);
  if (!url) return null;

  if (variant === "link") {
    return (
      <Button
        variant="text"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label ?? "Custom order? Ask on WhatsApp"}
      </Button>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-card bg-mist p-4 md:flex md:items-center md:justify-between md:gap-10 md:p-6",
          className,
        )}
      >
        <div className="flex gap-3">
          <span className="mt-0.5 shrink-0 text-moss" aria-hidden="true">
            <WhatsAppIcon />
          </span>
          <div>
            <p className="t-label text-ink">{title}</p>
            <p className="mt-1 t-small text-graphite">{description}</p>
          </div>
        </div>
        <WhatsAppButton
          number={number}
          message={message}
          label={label ?? "Ask on WhatsApp"}
          className="mt-4 md:mt-0 md:w-auto md:shrink-0"
        />
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-card border border-line bg-surface p-6 md:p-8",
        className,
      )}
    >
      <h2 className="t-h2 text-ink">{title}</h2>
      <p className="mt-2 max-w-[560px] t-body text-graphite">{description}</p>
      <WhatsAppButton
        number={number}
        message={message}
        label={label ?? "Chat on WhatsApp"}
        className="mt-6 md:w-auto"
      />
    </section>
  );
}
