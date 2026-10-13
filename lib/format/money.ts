// Same shape as Shopify's MoneyV2, so real data can drop in later.
export type Money = { amount: string; currencyCode: string };

export function formatMoney({ amount, currencyCode }: Money) {
  const n = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}
