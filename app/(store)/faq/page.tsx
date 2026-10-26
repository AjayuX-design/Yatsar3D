import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { sampleStore } from "@/lib/sample-data";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "FAQ | Yatsar 3D",
  description: "Answers about ordering, delivery, custom orders, and looking after your 3D prints.",
};

/*
  Draft wording. Answers stick to what is decided: delivery in Hyderabad, quotes
  before payment for custom orders, Shopify checkout. The damaged-item answer
  matches the draft on the product pages and still needs the shop's confirmation,
  as do payment methods, cancellations, and any returns beyond damage.
*/

const link = "font-medium text-ink underline underline-offset-[3px]";

const groups: Array<{ id: string; title: string; items: AccordionItem[] }> = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        id: "order",
        title: "How do I place an order?",
        content: "Add what you like to your cart and check out. The checkout is run by Shopify, so your payment details are handled securely.",
      },
      {
        id: "pay",
        title: "How do I pay?",
        content: "You pay at checkout. The payment options available are shown there, before you confirm.",
      },
      {
        id: "change",
        title: "Can I change or cancel an order?",
        content: "Message us as soon as you can. Made to order items start printing quickly, so the sooner you tell us, the more we can do.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      {
        id: "where",
        title: "Where do you deliver?",
        content: (
          <>
            {sampleStore.deliveryAreaText} Somewhere else? Message us and we will tell you what is possible.
          </>
        ),
      },
      {
        id: "long",
        title: "How long will my order take?",
        content: (
          <>
            Each product page shows two times: how long we take to get it ready, and how long delivery takes after dispatch. Read more on the{" "}
            <Link href="/delivery" className={link}>
              delivery page
            </Link>
            .
          </>
        ),
      },
      {
        id: "types",
        title: "What does made to order mean?",
        content: "We print it after you order. Ready to ship items are already in stock, so they leave sooner.",
      },
      {
        id: "charge",
        title: "Is there a delivery charge?",
        content: "Any charge is shown at checkout, before you pay.",
      },
    ],
  },
  {
    id: "custom",
    title: "Custom orders",
    items: [
      {
        id: "how",
        title: "How do custom orders work?",
        content: (
          <>
            Tell us what you need on the{" "}
            <Link href="/custom-print" className={link}>
              custom orders page
            </Link>
            , by form or WhatsApp. We reply with a price and timing. You pay only after you approve the quote.
          </>
        ),
      },
      {
        id: "design",
        title: "Can I send my own idea or design?",
        content: "Yes. Send a photo, a sketch or a file, with the size you need. We will tell you what we can make.",
      },
      {
        id: "drawer",
        title: "What do I measure for a custom drawer?",
        content: "The inside length, width and depth of the drawer, in mm or cm.",
      },
    ],
  },
  {
    id: "care",
    title: "Your prints",
    items: [
      {
        id: "lines",
        title: "Why can I see fine lines on my print?",
        content: "3D prints are built layer by layer, so fine layer lines are part of a printed surface. Small differences between prints are normal. Colours can also vary slightly between batches.",
      },
      {
        id: "look",
        title: "How do I look after my print?",
        content: "Keep it out of direct sunlight and away from heat. Wipe it with a dry or slightly damp cloth. Each product page has its own care note.",
      },
      {
        id: "damaged",
        title: "What if my item arrives damaged?",
        content: "Message us on WhatsApp within 48 hours with photos. We will replace it or refund you.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <header className="mt-2 max-w-[640px]">
        <h1 className="t-h1 text-ink">Questions and answers</h1>
        <p className="mt-3 t-body-l text-graphite">Short answers about ordering, delivery, custom orders and your prints.</p>
      </header>

      <div className="mt-10 grid gap-10 lg:max-w-[760px]">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`faq-${g.id}`}>
            <h2 id={`faq-${g.id}`} className="t-h2 text-ink">
              {g.title}
            </h2>
            <Accordion items={g.items} single={false} headingLevel="h3" className="mt-4" />
          </section>
        ))}
      </div>

      <EnquiryCta
        variant="card"
        className="mt-12 max-w-[760px]"
        title="Did not find your answer?"
        description="Message us and we will reply."
        number={sampleStore.whatsappNumber}
        message={generalEnquiryMessage}
      />
    </main>
  );
}
