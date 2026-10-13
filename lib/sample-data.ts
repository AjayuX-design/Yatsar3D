import type { Money } from "@/lib/format/money";

/*
  SAMPLE DATA ONLY. Used by the foundations preview.
  Nothing here is real. Prices, numbers and wording are placeholders and
  will be replaced by Shopify data and approved copy before launch.
*/

export const sampleStore = {
  // Placeholder. The real number is still an open decision.
  whatsappNumber: "919999999999",
  deliveryAreaText: "We currently deliver to [area].",
  // Placeholder wording. Shown only when there is a useful message.
  announcementText: "Delivering to [area]. Custom quotes on WhatsApp.",
  responseHours: "Replies within [hours]",
  mixedCartNote:
    "Placeholder. Ready items wait for made-to-order items unless you ask us to split the order.",
  // Placeholder. The real value is Shopify's checkoutUrl for the cart.
  checkoutUrl: "#checkout-handoff",
  businessLine: "[Business name, city and GST details to come]",
};

// SAMPLE discount codes for testing the cart. The real ones live in Shopify.
export const sampleDiscountCodes: Record<string, number> = { WELCOME10: 10 };

export const inr = (amount: string): Money => ({ amount, currencyCode: "INR" });

export const samplePrices = {
  regular: inr("1299"),
  compareAt: inr("1599"),
  withPaise: inr("849.5"),
  large: inr("125000"),
};

export const sampleProduct = {
  title: "Sample product",
  variant: "PETG, 18 cm",
  url: "https://example.com/products/sample-product",
};

export const sampleFaq = [
  {
    id: "material",
    title: "Material and care",
    body: "Placeholder text. Material, heat limits and cleaning notes will come from product data.",
  },
  {
    id: "finish",
    title: "About the print finish",
    body: "Placeholder text. Fine layer lines are part of a printed surface. Final wording is pending.",
  },
  {
    id: "delivery",
    title: "Delivery and returns",
    body: "Placeholder text. Final delivery and returns wording is pending business decisions.",
  },
];
