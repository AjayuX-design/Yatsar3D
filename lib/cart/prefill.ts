import { cookies } from "next/headers";
import { customerGql } from "@/lib/customer/api";
import { COOKIES, demoMode } from "@/lib/customer/config";
import { freshAccessToken } from "@/lib/customer/token";
import { shopifyFetch } from "@/lib/shopify/client";

/*
  Fills in checkout for a signed-in customer: their email, phone and default address are put on the
  cart, so Shopify's checkout opens already filled in. It is best effort: if anything goes wrong the
  cart works exactly as before and the customer types the details at checkout. The address is marked
  one-time-use, so checkout does not save a duplicate to their address book.
  Runs once per cart (a cookie remembers it) and again after an address changes or the customer signs in.
*/

const PREFILL_QUERY = /* GraphQL */ `
  query Prefill {
    customer {
      emailAddress { emailAddress }
      defaultAddress { firstName lastName address1 address2 city zoneCode zip phoneNumber }
    }
  }
`;

const BUYER = /* GraphQL */ `
  mutation Buyer($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) { cart { id } userErrors { code message } }
  }
`;
const ADDRESS = /* GraphQL */ `
  mutation Address($cartId: ID!, $addresses: [CartSelectableAddressInput!]!) {
    cartDeliveryAddressesReplace(cartId: $cartId, addresses: $addresses) { cart { id } userErrors { code message } }
  }
`;

type Prefill = {
  customer: {
    emailAddress?: { emailAddress?: string | null } | null;
    defaultAddress?: { firstName?: string | null; lastName?: string | null; address1?: string | null; address2?: string | null; city?: string | null; zoneCode?: string | null; zip?: string | null; phoneNumber?: string | null } | null;
  } | null;
};

export async function prefillCart(cartId: string) {
  try {
    const jar = await cookies();
    if (jar.get(COOKIES.cartSync)?.value === cartId) return;
    if (demoMode()) return;
    const token = await freshAccessToken();
    if (!token) return; // not signed in

    const { customer } = await customerGql<Prefill>(token, PREFILL_QUERY);
    const email = customer?.emailAddress?.emailAddress ?? undefined;
    const a = customer?.defaultAddress;
    const phone = a?.phoneNumber ?? undefined;

    if (email || phone) {
      const r = await shopifyFetch({ query: BUYER, variables: { cartId, buyerIdentity: { email, phone, countryCode: "IN" } } });
      if (!r.ok) console.error("[cart] buyer identity failed", JSON.stringify(r.error));
    }
    if (a?.address1 && a.city && a.zip) {
      const r = await shopifyFetch({
        query: ADDRESS,
        variables: {
          cartId,
          addresses: [
            {
              selected: true,
              oneTimeUse: true,
              address: {
                deliveryAddress: {
                  firstName: a.firstName ?? undefined,
                  lastName: a.lastName ?? undefined,
                  address1: a.address1,
                  address2: a.address2 ?? undefined,
                  city: a.city,
                  provinceCode: a.zoneCode ?? undefined,
                  zip: a.zip,
                  countryCode: "IN",
                  phone,
                },
              },
            },
          ],
        },
      });
      if (!r.ok) console.error("[cart] delivery address failed", JSON.stringify(r.error));
    }
    // Remember it even if a step failed, so a bad address cannot cause a retry on every click.
    jar.set(COOKIES.cartSync, cartId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 10 });
  } catch (e) {
    console.error("[cart] prefill skipped", e instanceof Error ? e.message : e);
  }
}
