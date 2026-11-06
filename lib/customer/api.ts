import type { CustomerView, OrderView } from "./orders";
import { readAccountConfig } from "./config";

/* Reads the signed-in customer and their orders from Shopify's Customer Account API. */

const QUERY = /* GraphQL */ `
  query AccountOrders($first: Int!) {
    customer {
      displayName
      firstName
      emailAddress { emailAddress }
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          number
          processedAt
          cancelledAt
          financialStatus
          fulfillmentStatus
          statusPageUrl
          totalPrice { amount currencyCode }
          subtotal { amount currencyCode }
          totalShipping { amount currencyCode }
          totalTax { amount currencyCode }
          shippingAddress { formatted(withName: true) }
          lineItems(first: 20) {
            nodes { id name variantTitle quantity image { url altText } totalPrice { amount currencyCode } }
          }
          fulfillments(first: 10) {
            nodes { latestShipmentStatus estimatedDeliveryAt trackingInformation { company number url } }
          }
        }
      }
    }
  }
`;

type Money = { amount: string; currencyCode: string };
type Raw = {
  customer: {
    displayName: string;
    firstName?: string | null;
    emailAddress?: { emailAddress?: string | null } | null;
    orders: {
      nodes: {
        id: string;
        name: string;
        number: number;
        processedAt: string;
        cancelledAt?: string | null;
        financialStatus?: string | null;
        fulfillmentStatus: string;
        statusPageUrl: string;
        totalPrice: Money;
        subtotal?: Money | null;
        totalShipping?: Money | null;
        totalTax?: Money | null;
        shippingAddress?: { formatted: string[] } | null;
        lineItems: { nodes: { id: string; name: string; variantTitle?: string | null; quantity: number; image?: { url: string; altText?: string | null } | null; totalPrice?: Money | null }[] };
        fulfillments: { nodes: { latestShipmentStatus?: string | null; estimatedDeliveryAt?: string | null; trackingInformation: { company?: string | null; number?: string | null; url?: string | null }[] }[] };
      }[];
    };
  } | null;
};

export class SessionExpired extends Error {}

// Same trick as the sign-in addresses: look up the GraphQL address once per warm server.
const endpointMemo = new Map<string, string>();
async function endpoint(domain: string, version: string, shopId?: string) {
  if (shopId) return `https://shopify.com/${shopId}/account/customer/api/${version}/graphql`;
  const hit = endpointMemo.get(domain);
  if (hit) return hit.replace(/\/\d{4}-\d{2}\/graphql$/, `/${version}/graphql`);
  const res = await fetch(`https://${domain}/.well-known/customer-account-api`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Account API address could not be read (${res.status})`);
  const url = ((await res.json()) as { graphql_api?: string }).graphql_api;
  if (!url) throw new Error("Account API address is missing");
  endpointMemo.set(domain, url);
  return url.replace(/\/\d{4}-\d{2}\/graphql$/, `/${version}/graphql`);
}

export function mapCustomer(raw: NonNullable<Raw["customer"]>): CustomerView {
  const orders: OrderView[] = raw.orders.nodes.map((o) => ({
    id: o.id,
    number: o.number,
    name: o.name,
    processedAt: o.processedAt,
    cancelledAt: o.cancelledAt ?? undefined,
    paymentStatus: o.financialStatus ?? undefined,
    fulfillmentStatus: o.fulfillmentStatus,
    total: o.totalPrice,
    subtotal: o.subtotal ?? undefined,
    shipping: o.totalShipping ?? undefined,
    tax: o.totalTax ?? undefined,
    statusPageUrl: o.statusPageUrl,
    address: o.shippingAddress?.formatted ?? [],
    lines: o.lineItems.nodes.map((l) => ({
      id: l.id,
      name: l.name,
      variantTitle: l.variantTitle ?? undefined,
      quantity: l.quantity,
      image: l.image ? { url: l.image.url, alt: l.image.altText || l.name } : undefined,
      total: l.totalPrice ?? undefined,
    })),
    shipments: o.fulfillments.nodes.map((f) => {
      const t = f.trackingInformation[0];
      return {
        latest: f.latestShipmentStatus ?? undefined,
        estimatedDeliveryAt: f.estimatedDeliveryAt ?? undefined,
        carrier: t?.company ?? undefined,
        trackingNumber: t?.number ?? undefined,
        trackingUrl: t?.url ?? undefined,
      };
    }),
  }));
  return { displayName: raw.displayName, firstName: raw.firstName ?? undefined, email: raw.emailAddress?.emailAddress ?? undefined, orders };
}

/** The signed-in customer and their latest orders. Throws SessionExpired when the token is no longer good. */
export async function fetchCustomer(accessToken: string): Promise<CustomerView> {
  const cfg = readAccountConfig(process.env);
  if (!cfg.ok) throw new Error("Customer accounts are not set up");
  const url = await endpoint(cfg.config.domain, cfg.config.apiVersion, cfg.config.shopId);
  const res = await fetch(url, {
    method: "POST",
    // Shopify wants the raw token here, without "Bearer".
    headers: { "Content-Type": "application/json", Authorization: accessToken },
    body: JSON.stringify({ query: QUERY, variables: { first: 50 } }),
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) throw new SessionExpired();
  if (!res.ok) throw new Error(`Orders could not be loaded (${res.status})`);
  const json = (await res.json()) as { data?: Raw; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data?.customer) throw new SessionExpired();
  return mapCustomer(json.data.customer);
}
