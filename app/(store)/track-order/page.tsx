import type { Metadata } from "next";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Hash, ShoppingBag } from "@/components/ui/Icons";
import { InfoCard } from "@/components/ui/InfoCard";
import { CONTACT_EMAIL } from "@/lib/policies";
import { accountEnabled } from "@/lib/customer/config";
import { sampleStore } from "@/lib/sample-data";
import { trackOrderMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Track your order | Yatsar 3D",
  description: "Find the status of your order from the email we sent, or ask us with your order number.",
};

/*
  Draft wording. Shopify emails every buyer an order confirmation with a link to
  their order status page, so that is the first stop. There is no courier or
  tracking number promise here until the shop decides how it ships.
*/

const card = "rounded-card bg-mist p-5 lg:p-6";
const badge = "grid size-11 place-items-center rounded-pill bg-kiln/10 text-kiln-deep";

export default function TrackOrderPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Track order" }]} />

      <header className="mt-2 max-w-[640px]">
        <h1 className="t-h1 text-ink">Track your order</h1>
        <p className="mt-3 t-body-l text-graphite">
          Your order status is in the email we sent when you paid. If you cannot find it, ask us.
        </p>
      </header>

      <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:gap-6">
        <li className={card}>
          <span aria-hidden="true" className={badge}>
            <ShoppingBag className="size-5" />
          </span>
          <h2 className="mt-4 t-h3 text-ink">1. Open your confirmation email</h2>
          <p className="mt-2 t-body text-graphite">
            Search your inbox for an email from Yatsar 3D about your order. Check spam if it is not there. The link in
            that email opens your order page with its latest status.
          </p>
        </li>
        <li className={card}>
          <span aria-hidden="true" className={badge}>
            <Hash className="size-5" />
          </span>
          <h2 className="mt-4 t-h3 text-ink">2. Cannot find it? Message us</h2>
          <p className="mt-2 t-body text-graphite">
            Send your order number and the name you ordered with. {sampleStore.responseHours}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton number={sampleStore.whatsappNumber} message={trackOrderMessage} block className="sm:w-auto" />
            <Button
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Order update")}`}
              variant="secondary"
              block
              className="sm:w-auto"
            >
              Email us
            </Button>
          </div>
        </li>
      </ul>

      {accountEnabled() && (
        <div className="mt-8 max-w-[720px] rounded-card border border-line p-5 lg:p-6">
          <h2 className="t-h3 text-ink">Have an account?</h2>
          <p className="mt-2 t-body text-graphite">Sign in to see every order, its status and its tracking in one place.</p>
          <Button href="/account" className="mt-4">
            Go to my account
          </Button>
        </div>
      )}

      <div className="mt-8 max-w-[720px]">
        <InfoCard variant="slate" title="Where is my order number?">
          It is in your confirmation email, and starts with a # sign. Made to order items are printed before they are
          sent, so allow for the production time shown on the product page.
        </InfoCard>
      </div>
    </main>
  );
}
