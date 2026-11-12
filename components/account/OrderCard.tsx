import Link from "next/link";
import { OrderStageChip } from "@/components/account/OrderStageChip";
import { ArrowRight } from "@/components/ui/Icons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { formatMoney } from "@/lib/format/money";
import { orderStage, type OrderView } from "@/lib/customer/orders";
import { shortDate } from "@/lib/customer/format";

/** One order in the list: number, date, status, up to three photos, total. The whole card opens the order. */
export function OrderCard({ order }: { order: OrderView }) {
  const stage = orderStage(order);
  const shown = order.lines.slice(0, 3);
  const more = order.lines.length - shown.length;
  const items = order.lines.reduce((n, l) => n + l.quantity, 0);
  return (
    <Link
      href={`/account/orders/${order.number}`}
      className="group block rounded-card border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(23,23,23,0.05)] transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_12px_28px_-14px_rgba(23,23,23,0.28)] lg:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading text-[20px] font-semibold leading-6 text-ink">{order.name}</p>
          <p className="t-small text-graphite">Placed {shortDate(order.processedAt)}</p>
        </div>
        <OrderStageChip stage={stage} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        {shown.map((l) => (
          <span key={l.id} className="relative block size-16 shrink-0 overflow-hidden rounded-ctl bg-mist">
            <ImagePlaceholder src={l.image?.url} alt={l.image?.alt ?? l.name} label="" sizes="64px" whole />
          </span>
        ))}
        {more > 0 && <span className="grid size-16 place-items-center rounded-ctl bg-mist t-label text-graphite">+{more}</span>}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 t-small">
        <span className="text-graphite [font-variant-numeric:tabular-nums]">
          {items} {items === 1 ? "item" : "items"} · <span className="font-medium text-ink">{formatMoney(order.total)}</span>
        </span>
        <span className="inline-flex items-center gap-1 t-label text-kiln-deep group-hover:underline group-hover:underline-offset-[3px]">
          View order <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
