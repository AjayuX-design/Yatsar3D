import type { Metadata } from "next";
import { CustomOrderForm } from "@/components/enquiry/CustomOrderForm";
import { NumberedSteps } from "@/components/content/NumberedSteps";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Archive, Briefcase, Check, PenLine } from "@/components/ui/Icons";
import { InfoCard } from "@/components/ui/InfoCard";
import { isCustomOrderFormReady } from "@/app/(store)/custom-print/actions";
import { customFaq, customOptions, customSteps, whatToSend } from "@/lib/custom-orders";
import { sampleStore } from "@/lib/sample-data";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Custom orders | Yatsar 3D",
  description: "Custom-fit drawers, personalised prints and business orders. We send a quote before you pay.",
};

const icons = {
  drawer: Archive,
  personalise: PenLine,
  business: Briefcase,
} as const;

const section = "mt-14 lg:mt-20";

export default async function CustomPrintPage() {
  const formReady = await isCustomOrderFormReady();
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Custom orders" }]} />

      <header className="mt-2 max-w-[640px]">
        <h1 className="t-h1 text-ink">Custom orders</h1>
        <p className="mt-3 t-body-l text-graphite">
          Tell us what you need. We design it, print it and deliver it, and you see the price before you pay.
        </p>
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {formReady && (
            <Button href="#request" block={false}>
              Send a request
            </Button>
          )}
          <WhatsAppButton
            number={sampleStore.whatsappNumber}
            message={generalEnquiryMessage}
            label="Chat on WhatsApp"
            block={false}
          />
        </div>
      </header>

      <section className={section} aria-labelledby="options">
        <h2 id="options" className="t-h2 text-ink">
          What we can make for you
        </h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-3 lg:gap-6">
          {customOptions.map((o) => {
            const Icon = icons[o.icon];
            return (
              <li key={o.id} className="flex flex-col rounded-card bg-mist p-5 lg:p-6">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-pill bg-surface text-ink">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 t-h3 text-ink">{o.title}</h3>
                <p className="mt-2 flex-1 t-body text-graphite">{o.text}</p>
                <EnquiryCta variant="link" className="-ml-1 mt-3 self-start" label={o.cta} number={sampleStore.whatsappNumber} message={o.message} />
              </li>
            );
          })}
        </ul>
      </section>

      {formReady && (
        <section id="request" className={`${section} scroll-mt-24`} aria-labelledby="request-heading">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 id="request-heading" className="t-h2 text-ink">
                Send a request
              </h2>
              <p className="mt-2 t-body text-graphite">
                Fill this in and we reply with a price and timing. You pay only after you approve the quote.
              </p>
              <p className="mt-4 t-small text-graphite">Prefer to chat? Use the WhatsApp button above.</p>
            </div>
            <div className="lg:col-span-8 lg:max-w-[680px]">
              <CustomOrderForm whatsappNumber={sampleStore.whatsappNumber} />
            </div>
          </div>
        </section>
      )}

      <section className={section} aria-labelledby="send">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="send" className="t-h2 text-ink">
              What to send us
            </h2>
            <p className="mt-2 t-body text-graphite">The more you share, the faster we can quote.</p>
            <ul className="mt-5 space-y-3">
              {whatToSend.map((item) => (
                <li key={item} className="flex gap-3 t-body text-ink">
                  <Check className="mt-1 size-5 shrink-0 text-moss" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-start">
            <InfoCard variant="slate" title="You pay after you approve the quote">
              We send the price and timing first. Nothing is printed or charged until you say yes.
            </InfoCard>
          </div>
        </div>
      </section>

      <section className={section} aria-labelledby="how">
        <h2 id="how" className="t-h2 text-ink">
          How it works
        </h2>
        <NumberedSteps steps={customSteps} className="mt-8" />
      </section>

      <section className={section} aria-labelledby="faq">
        <h2 id="faq" className="t-h2 text-ink">
          Common questions
        </h2>
        <Accordion items={customFaq} className="mt-6 lg:max-w-[720px]" />
      </section>

      <EnquiryCta
        variant="block"
        className={section}
        title="Ready to start?"
        description="Message us on WhatsApp with your idea. We reply with a quote."
        number={sampleStore.whatsappNumber}
        message={generalEnquiryMessage}
      />
    </main>
  );
}
