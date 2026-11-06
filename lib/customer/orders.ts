import type { Money } from "@/lib/format/money";

/*
  What the account pages need to know about an order, and the question
  "where is my order?" answered only from facts Shopify confirms.
*/

export type OrderLine = { id: string; name: string; variantTitle?: string; quantity: number; image?: { url: string; alt: string }; total?: Money };
export type Shipment = { latest?: string; carrier?: string; trackingNumber?: string; trackingUrl?: string; estimatedDeliveryAt?: string };
export type OrderView = {
  id: string;
  number: number;
  name: string;
  processedAt: string;
  cancelledAt?: string;
  paymentStatus?: string;
  fulfillmentStatus: string;
  total: Money;
  subtotal?: Money;
  shipping?: Money;
  tax?: Money;
  lines: OrderLine[];
  shipments: Shipment[];
  address: string[];
  statusPageUrl: string;
};
export type CustomerView = { displayName: string; firstName?: string; email?: string; orders: OrderView[] };

export type Stage = "placed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

/**
 * Placed: we have the order. Shipped: Shopify shows a shipment. Delivered: only when the
 * carrier's last update says delivered, for every shipment. We never show a step Shopify cannot confirm.
 */
export function orderStage(o: Pick<OrderView, "cancelledAt" | "fulfillmentStatus" | "shipments">): Stage {
  if (o.cancelledAt) return "cancelled";
  const s = o.shipments;
  if (s.length && s.every((x) => x.latest === "DELIVERED" || x.latest === "PICKED_UP")) return "delivered";
  if (s.some((x) => x.latest === "OUT_FOR_DELIVERY")) return "out_for_delivery";
  if (s.length || ["FULFILLED", "PARTIALLY_FULFILLED", "IN_PROGRESS"].includes(o.fulfillmentStatus)) return "shipped";
  return "placed";
}

export const stageLabel: Record<Stage, string> = {
  placed: "Order placed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** The three steps shown on the order page, and how far along an order is. */
export const trackerSteps = ["Order placed", "Shipped", "Delivered"] as const;
export const stageStep: Record<Stage, number> = { placed: 0, shipped: 1, out_for_delivery: 1, delivered: 2, cancelled: 0 };

const payment: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Payment pending",
  AUTHORIZED: "Payment authorised",
  PARTIALLY_PAID: "Partly paid",
  PARTIALLY_REFUNDED: "Partly refunded",
  REFUNDED: "Refunded",
  VOIDED: "Payment voided",
  EXPIRED: "Payment expired",
};
export const paymentLabel = (s?: string) => (s ? (payment[s] ?? "") : "");
