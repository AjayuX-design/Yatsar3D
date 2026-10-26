/*
  Policy pages, as plain data so one template renders all four.

  DRAFT. Written in plain language from what the shop has decided so far:
  delivery in Hyderabad, Shopify checkout, quotes before payment for custom orders,
  requests emailed to the shop mailbox. Items the shop still has to decide are
  collected in the notes the owner was given, and the pages are kept out of search
  engines until they are confirmed. This is not legal advice: have a professional
  read the final wording, especially Terms and Privacy.
*/

export const POLICY_UPDATED = "26 October 2026";
export const CONTACT_EMAIL = "hello@yatsar3d.com";

type Block = string | { list: string[] };
export type Policy = {
  slug: string;
  title: string;
  summary: string;
  sections: Array<{ heading: string; body: Block[] }>;
};

export const policies: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping policy",
    summary: "Where we deliver, how long it takes and what to do if something goes wrong on the way.",
    sections: [
      {
        heading: "Where we deliver",
        body: [
          "We currently deliver in Hyderabad. If you are somewhere else, message us and we will tell you what is possible before you order.",
        ],
      },
      {
        heading: "How long it takes",
        body: [
          "Every product page shows two times. The first is how long we take to get your order ready. The second is how long delivery takes after we dispatch it.",
          { list: [
            "Ready to ship items are in stock. We pack and dispatch them in the time shown on the product page.",
            "Made to order items are printed after you order, so they take longer. The production time is shown before you pay.",
          ] },
          "Add the two times together for the full time from order to delivery. These are estimates, not guarantees. Printing, busy periods and weather can add time, and we will tell you if your order is going to be late.",
        ],
      },
      {
        heading: "Delivery charges",
        body: ["If there is a delivery charge, it is shown at checkout before you pay. The price you see at checkout is the price you pay."],
      },
      {
        heading: "Your address",
        body: [
          "Please check your address and phone number when you order. A courier may call you before delivery. If an order cannot be delivered because the details were wrong or nobody could receive it, we will contact you to arrange another attempt, which may cost extra.",
        ],
      },
      {
        heading: "Custom orders",
        body: [
          "We confirm the timing for custom orders in your quote, once we know the size and quantity. Delivery for custom orders follows the same rules as above.",
        ],
      },
      {
        heading: "Damaged or missing items",
        body: [
          "If your order arrives damaged, or something is missing, follow the steps in our returns policy. Please keep the packaging and take photos when you open it.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns and damage",
    summary: "What we do if your order arrives damaged, wrong or incomplete.",
    sections: [
      {
        heading: "If something is wrong with your order",
        body: [
          "If your item arrives damaged, is not what you ordered, or something is missing, message us within 48 hours of delivery. Send photos of the item and the packaging.",
          "After we check the photos, we will replace the item or refund you. We will tell you which, and when to expect it, in our reply.",
        ],
      },
      {
        heading: "Made to order and custom items",
        body: [
          "Made to order and custom items are printed for you, so we cannot take them back if you change your mind. If one arrives damaged or not as agreed in your quote, the rule above applies.",
        ],
      },
      {
        heading: "What is not a fault",
        body: [
          "3D prints are made layer by layer. Fine layer lines, and small differences in colour or finish between prints and batches, are normal and are not faults. Each product page describes the print finish.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Refunds go back to the way you paid. We will tell you how long it should take when we confirm your refund.",
        ],
      },
      {
        heading: "Cancelling an order",
        body: [
          "Message us as soon as you can. Made to order items start printing quickly, so the sooner you tell us, the more we can do. Once an item is printed or dispatched we may not be able to cancel it.",
        ],
      },
      {
        heading: "How to reach us",
        body: [`Message us on WhatsApp, or email ${CONTACT_EMAIL}. Please include your order number.`],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    summary: "What information we collect, why, who sees it and your choices.",
    sections: [
      {
        heading: "Who we are",
        body: [`Yatsar 3D sells 3D-printed products from Hyderabad, India. You can contact us at ${CONTACT_EMAIL}.`],
      },
      {
        heading: "What we collect",
        body: [
          { list: [
            "When you order: your name, phone number, email address and delivery address. Payment details are entered on the secure checkout and handled by Shopify and the payment provider. We never see or store your card number.",
            "When you send a custom order request: the details you type, your contact details and any photos you add. We receive these as an email.",
            "When you message us on WhatsApp or email: whatever you send.",
            "Basic technical data: our web host keeps standard server logs, such as your IP address and the pages you opened.",
          ] },
        ],
      },
      {
        heading: "How we use it",
        body: [
          { list: [
            "To take, make, deliver and support your order.",
            "To reply to your custom order request and send you a quote.",
            "To keep the shop secure and fix problems.",
            "To meet legal and tax duties.",
          ] },
          "We do not sell your information. We do not send marketing messages unless you ask us to.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "Only the services we need to run the shop, and only the parts they need:",
          { list: [
            "Shopify, which runs our products, cart and checkout, and the payment provider it uses.",
            "Delivery couriers, who receive your name, phone number and address.",
            "Our web host (Vercel) and our email host (Hostinger), which store the shop and the emails we receive.",
          ] },
          "We may also share information if the law requires it.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use a cookie that remembers your cart. Shopify uses cookies at checkout to keep your order working and secure. We do not use advertising or tracking cookies on this site.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "We keep order records for as long as the law and our accounts require. Custom order requests and photos are kept while we work on your request and for a reasonable time after, then deleted.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          `You can ask to see the information we hold about you, to correct it, or to have it deleted, unless we must keep it by law. Email ${CONTACT_EMAIL} and we will reply.`,
        ],
      },
      {
        heading: "Children",
        body: ["Our shop is meant for adults. We do not knowingly collect information from children."],
      },
      {
        heading: "Changes",
        body: [`We may update this policy. The date at the top shows when it last changed (${POLICY_UPDATED}).`],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of service",
    summary: "The rules for using this website and buying from us.",
    sections: [
      {
        heading: "About these terms",
        body: [
          "By using this website or placing an order, you agree to these terms. If you do not agree, please do not use the site.",
        ],
      },
      {
        heading: "Products",
        body: [
          "We describe our products as accurately as we can, including size and timing. Because every print is made layer by layer, small differences in colour, finish and size between prints are normal. Photos are a guide.",
        ],
      },
      {
        heading: "Prices and payment",
        body: [
          "Prices are in Indian rupees and are shown at checkout before you pay. Checkout is run by Shopify. We may cancel and refund an order if there was a pricing or stock mistake, and we will tell you.",
        ],
      },
      {
        heading: "Orders",
        body: [
          "Your order is confirmed when you receive our confirmation. Delivery, returns and cancellations follow our shipping policy and returns policy.",
        ],
      },
      {
        heading: "Custom orders",
        body: [
          "For custom orders we send a quote with a price and timing. We start work only after you approve the quote and pay.",
          "If you send us a design, name, logo or image, you confirm you have the right to use it and to have it printed. We may decline an order that appears to copy someone else's work, or that is unlawful or unsafe.",
        ],
      },
      {
        heading: "Using the site",
        body: [
          "Please do not misuse the site, try to break into it, or use it to send spam. The content on this site, including text, photos and designs, belongs to Yatsar 3D or its owners. Please do not copy it without our permission.",
        ],
      },
      {
        heading: "Our responsibility",
        body: [
          "Our 3D-printed products are made for the uses described on their pages. Please follow the care notes. To the extent the law allows, our responsibility for any order is limited to the price you paid for it.",
        ],
      },
      {
        heading: "Governing law",
        body: ["These terms are governed by the laws of India. Any dispute will be handled by the courts at Hyderabad, Telangana."],
      },
      {
        heading: "Contact",
        body: [`Questions about these terms? Email ${CONTACT_EMAIL}.`],
      },
    ],
  },
];

export const getPolicy = (slug: string) => policies.find((p) => p.slug === slug);
