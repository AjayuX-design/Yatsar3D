import { METAFIELD_KEYS, METAFIELD_NAMESPACE } from "./mappers";

/*
  Read-only Storefront API queries. Fields match ShopifyProduct in mappers.ts.
  quantityAvailable needs the "read product inventory" permission on the token.
*/

const identifiers = METAFIELD_KEYS.map((key) => `{ namespace: "${METAFIELD_NAMESPACE}", key: "${key}" }`).join(", ");

const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    handle
    title
    descriptionHtml
    publishedAt
    options { name values }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        weight
        weightUnit
      }
    }
    media(first: 10) {
      nodes { ... on MediaImage { image { url altText } } }
    }
    collections(first: 1) { nodes { handle title } }
    metafields(identifiers: [${identifiers}]) { key value }
  }
`;

export const PRODUCT_BY_HANDLE = `
  ${PRODUCT_FIELDS}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
`;

export const PRODUCTS = `
  ${PRODUCT_FIELDS}
  query Products($first: Int!) {
    products(first: $first) { nodes { ...ProductFields } }
  }
`;

export const COLLECTION_BY_HANDLE = `
  ${PRODUCT_FIELDS}
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      handle
      title
      description
      products(first: $first) { nodes { ...ProductFields } }
    }
  }
`;

export const COLLECTIONS = `
  query Collections {
    collections(first: 10) { nodes { handle title description } }
  }
`;
