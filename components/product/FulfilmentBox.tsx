import { Clock, MapPin, Truck, WhatsAppIcon } from "@/components/ui/Icons";
import { formatDays } from "@/lib/format/leadtime";
import { buildWhatsAppUrl, generalEnquiryMessage } from "@/lib/whatsapp";
import type { Days, Fulfilment } from "@/lib/types";

/** One row: icon in a 36px disc, small label, then a clear value. */
function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-pill bg-mist text-ink"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="t-caption text-graphite">{label}</p>
        <p className="t-value text-ink">{children}</p>
      </div>
    </div>
  );
}

/**
 * Two clocks, always separate: production (or dispatch) time, then delivery
 * time after dispatch. Then the delivery area. No pincode checker.
 * Delivery days fall back to the store default when the product has none.
 * The WhatsApp link is deliberately quiet: small moss text, no button.
 */
export function FulfilmentBox({
  fulfilment,
  productionDays,
  deliveryDays,
  defaultDeliveryDays,
  deliveryAreaText,
  whatsappNumber,
}: {
  fulfilment: Fulfilment;
  productionDays?: Days;
  deliveryDays?: Days;
  defaultDeliveryDays?: Days;
  deliveryAreaText: string;
  whatsappNumber?: string;
}) {
  const delivery = deliveryDays ?? defaultDeliveryDays;
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, generalEnquiryMessage);
  return (
    <section
      aria-label="Production and delivery"
      className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface"
    >
      {productionDays && (
        <Row
          icon={<Clock className="size-[18px]" />}
          label={fulfilment === "ready_stock" ? "Ships in" : "Production time"}
        >
          {formatDays(productionDays)}
        </Row>
      )}
      {delivery && (
        <Row icon={<Truck className="size-[18px]" />} label="Delivery time">
          {formatDays(delivery)} after dispatch
        </Row>
      )}
      <div className="flex gap-4 bg-mist/60 px-4 py-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-pill bg-slate-tint text-slate"
        >
          <MapPin className="size-[18px]" />
        </span>
        <div className="min-w-0 self-center">
          <p className="t-small text-ink">{deliveryAreaText}</p>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="-mb-3 mt-0.5 inline-flex min-h-11 items-center gap-1.5 t-label text-moss underline-offset-[3px] hover:underline"
            >
              <WhatsAppIcon className="size-4" />
              Other area? Ask on WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
