// Live connection test. Needs a filled .env.local. Prints no secrets.
// Run: npm run check:shopify
import { shopifyFetch } from "@/lib/shopify/client";

async function main() {
  const result = await shopifyFetch<{ shop: { name: string; primaryDomain: { host: string } } }>({
    query: "{ shop { name primaryDomain { host } } }",
  });

  if (!result.ok) {
    console.error("Shopify connection failed:", JSON.stringify(result.error));
    process.exit(1);
  }
  console.log(`Connected to "${result.data.shop.name}" (${result.data.shop.primaryDomain.host}).`);
}

void main();
