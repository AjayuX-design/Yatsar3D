import { Clock, Truck, WhatsAppIcon } from "@/components/ui/Icons";
import { formatDays } from "@/lib/format/leadtime";
import { buildWhatsAppUrl, generalEnquiryMessage } from "@/lib/whatsapp";
import type { Days, Fulfilment } from "@/lib/types";

/** One cell: a small icon, a small label, then a clear value. */
function Cell({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-pill bg-kiln/10 text-kiln-deep">
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
 * Two clocks, always separate and side by side: production (or dispatch) time, then
 * delivery time after dispatch. Delivery days fall back to the store default when the product has none.
 * The free-delivery limit and the delivery area live in the top bar, the cart and the delivery page,
 * so they are not repeated here. One quiet WhatsApp line is the only extra.
 */
export function FulfilmentBox({
  fulfilment,
  productionDays,
  deliveryDays,
  defaultDeliveryDays,
  whatsappNumber,
}: {
  fulfilment: Fulfilment;
  productionDays?: Days;
  deliveryDays?: Days;
  defaultDeliveryDays?: Days;
  whatsappNumber?: string;
}) {
  const delivery = deliveryDays ?? defaultDeliveryDays;
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, generalEnquiryMessage);
  const cells = [
    productionDays && (
      <Cell key="prod" icon={<Clock className="size-[16px]" />} label={fulfilment === "ready_stock" ? "Ships in" : "Production time"}>
        {formatDays(productionDays)}
      </Cell>
    ),
    delivery && (
      <Cell key="del" icon={<Truck className="size-[16px]" />} label="Delivery time">
        {formatDays(delivery)} after dispatch
      </Cell>
    ),
  ].filter(Boolean);
  if (!cells.length) return null;
  return (
    <section aria-label="Production and delivery">
      <div
        className={`grid divide-x divide-line overflow-hidden panel ${cells.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {cells}
      </div>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="-mb-3 mt-1 inline-flex min-h-11 items-center gap-2 t-label text-moss underline-offset-[3px] hover:underline"
        >
          <WhatsAppIcon className="size-4" />
          Not sure about your area? Ask on WhatsApp
        </a>
      )}
    </section>
  );
}
