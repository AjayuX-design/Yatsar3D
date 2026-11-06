import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderStageChip } from "@/components/account/OrderStageChip";
import { OrderTracker } from "@/components/account/OrderTracker";
import { SignInCard } from "@/components/account/SignInCard";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { InfoCard } from "@/components/ui/InfoCard";
import { StatePanel } from "@/components/ui/StatePanel";
import { getAccount } from "@/lib/customer/account";
import { shortDate } from "@/lib/customer/format";
import { orderStage, paymentLabel } from "@/lib/customer/orders";
import { formatMoney } from "@/lib/format/money";
import { CONTACT_EMAIL } from "@/lib/policies";
import { sampleStore } from "@/lib/sample-data";
import { orderHelpMessage } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order | Yatsar 3D", robots: { index: false, follow: false } };

// One placeholder path, so the layout (which reads the address) can be prepared ahead of time.
// Real order numbers are rendered on demand, per signed-in customer.
export function generateStaticParams() {
  return [{ number: "0" }];
}

export default function OrderPage(props: PageProps<"/account/orders/[number]">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Suspense fallback={<div aria-busy="true" aria-label="Loading your order" className="mt-6 h-96 rounded-card bg-mist" />}>
        <Content params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function Content({ params, searchParams }: { params: PageProps<"/account/orders/[number]">["params"]; searchParams: PageProps<"/account/orders/[number]">["searchParams"] }) {
  const { number } = await params;
  const q = await searchParams;
  const here = `/account/orders/${number}`;
  const a = await getAccount();

  if (a.state === "refresh" && !q.refreshed) redirect(`/account/refresh?next=${encodeURIComponent(here)}`);
  if (a.state === "signed-out" || a.state === "refresh") {
    return (
      <div className="mt-6 max-w-[640px]">
        <SignInCard next={here} />
      </div>
    );
  }
  if (a.state === "unavailable") redirect("/account");
  if (a.state === "error") {
    return (
      <StatePanel tone="error" title="Your order could not be loaded" className="mt-8" action={<Button href={here} variant="secondary">Try again</Button>}>
        {a.message}
      </StatePanel>
    );
  }

  const order = a.customer.orders.find((o) => String(o.number) === number);
  if (!order) {
    return (
      <StatePanel title="We could not find that order" className="mt-8" action={<Button href="/account">See all orders</Button>}>
        It may belong to a different email address.
      </StatePanel>
    );
  }

  const stage = orderStage(order);
  const pay = paymentLabel(order.paymentStatus);
  const row = "flex items-baseline justify-between gap-4";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: order.name }]} />

      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="t-h1 text-ink">Order {order.name}</h1>
          <p className="mt-1 t-small text-graphite">
            Placed {shortDate(order.processedAt)}
            {pay && <> · {pay}</>}
          </p>
        </div>
        <OrderStageChip stage={stage} />
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-8 lg:col-span-7">
          <section aria-labelledby="progress" className="rounded-card border border-line p-5 lg:p-6">
            <h2 id="progress" className="sr-only">
              Order progress
            </h2>
            <OrderTracker stage={stage} />
            <p className="mt-5 text-center t-small text-graphite">
              {stage === "cancelled" && "This order was cancelled."}
              {stage === "placed" && "We have your order and are getting it ready. We will update this page when it ships."}
              {stage === "shipped" && "Your order is on its way."}
              {stage === "out_for_delivery" && "Your order is out for delivery today."}
              {stage === "delivered" && "Your order was delivered."}
            </p>
          </section>

          {order.shipments.length > 0 && (
            <section aria-labelledby="shipments">
              <h2 id="shipments" className="t-h3 text-ink">
                {order.shipments.length > 1 ? "Shipments" : "Shipment"}
              </h2>
              <ul className="mt-3 space-y-3">
                {order.shipments.map((s, i) => (
                  <li key={i} className="rounded-card bg-mist p-4">
                    <p className="t-label text-ink">{s.carrier ?? "Carrier"}</p>
                    {s.trackingNumber && <p className="mt-1 t-small text-graphite [font-variant-numeric:tabular-nums]">Tracking number: {s.trackingNumber}</p>}
                    {s.estimatedDeliveryAt && <p className="mt-1 t-small text-graphite">Expected by {shortDate(s.estimatedDeliveryAt)}</p>}
                    {s.trackingUrl && (
                      <Button href={s.trackingUrl} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" className="mt-3">
                        Track shipment
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="items">
            <h2 id="items" className="t-h3 text-ink">
              Items
            </h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {order.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-4">
                  <span className="relative block size-20 shrink-0 overflow-hidden rounded-ctl bg-mist">
                    <ImagePlaceholder src={l.image?.url} alt={l.image?.alt ?? l.name} label="" sizes="80px" whole />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="t-body font-medium text-ink">{l.name}</p>
                    {l.variantTitle && <p className="t-small text-graphite">{l.variantTitle}</p>}
                    <p className="t-small text-graphite">Qty {l.quantity}</p>
                  </div>
                  {l.total && <p className="t-value text-ink">{formatMoney(l.total)}</p>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <section aria-labelledby="summary" className="rounded-card border border-line p-5 lg:p-6">
            <h2 id="summary" className="t-h3 text-ink">
              Summary
            </h2>
            <dl className="mt-4 space-y-2 t-small">
              {order.subtotal && (
                <div className={row}>
                  <dt className="text-graphite">Subtotal</dt>
                  <dd className="t-value text-ink">{formatMoney(order.subtotal)}</dd>
                </div>
              )}
              {order.shipping && (
                <div className={row}>
                  <dt className="text-graphite">Delivery</dt>
                  <dd className="t-value text-ink">{Number(order.shipping.amount) === 0 ? "Free" : formatMoney(order.shipping)}</dd>
                </div>
              )}
              {order.tax && Number(order.tax.amount) > 0 && (
                <div className={row}>
                  <dt className="text-graphite">Tax</dt>
                  <dd className="t-value text-ink">{formatMoney(order.tax)}</dd>
                </div>
              )}
              <div className={`${row} border-t border-line pt-3`}>
                <dt className="t-label text-ink">Total</dt>
                <dd className="t-price-s text-ink">{formatMoney(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.address.length > 0 && (
            <section aria-labelledby="address" className="rounded-card border border-line p-5 lg:p-6">
              <h2 id="address" className="t-h3 text-ink">
                Delivery address
              </h2>
              <address className="mt-3 not-italic t-body text-graphite">
                {order.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </section>
          )}

          <InfoCard variant="neutral" title="Need help with this order?">
            <div className="mt-1 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <WhatsAppButton number={sampleStore.whatsappNumber} message={orderHelpMessage(order.name)} block className="sm:w-auto lg:w-full xl:w-auto" />
              <Button href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Order ${order.name}`)}`} variant="secondary" block className="sm:w-auto lg:w-full xl:w-auto">
                Email us
              </Button>
            </div>
            <Link href={order.statusPageUrl} className="mt-3 inline-flex min-h-11 items-center t-label text-ink underline underline-offset-[3px]">
              Open the full order page
            </Link>
          </InfoCard>
        </aside>
      </div>
    </>
  );
}
