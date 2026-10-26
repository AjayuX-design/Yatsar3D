import { businessEnquiryMessage, drawerEnquiryMessage, personalisedEnquiryMessage } from "@/lib/whatsapp";

/*
  Custom orders content. WhatsApp-first: the shopper messages us, we reply with a
  quote, and nothing is paid before the quote is approved.
  Draft wording. Pricing, lead time, minimum quantities and delivery beyond the
  delivery area are open business decisions, so this copy makes no promises
  about them.
*/

export const customSteps = [
  { title: "Message us", text: "Tell us on WhatsApp what you want printed." },
  { title: "Share the details", text: "Send a photo or sketch, a rough size and your city." },
  { title: "Get a quote", text: "We reply with a price and timing before you pay." },
  { title: "Approve and pay", text: "Once you approve the quote, we start printing." },
];

export const customOptions = [
  {
    id: "drawers",
    title: "Custom-fit drawers",
    text: "Organisers made to the exact inside size of your drawer, so everything has a place.",
    icon: "drawer",
    message: drawerEnquiryMessage,
    cta: "Ask about drawers",
  },
  {
    id: "personalised",
    title: "Personalisation",
    text: "A name, a date, a logo or a short message on a print, for yourself or as a gift.",
    icon: "personalise",
    message: personalisedEnquiryMessage,
    cta: "Ask about personalising",
  },
  {
    id: "business",
    title: "Business orders",
    text: "Branded desk items, gifts and repeat orders for your team or your customers.",
    icon: "business",
    message: businessEnquiryMessage,
    cta: "Ask about business orders",
  },
] as const;

export const customFaq = [
  {
    id: "price",
    title: "How much will it cost?",
    content: "It depends on the size, the shape and how many you need. We send you a price before you pay anything.",
  },
  {
    id: "time",
    title: "How long does it take?",
    content: "We confirm the timing in your quote, once we know the size and quantity.",
  },
  {
    id: "area",
    title: "Where do you deliver?",
    content: "We currently deliver in Hyderabad. If you are somewhere else, message us and we will tell you what is possible.",
  },
  {
    id: "approve",
    title: "What if I do not like the quote?",
    content: "Nothing is printed or charged until you approve the quote. You can say no at any point before that.",
  },
];

/** Three short steps for the page sidebar. Icons, not numbers, so they do not clash with the form's own steps. */
export const nextSteps = [
  { icon: "send", title: "You send your request", text: "It takes about two minutes." },
  { icon: "quote", title: "We send a quote", text: "A price and timing, by phone or WhatsApp." },
  { icon: "approve", title: "You approve, then pay", text: "We start printing only after you say yes." },
] as const;
