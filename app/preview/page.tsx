import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Chip, StatusChip } from "@/components/ui/Chip";
import { InfoCard } from "@/components/ui/InfoCard";
import { Price } from "@/components/ui/Price";
import { EnquiryCta } from "@/components/enquiry/EnquiryCta";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Check } from "@/components/ui/Icons";
import { FulfilmentBox } from "@/components/product/FulfilmentBox";
import { IncludedList } from "@/components/product/IncludedList";
import { ProductCard } from "@/components/product/ProductCard";
import { SpecTable } from "@/components/product/SpecTable";
import { buildSpecRows } from "@/lib/product/spec";
import { sampleProducts, sampleStoreDefaults } from "@/lib/sample-products";
import { PillStates } from "./PillStates";
import { generalEnquiryMessage, productEnquiryMessage } from "@/lib/whatsapp";
import { sampleFaq, samplePrices, sampleProduct, sampleStore } from "@/lib/sample-data";
import { Demo, Section, SubHead, contrast } from "./parts";
import { StepperStates } from "./StepperStates";
import { colorTokens, contrastPairs, hex, radii, spacingSteps, typeScale } from "./tokens";

export const metadata: Metadata = {
  title: "Foundations preview",
  robots: { index: false, follow: false },
};

const byHandle = (h: string) => sampleProducts.find((p) => p.handle === h)!;

const nav = [
  ["colour", "Colour"],
  ["type", "Type"],
  ["spacing", "Spacing"],
  ["radius", "Radius"],
  ["buttons", "Buttons"],
  ["chips", "Chips"],
  ["price", "Price"],
  ["stepper", "Stepper"],
  ["accordion", "Accordion"],
  ["infocard", "Info card"],
  ["products", "Product"],
  ["whatsapp", "WhatsApp"],
];

const variants: Array<{ v: ButtonVariant; name: string; pressed: string }> = [
  { v: "primary", name: "Primary", pressed: "bg-ink-pressed!" },
  { v: "secondary", name: "Secondary", pressed: "bg-line!" },
  { v: "whatsapp", name: "WhatsApp", pressed: "bg-moss-tint!" },
  { v: "text", name: "Text link", pressed: "no-underline!" },
];

const focusForced = "outline-2 outline-offset-2 outline-kiln";

