# Yatsar 3D storefront

Next.js (App Router) + Tailwind v4. Shopify will be the backend later. Sample data only for now.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Pages built so far, all on sample data:

- `/` homepage
- `/collections/all`, `/collections/desk`, `/collections/seasonal` (empty state)
- `/products/desk-organiser` and four other sample products
- cart drawer (opens from the header, or after Add to cart; sample code `WELCOME10`)
- `/preview` every token, component and state

Not built yet: Custom prints, Delivery, FAQ and policy pages. Their links in the header and footer lead to a 404 for now.

## Checks

```bash
npm run lint
npm run check:tokens   # preview colours match app/globals.css
npm run check:select   # variant selection, spec rows and formatting logic
npm run build
```

## Where things live

- `app/globals.css` colour, radius and type tokens (light mode only)
- `components/ui` buttons, chips, price, stepper, accordion, info card
- `components/enquiry` WhatsApp button and enquiry card, block and link
- `components/layout` header, mobile menu, footer, announcement bar
- `components/cart` cart drawer, lines, discount field. `lib/cart` holds the cart rules and a sample client cart.
- `components/collection` sort control
- `components/product` product card, gallery, variant selector, fulfilment box, spec table, sticky buy bar
- `lib/types.ts` the product shape the UI uses. A Shopify mapper will fill it later.
- `lib/sample-data.ts`, `lib/sample-products.ts` placeholder data. Replace with Shopify data later.

## Where the data comes from

`lib/data/index.ts` decides, using environment variables:

- Shopify settings present: real products from Shopify.
- `SHOPIFY_USE_SAMPLE_DATA=true`: built-in sample products, for building the interface.
- No Shopify settings on a preview or on your machine: sample products.
- No Shopify settings on Vercel Production: an error state. It never shows fake prices.

Copy `.env.example` to `.env.local` to configure. Never commit `.env.local`.
