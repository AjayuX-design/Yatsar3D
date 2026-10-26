import { money, type CartLine, type CartTotals } from "@/lib/cart/cart";

/*
  Shopify cart: GraphQL, response types, and the mapper to the shapes the cart
  UI already uses. Pure, so it can be checked without a network.
  Prices, stock and totals all come from Shopify. Nothing is calculated here
  except the subtotal shown before discounts.
*/

const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    discountCodes { code applicable }
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            quantityAvailable
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url altText }
            product {
              handle
              title
              options { name }
              featuredImage { url altText }
              fulfilment: metafield(namespace: "custom", key: "fulfilment_type") { value }
            }
          }
        }
      }
    }
  }
`;

const ERRORS = `userErrors { code message }`;

export const CART_QUERY = `${CART_FIELDS} query Cart($id: ID!) { cart(id: $id) { ...CartFields } }`;

export const CART_CREATE = `${CART_FIELDS}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) { cart { ...CartFields } ${ERRORS} }
  }`;

export const CART_LINES_ADD = `${CART_FIELDS}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${ERRORS} }
  }`;

export const CART_LINES_UPDATE = `${CART_FIELDS}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${ERRORS} }
  }`;

export const CART_LINES_REMOVE = `${CART_FIELDS}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } ${ERRORS} }
  }`;

export const CART_DISCOUNT_UPDATE = `${CART_FIELDS}
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { cart { ...CartFields } ${ERRORS} }
  }`;

type Money = { amount: string; currencyCode: string };
type Img = { url: string; altText?: string | null } | null;

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  discountCodes: { code: string; applicable: boolean }[];
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        quantityAvailable?: number | null;
        price: Money;
        compareAtPrice?: Money | null;
        image?: Img;
        product: {
          handle: string;
          title: string;
          options: { name: string }[];
          featuredImage?: Img;
          fulfilment?: { value: string } | null;
        };
      } | null;
    }[];
  };
};

/** What the cart UI shows. Safe to send to the browser: no secrets in it. */
export type CartView = {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  totals: CartTotals;
  /** The code applied to the cart, if Shopify accepted it. */
  discountCode: string | null;
};

const num = (m: Money) => Number(m.amount);

export function mapCart(cart: ShopifyCart): CartView {
  const lines: CartLine[] = cart.lines.nodes.flatMap((l) => {
    const v = l.merchandise;
    if (!v) return [];
    const fulfilment = v.product.fulfilment?.value === "ready_stock" ? "ready_stock" : "made_to_order";
    const img = v.image ?? v.product.featuredImage;
    const onlyDefault = v.product.options.length === 1 && v.product.options[0].name === "Title";
    return [
      {
        id: l.id,
        variantId: v.id,
        handle: v.product.handle,
        title: v.product.title,
        variantTitle: onlyDefault ? undefined : v.title,
        imageSrc: img?.url,
        imageAlt: img?.altText || v.product.title,
        price: money(num(v.price)),
        compareAt: v.compareAtPrice ? money(num(v.compareAtPrice)) : null,
        quantity: l.quantity,
        maxQuantity: fulfilment === "ready_stock" && v.quantityAvailable && v.quantityAvailable > 0 ? v.quantityAvailable : undefined,
        fulfilment,
      },
    ];
  });

  // Subtotal before discounts is price x quantity. The total is Shopify's own.
  const full = lines.reduce((sum, l) => sum + Number(l.price.amount) * l.quantity, 0);
  const total = num(cart.cost.totalAmount);
  const discount = Math.max(0, Math.round((full - total) * 100) / 100);
  const applied = cart.discountCodes.find((d) => d.applicable)?.code ?? null;

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines,
    totals: {
      count: cart.totalQuantity,
      subtotal: money(full),
      discount: money(discount),
      total: money(total),
      hasDiscount: discount > 0,
    },
    discountCode: applied,
  };
}
