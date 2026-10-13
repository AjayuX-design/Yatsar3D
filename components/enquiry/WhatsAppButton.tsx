import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Outlined moss button that opens WhatsApp with a prefilled message.
 * Renders nothing when no valid number is set.
 */
export function WhatsAppButton({
  number,
  message,
  label = "Chat on WhatsApp",
  block = true,
  disabled,
  className,
}: {
  number?: string;
  message: string;
  label?: string;
  block?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const url = buildWhatsAppUrl(number, message);
  if (!url) return null;
  return (
    <Button
      variant="whatsapp"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      icon={<WhatsAppIcon />}
      block={block}
      disabled={disabled}
      className={className}
    >
      {label}
    </Button>
  );
}
