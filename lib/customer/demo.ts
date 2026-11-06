import type { CustomerView } from "./orders";

/* Pretend customer for local design work (CUSTOMER_ACCOUNT_DEMO=true). Never used in production. */

const inr = (amount: string) => ({ amount, currencyCode: "INR" });
const address = ["Asha Rao", "12, Road No. 5, Banjara Hills", "Hyderabad 500034", "India"];

export const demoCustomer: CustomerView = {
  displayName: "Asha Rao",
  firstName: "Asha",
  email: "asha@example.com",
  orders: [
    {
      id: "demo-1003", number: 1003, name: "#1003", processedAt: "2026-11-05T09:12:00+05:30",
      paymentStatus: "PAID", fulfillmentStatus: "UNFULFILLED",
      total: inr("1448"), subtotal: inr("1448"), shipping: inr("0"), tax: inr("0"), address, statusPageUrl: "https://example.com",
      lines: [
        { id: "l1", name: "Desk organiser", variantTitle: "PLA", quantity: 1, image: { url: "/mock/desk-organiser-hero.svg", alt: "Desk organiser" }, total: inr("1299") },
        { id: "l2", name: "Bookmark set", quantity: 1, image: { url: "/mock/bookmark-set-hero.svg", alt: "Bookmark set" }, total: inr("149") },
      ],
      shipments: [],
    },
    {
      id: "demo-1002", number: 1002, name: "#1002", processedAt: "2026-10-30T18:40:00+05:30",
      paymentStatus: "PAID", fulfillmentStatus: "FULFILLED",
      total: inr("559"), subtotal: inr("499"), shipping: inr("60"), tax: inr("0"), address, statusPageUrl: "https://example.com",
      lines: [{ id: "l3", name: "Phone stand", variantTitle: "PLA", quantity: 1, image: { url: "/mock/phone-stand-hero.svg", alt: "Phone stand" }, total: inr("499") }],
      shipments: [{ latest: "IN_TRANSIT", carrier: "Delhivery", trackingNumber: "DL123456789", trackingUrl: "https://example.com/track", estimatedDeliveryAt: "2026-11-07T18:00:00+05:30" }],
    },
    {
      id: "demo-1001", number: 1001, name: "#1001", processedAt: "2026-10-20T11:05:00+05:30",
      paymentStatus: "PAID", fulfillmentStatus: "FULFILLED",
      total: inr("199"), subtotal: inr("199"), shipping: inr("0"), tax: inr("0"), address, statusPageUrl: "https://example.com",
      lines: [{ id: "l4", name: "Fear Not fridge magnet", quantity: 1, image: { url: "/products/square/fear-not-magnet-front-1200.jpg", alt: "Fear Not fridge magnet" }, total: inr("199") }],
      shipments: [{ latest: "DELIVERED", carrier: "India Post", trackingNumber: "EE987654321IN", trackingUrl: "https://example.com/track" }],
    },
  ],
};
