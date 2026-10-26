/*
  The shop's four categories (Shopify collections):
    Desk & Tech, Drawers & Storage, Home Essentials, Custom Orders.
  Custom Orders is an enquiry, not a shelf of products, so it opens the
  custom print page instead of a collection page.
*/

export const CUSTOM_ORDERS_HANDLE = "custom-orders";

export const categoryHref = (handle: string) =>
  handle === CUSTOM_ORDERS_HANDLE ? "/custom-print" : `/collections/${handle}`;