export default function PreviewPage() {
  const num = sampleStore.whatsappNumber;
  const productMsg = productEnquiryMessage(sampleProduct);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-24 md:px-6 lg:px-8">
      <header className="pt-8 lg:pt-16">
        <p className="t-caption text-graphite">Internal. Not indexed. Sample data only.</p>
        <h1 className="mt-2 t-h1 text-ink">Yatsar 3D foundations</h1>
        <p className="mt-2 max-w-[560px] t-body text-graphite">
          Every token, component and state for launch, on one page. Light mode only. Designed at 375
          wide first.
        </p>
        <nav aria-label="Sections" className="-mx-4 mt-6 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex gap-2 whitespace-nowrap">
            {nav.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex h-11 items-center rounded-pill border border-line bg-surface px-4 t-label text-ink hover:bg-mist"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mt-12">
        {/* COLOUR */}
        <Section
          id="colour"
          title="Colour"
          note="White, mist (light grey), line, ink and graphite carry almost every screen. Warmth comes from photography, the accent, and the status chips. Use the accent at most 3 times per screen. Primary buttons are ink, never orange."
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {colorTokens.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="h-16" style={{ background: c.hex }} />
                <div className="p-3">
                  <p className="t-label text-ink">{c.name}</p>
                  <p className="t-caption text-graphite [font-variant-numeric:tabular-nums]">{c.hex}</p>
                  <p className="mt-1 t-caption font-normal text-graphite">{c.use}</p>
                </div>
              </div>
            ))}
          </div>

          <SubHead>Contrast of the pairs we use</SubHead>
          <p className="mb-4 max-w-[560px] t-small text-graphite">
            Calculated from the hex values on this page. Small text needs 4.5 or more.
          </p>
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line t-caption text-graphite">
                  <th className="p-3 font-medium">Sample</th>
                  <th className="p-3 font-medium">Pair</th>
                  <th className="p-3 font-medium">Used for</th>
                  <th className="p-3 text-right font-medium">Ratio</th>
                  <th className="p-3 font-medium">Small text</th>
                </tr>
              </thead>
              <tbody>
                {contrastPairs.map((p) => {
                  const ratio = contrast(hex[p.text], hex[p.bg]);
                  const ok = ratio >= 4.5;
                  return (
                    <tr key={p.text + p.bg} className="border-b border-line last:border-0">
                      <td className="p-3">
                        <span
                          className="inline-block rounded-ctl px-3 py-1 t-label"
                          style={{ color: hex[p.text], background: hex[p.bg] }}
                        >
                          Aa 123
                        </span>
                      </td>
                      <td className="p-3 t-small text-ink">
                        {p.text} on {p.bg}
                      </td>
                      <td className="p-3 t-small text-graphite">{p.note}</td>
                      <td className="p-3 text-right t-spec text-ink">{ratio.toFixed(1)} : 1</td>
                      <td className={`p-3 t-label ${ok ? "text-moss" : "text-error"}`}>
                        {ok ? "Pass" : "Fail, large text only"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* TYPE */}
        <Section
          id="type"
          title="Type"
          note="Bricolage Grotesque for headings only. Inter for everything else, with tabular numerals on prices, dimensions, weights, quantities and lead times."
        >
          <div className="divide-y divide-line rounded-card border border-line bg-surface">
            {typeScale.map((t) => (
              <div key={t.cls} className="grid gap-1 p-4 lg:grid-cols-[200px_1fr] lg:gap-8">
                <div>
                  <p className="t-label text-ink">{t.name}</p>
                  <p className="t-caption text-graphite">{t.spec}</p>
                </div>
                <p className={`${t.cls} text-ink`}>{t.sample}</p>
              </div>
            ))}
          </div>

          <SubHead>Tabular numerals check</SubHead>
          <p className="mb-4 max-w-[560px] t-small text-graphite">
            With tabular numerals the two lines below are the same width and digits line up in a
            column. Without them the narrow 1s make the first line shorter.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-4">
              <p className="mb-2 t-caption text-graphite">Tabular (used for prices and specs)</p>
              <p id="tnum-a" className="t-price-l text-ink">₹1,111.11</p>
              <p id="tnum-b" className="t-price-l text-ink">₹8,888.88</p>
            </div>
            <div className="rounded-card border border-line bg-surface p-4">
              <p className="mb-2 t-caption text-graphite">Proportional (default Inter)</p>
              <p id="prop-a" className="text-[24px] font-semibold leading-7 text-ink">₹1,111.11</p>
              <p id="prop-b" className="text-[24px] font-semibold leading-7 text-ink">₹8,888.88</p>
            </div>
          </div>
        </Section>

        {/* SPACING */}
        <Section
          id="spacing"
          title="Spacing"
          note="4px base. Page gutter 16 on mobile, 24 on tablet, 32 on desktop. Content max width 1200."
        >
          <div className="space-y-3">
            {spacingSteps.map((px) => (
              <div key={px} className="flex items-center gap-4">
                <p className="w-12 shrink-0 t-spec text-ink">{px}px</p>
                <div className="h-4 rounded-ctl bg-kiln" style={{ width: px }} />
              </div>
            ))}
          </div>
        </Section>

        {/* RADIUS */}
        <Section id="radius" title="Radius" note="Four values. Nothing else.">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {radii.map((r) => (
              <div key={r.name}>
                <div
                  className="h-20 border border-ink bg-mist"
                  style={{ borderRadius: r.px }}
                />
                <p className="mt-2 t-label text-ink">
                  {r.name} <span className="t-spec text-graphite">{r.px === 999 ? "pill" : `${r.px}px`}</span>
                </p>
                <p className="t-caption text-graphite">{r.use}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* BUTTONS */}
        <Section
          id="buttons"
          title="Buttons"
          note="One primary button per screen. 48px tall, 44px minimum touch target. Pressed and focus are forced here so you can see them. Hover works on desktop."
        >
          <div className="space-y-12">
            {variants.map(({ v, name, pressed }) => (
              <div key={v}>
                <SubHead>{name}</SubHead>
                <div className="grid grid-cols-2 items-end gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-6">
                  <Demo label="Default">
                    <Button variant={v}>Add to cart</Button>
                  </Demo>
                  <Demo label="Pressed (forced)">
                    <Button variant={v} className={pressed}>
                      Add to cart
                    </Button>
                  </Demo>
                  <Demo label="Focus (forced)">
                    <Button variant={v} className={focusForced}>
                      Add to cart
                    </Button>
                  </Demo>
                  <Demo label="Disabled">
                    <Button variant={v} disabled>
                      Sold out
                    </Button>
                  </Demo>
                  <Demo label="Loading">
                    <Button variant={v} loading>
                      Adding
                    </Button>
                  </Demo>
                  <Demo label="With icon">
                    <Button variant={v} icon={<Check className="size-5" aria-hidden="true" />}>
                      Added
                    </Button>
                  </Demo>
                </div>
              </div>
            ))}

            <div>
              <SubHead>Sizes and width</SubHead>
              <div className="grid gap-6 md:grid-cols-2">
                <Demo label="Full width on mobile (block)">
                  <Button block>Check out</Button>
                </Demo>
                <Demo label="Compact 40px (sm), secondary">
                  <Button variant="secondary" size="sm">
                    View details
                  </Button>
                </Demo>
              </div>
            </div>
          </div>
        </Section>

        {/* CHIPS */}
        <Section
          id="chips"
          title="Chips"
          note="28px tall pills. Stock status is always a dot plus words, never colour alone. Max 3 on a card, 5 on a product page."
        >
          <SubHead>Status chips</SubHead>
          <div className="flex flex-wrap gap-3">
            <StatusChip status="ready" />
            <StatusChip status="made-to-order" />
            <StatusChip status="sold-out" />
          </div>
          <SubHead>Spec chips</SubHead>
          <div className="flex flex-wrap gap-3">
            <Chip>PETG</Chip>
            <Chip>18 cm</Chip>
            <Chip>Matte finish</Chip>
            <Chip>Prints in 2 to 3 days</Chip>
          </div>
        </Section>

        {/* PRICE */}
        <Section
          id="price"
          title="Price"
          note="Built from Shopify money values (amount plus currency code). Indian grouping. Compare-at shows only when it is higher than the price. Sample amounts only."
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
            <Demo label="Large">
              <Price size="l" price={samplePrices.regular} />
            </Demo>
            <Demo label="Large with compare-at">
              <Price size="l" price={samplePrices.regular} compareAt={samplePrices.compareAt} />
            </Demo>
            <Demo label="Small">
              <Price price={samplePrices.regular} />
            </Demo>
            <Demo label="Small, from">
              <Price from price={samplePrices.regular} />
            </Demo>
            <Demo label="With paise">
              <Price price={samplePrices.withPaise} />
            </Demo>
            <Demo label="Larger amount (lakh grouping starts at 1,00,000)">
              <Price size="l" price={samplePrices.large} />
            </Demo>
            <Demo label="Compare-at lower than price (ignored)">
              <Price price={samplePrices.compareAt} compareAt={samplePrices.regular} />
            </Demo>
          </div>
        </Section>

        {/* STEPPER */}
        <Section
          id="stepper"
          title="Quantity stepper"
          note="Minimum 1. Parts are 44px, so the stepper meets the touch target floor."
        >
          <StepperStates />
        </Section>

        {/* ACCORDION */}
        <Section
          id="accordion"
          title="Accordion"
          note="Hairline rows, 56px tall, 250ms open. One open at a time. Closed panels cannot take keyboard focus."
        >
          <div className="grid gap-12 md:grid-cols-2">
            <Demo label="All closed">
              <Accordion
                items={sampleFaq.map((f) => ({ id: f.id, title: f.title, content: f.body }))}
              />
            </Demo>
            <Demo label="One open by default">
              <Accordion
                defaultOpenId="finish"
                items={sampleFaq.map((f) => ({ id: f.id, title: f.title, content: f.body }))}
              />
            </Demo>
          </div>
        </Section>

        {/* INFO CARD */}
        <Section
          id="infocard"
          title="Info card"
          note="Use at most one tinted card per section. Wording here is placeholder, not final."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Demo label="Neutral">
              <InfoCard title="What is included">Printed item only. Display stand not included.</InfoCard>
            </Demo>
            <Demo label="Delivery area (slate)">
              <InfoCard variant="slate" title="Delivery area">
                {sampleStore.deliveryAreaText}
              </InfoCard>
            </Demo>
            <Demo label="Warning (amber)">
              <InfoCard variant="amber" title="Mixed cart">
                Placeholder text. The real mixed-cart rule is still to be decided.
              </InfoCard>
            </Demo>
          </div>
        </Section>

        {/* PRODUCT */}
        <Section
          id="products"
          title="Product blocks"
          note="Built from sample products that cover every state. Photos are labelled placeholders until real photography exists."
        >
          <SubHead>Store pages</SubHead>
          <ul className="grid gap-2 md:grid-cols-2">
            {[
              ["/", "Homepage"],
              ["/collections/all", "Collection, five products"],
              ["/collections/seasonal", "Collection, empty state"],
            ].map(([href, note]) => (
              <li key={href}>
                <a href={href} className="block rounded-card border border-line bg-surface p-4 hover:border-ink">
                  <span className="block t-label text-ink">{href}</span>
                  <span className="block t-small text-graphite">{note}</span>
                </a>
              </li>
            ))}
          </ul>

          <SubHead>Sample product pages</SubHead>
          <ul className="grid gap-2 md:grid-cols-2">
            {[
              ["fear-not-fridge-magnet", "Single product, ₹199, two photos, ready to ship"],
              ["desk-organiser", "Ready to ship, PETG sold out, compare-at price"],
              ["planter-pot", "Made to order, two options, price steps, one sold-out combination"],
              ["phone-stand", "Sold out, no options"],
              ["wall-mounted-headphone-and-cable-hanger-with-adjustable-arm", "Long title, ready to ship"],
              ["bookmark-set", "No custom card, no compare-at price"],
            ].map(([handle, note]) => (
              <li key={handle}>
                <a
                  href={`/products/${handle}`}
                  className="block rounded-card border border-line bg-surface p-4 hover:border-ink"
                >
                  <span className="block t-label text-ink">/products/{handle.length > 28 ? handle.slice(0, 28) + "..." : handle}</span>
                  <span className="block t-small text-graphite">{note}</span>
                </a>
              </li>
            ))}
          </ul>

          <SubHead>Product card</SubHead>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {["desk-organiser", "planter-pot", "phone-stand", "wall-mounted-headphone-and-cable-hanger-with-adjustable-arm"].map(byHandle).map((p) => (
              <Demo
                key={p.handle}
                label={
                  { "desk-organiser": "Compare-at, ready", "planter-pot": "Price range, made to order", "phone-stand": "Sold out" }[
                    p.handle
                  ] ?? "Long title (2 lines)"
                }
              >
                <ProductCard product={p} />
              </Demo>
            ))}
            <Demo label="No photo, no compare-at">
              <ProductCard product={{ ...byHandle("bookmark-set"), images: [] }} />
            </Demo>
          </div>

          <SubHead>Variant pill</SubHead>
          <PillStates />

          <SubHead>Fulfilment box</SubHead>
          <div className="grid gap-6 md:grid-cols-3">
            <Demo label="Ready to ship">
              <FulfilmentBox
                fulfilment="ready_stock"
                productionDays={{ min: 1, max: 1 }}
                deliveryDays={{ min: 1, max: 2 }}
                deliveryAreaText={sampleStore.deliveryAreaText}
                whatsappNumber={sampleStore.whatsappNumber}
              />
            </Demo>
            <Demo label="Made to order">
              <FulfilmentBox
                fulfilment="made_to_order"
                productionDays={{ min: 2, max: 3 }}
                deliveryDays={{ min: 1, max: 2 }}
                deliveryAreaText={sampleStore.deliveryAreaText}
                whatsappNumber={sampleStore.whatsappNumber}
              />
            </Demo>
            <Demo label="Delivery days missing, store default used">
              <FulfilmentBox
                fulfilment="made_to_order"
                productionDays={{ min: 3, max: 5 }}
                defaultDeliveryDays={sampleStoreDefaults.deliveryDays}
                deliveryAreaText={sampleStore.deliveryAreaText}
                whatsappNumber={sampleStore.whatsappNumber}
              />
            </Demo>
          </div>

          <SubHead>Spec table and included list</SubHead>
          <div className="grid gap-8 md:grid-cols-2">
            <Demo label="All rows">
              <SpecTable rows={buildSpecRows(byHandle("desk-organiser"), byHandle("desk-organiser").variants[0])} />
            </Demo>
            <Demo label="Some rows missing (hidden)">
              <SpecTable rows={buildSpecRows(byHandle("bookmark-set"))} />
            </Demo>
            <Demo label="Included and not included">
              <IncludedList included={byHandle("planter-pot").included} notIncluded={byHandle("planter-pot").notIncluded} />
            </Demo>
            <Demo label="Only included (other list hidden)">
              <IncludedList included={byHandle("phone-stand").included} notIncluded={[]} />
            </Demo>
          </div>
        </Section>

        {/* WHATSAPP */}
        <Section
          id="whatsapp"
          title="WhatsApp"
          note="WhatsApp is the only custom-order channel at launch. These links use a placeholder number. Every WhatsApp component hides itself if no valid number is set."
        >
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <SubHead>Button</SubHead>
              <Demo label="Default">
                <WhatsAppButton number={num} message={generalEnquiryMessage} />
              </Demo>
              <Demo label="Disabled">
                <WhatsAppButton number={num} message={generalEnquiryMessage} disabled />
              </Demo>
              <Demo label="Auto width">
                <WhatsAppButton number={num} message={generalEnquiryMessage} block={false} />
              </Demo>
              <Demo label="Hidden when no number is set (nothing renders between the lines)">
                <div className="rounded-ctl border border-dashed border-line p-2 t-caption text-graphite">
                  start
                  <WhatsAppButton message={generalEnquiryMessage} />
                  end
                </div>
              </Demo>
            </div>

            <div className="space-y-8">
              <SubHead>Enquiry card</SubHead>
              <Demo label="Product page, prefilled with product and variant">
                <EnquiryCta variant="card" number={num} message={productMsg} />
              </Demo>
              <SubHead>Enquiry link</SubHead>
              <Demo label="Cart and footer">
                <EnquiryCta variant="link" number={num} message={generalEnquiryMessage} />
              </Demo>
            </div>
          </div>

          <div className="mt-12">
            <SubHead>Enquiry block</SubHead>
            <Demo label="Homepage and custom-print page">
              <EnquiryCta
                variant="block"
                title="Tell us what you need"
                description="Message us on WhatsApp. We send a quote before you pay anything."
                number={num}
                message={generalEnquiryMessage}
              />
            </Demo>
          </div>

          <div className="mt-12">
            <SubHead>Message templates</SubHead>
            <div className="grid gap-4 md:grid-cols-2">
              <Demo label="General">
                <p className="rounded-card border border-line bg-surface p-4 t-small text-graphite">
                  {generalEnquiryMessage}
                </p>
              </Demo>
              <Demo label="From a product">
                <p className="rounded-card border border-line bg-surface p-4 t-small text-graphite">
                  {productMsg}
                </p>
              </Demo>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
