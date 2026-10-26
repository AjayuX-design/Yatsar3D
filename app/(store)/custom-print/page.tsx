import type { Metadata } from "next";
import { CustomOrderForm } from "@/components/enquiry/CustomOrderForm";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Archive, Briefcase, PackageCheck, PenLine, ReceiptText, Send, ShieldCheck } from "@/components/ui/Icons";
import { isCustomOrderFormReady } from "@/app/(store)/custom-print/actions";
import { customFaq, customOptions, nextSteps } from "@/lib/custom-orders";
import { sampleStore } from "@/lib/sample-data";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Custom orders | Yatsar 3D",
  description: "Custom-fit drawers, personalised prints and business orders. We send a quote before you pay.",
};

const icons = { drawer: Archive, personalise: PenLine, business: Briefcase } as const;
const stepIcons = { send: Send, quote: ReceiptText, approve: PackageCheck } as const;

/*
  One job for this page: get a request sent. The form comes first, three steps
  guide it, and a short sidebar answers "what happens next?". Without email
  settings the form is hidden and the three choices open WhatsApp instead.
*/
export default async function CustomPrintPage() {
  const formReady = await isCustomOrderFormReady();
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Custom orders" }]} />

      <header className="mt-2 max-w-[640px]">
        <h1 className="t-h1 text-ink">Custom orders</h1>
        <p className="mt-3 t-body-l text-graphite">
          Tell us what you need and we will send you a quote. You pay only after you approve it.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="lg:col-span-7">
          {formReady ? (
            <div className="rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(23,23,23,0.04)] md:p-8">
              <CustomOrderForm whatsappNumber={sampleStore.whatsappNumber} />
            </div>
          ) : (
            <ul className="grid gap-3">
              {customOptions.map((o) => {
                const Icon = icons[o.icon];
                return (
                  <li key={o.id} className="flex flex-col rounded-card bg-mist p-5">
                    <span aria-hidden="true" className="grid size-10 place-items-center rounded-pill bg-surface text-ink">
                      <Icon className="size-5" />
                    </span>
                    <h2 className="mt-4 t-h3 text-ink">{o.title}</h2>
                    <p className="mt-2 t-body text-graphite">{o.text}</p>
                    <EnquiryCta variant="link" className="-ml-1 mt-2 self-start" label={o.cta} number={sampleStore.whatsappNumber} message={o.message} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5" aria-label="What happens next">
          <section aria-labelledby="next">
            <h2 id="next" className="t-h3 text-ink">
              What happens next
            </h2>
            <ol className="mt-4 space-y-5">
              {nextSteps.map((s) => {
                const Icon = stepIcons[s.icon];
                return (
                  <li key={s.title} className="flex gap-4">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-pill bg-mist text-ink">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="t-label text-ink">{s.title}</p>
                      <p className="mt-1 t-small text-graphite">{s.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <p className="flex gap-3 rounded-card bg-mist p-4 t-small text-ink">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden="true" />
            Nothing is printed or charged until you approve the quote.
          </p>

          <div className="rounded-card border border-line p-4">
            <p className="t-label text-ink">Prefer to chat?</p>
            <p className="mt-1 t-small text-graphite">Message us on WhatsApp instead.</p>
            <WhatsAppButton number={sampleStore.whatsappNumber} message={generalEnquiryMessage} label="Chat on WhatsApp" className="mt-4" />
          </div>
        </aside>
      </div>

      <section className="mt-14 lg:mt-20" aria-labelledby="faq">
        <h2 id="faq" className="t-h2 text-ink">
          Common questions
        </h2>
        <Accordion items={customFaq} className="mt-6 lg:max-w-[720px]" />
      </section>
    </main>
  );
}
