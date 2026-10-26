import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatusChip } from "@/components/ui/Chip";
import { Clock, Truck } from "@/components/ui/Icons";
import { InfoCard } from "@/components/ui/InfoCard";
import { formatDays } from "@/lib/format/leadtime";
import { sampleStore } from "@/lib/sample-data";
import { sampleStoreDefaults } from "@/lib/sample-products";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Delivery | Yatsar 3D",
  description: "Where we deliver, how long it takes, and the difference between ready to ship and made to order.",
};

/*
  Draft wording. Confirmed: the delivery area (Hyderabad). Still to be decided by
  the shop, so this page makes no promise about them: delivery charges and any
  free-delivery limit, courier and tracking, and delivery outside Hyderabad.
*/

const section = "mt-12 lg:mt-16";

export default function DeliveryPage() {
  const days = formatDays(sampleStoreDefaults.deliveryDays);
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Delivery" }]} />

      <header className="mt-2 max-w-[640px]">
        <h1 className="t-h1 text-ink">Delivery</h1>
        <p className="mt-3 t-body-l text-graphite">
          Every product page shows two times: how long we take to get it ready, and how long delivery takes after that.
        </p>
      </header>

      <div className="mt-8 max-w-[720px]">
        <InfoCard variant="slate" title="Where we deliver">
          {sampleStore.deliveryAreaText} Outside Hyderabad? Message us and we will tell you what is possible.
        </InfoCard>
      </div>

      <section className={section} aria-labelledby="timing">
        <h2 id="timing" className="t-h2 text-ink">
          How the timing works
        </h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:gap-6">
          <li className="rounded-card bg-mist p-5 lg:p-6">
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-pill bg-surface text-ink">
              <Clock className="size-5" />
            </span>
            <h3 className="mt-4 t-h3 text-ink">1. Getting it ready</h3>
            <p className="mt-2 t-body text-graphite">
              Ready to ship items are packed and sent. Made to order items are printed first. The product page shows the
              exact time for that product.
            </p>
          </li>
          <li className="rounded-card bg-mist p-5 lg:p-6">
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-pill bg-surface text-ink">
              <Truck className="size-5" />
            </span>
            <h3 className="mt-4 t-h3 text-ink">2. Delivery</h3>
            <p className="mt-2 t-body text-graphite">
              After dispatch, delivery within Hyderabad usually takes <span className="[font-variant-numeric:tabular-nums]">{days}</span>.
            </p>
          </li>
        </ul>
        <p className="mt-4 max-w-[640px] t-small text-graphite">
          Add the two together for the full time from order to your door.
        </p>
      </section>

      <section className={section} aria-labelledby="types">
        <h2 id="types" className="t-h2 text-ink">
          Ready to ship and made to order
        </h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:gap-6">
          <li className="rounded-card border border-line p-5 lg:p-6">
            <StatusChip status="ready" />
            <p className="mt-3 t-body text-graphite">
              We have these in stock. They are packed and dispatched in the time shown on the product page.
            </p>
          </li>
          <li className="rounded-card border border-line p-5 lg:p-6">
            <StatusChip status="made-to-order" />
            <p className="mt-3 t-body text-graphite">
              We print these after you order, so they take a little longer. You see the production time before you pay.
            </p>
          </li>
        </ul>
      </section>

      <section className={section} aria-labelledby="charges">
        <h2 id="charges" className="t-h2 text-ink">
          Delivery charges
        </h2>
        <p className="mt-3 max-w-[640px] t-body text-graphite">
          Any delivery charge is shown at checkout, before you pay. There are no surprises after that.
        </p>
      </section>

      <section className={section} aria-labelledby="more">
        <h2 id="more" className="t-h2 text-ink">
          More help
        </h2>
        <p className="mt-3 max-w-[640px] t-body text-graphite">
          See the{" "}
          <Link href="/faq" className="font-medium text-ink underline underline-offset-[3px]">
            questions we hear most
          </Link>
          , or message us if yours is not there. For something made just for you, see{" "}
          <Link href="/custom-print" className="font-medium text-ink underline underline-offset-[3px]">
            custom orders
          </Link>
          .
        </p>
        <EnquiryCta
          variant="card"
          className="mt-6 max-w-[720px]"
          title="Delivery question?"
          description="Message us and we will reply with an answer."
          number={sampleStore.whatsappNumber}
          message={generalEnquiryMessage}
        />
      </section>
    </main>
  );
}
