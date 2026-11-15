# NIHAN storefront and order integration

## Baseline audit

Next.js reads Laravel’s public catalog endpoints for categories, products, active variants, prices, availability, and photos. Laravel’s Inertia dashboard already supports staff COD orders, printable invoices, status history, stock deduction, and stock restoration on cancellation.

At the time of the audit, shoppers could select a variant but had no cart, checkout, confirmation, or tracking. The unfiltered catalog could show products without an active category that the order workflow would reject. Search, Account, and Subscribe are placeholders. Storefront lint and TypeScript checks and 21 focused Laravel tests passed. The local Laravel HTTP endpoint was unavailable during the audit.

## Guest COD flow

A shopper selects a variant and quantity, reviews the cart, and checks out with their name, phone, address, and optional email. The cart persists in the browser. Product pages show Sold out for variants with zero stock. Staff can update a variant via Dashboard → Inventory → Adjust. Laravel quotes active variants and the configured flat delivery fee in integer BDT minor units. Stock and prices are checked again when the shopper places the order. A changed price or fee requires review, and unavailable lines remain in the cart for correction.

Laravel creates a Pending order, saves line prices, and deducts stock transactionally. The same submission key is reused after uncertain responses. The shopper receives a private tracking link, with the secret in the URL fragment. My Orders saves confirmed orders in the current browser, and opening a valid tracking link adds or refreshes its entry. Staff manage fulfillment through the existing dashboard. Staff and storefront orders share the same status progression and cancellation rules.

## API and configuration

Next.js exposes same-origin POST handlers under `/api/storefront/` and forwards them to Laravel over the server-configured `NIHAN_CATALOG_API_URL`. All commerce responses use no-store caching.

| Laravel route | Request | Response |
| --- | --- | --- |
| `POST /api/storefront/quote` | `items` with `variant_id` and `quantity` | Current product and variant details, SKU, thumbnail, availability, prices, subtotal, flat delivery fee and total |
| `POST /api/storefront/orders` | Items, contact fields, UUID submission key, tracking secret, and the accepted line prices and delivery fee | Order reference, status, totals, and status history |
| `POST /api/storefront/tracking` | Tracking secret | The same guest-safe order fields, or 404 |

Laravel uses `STOREFRONT_DELIVERY_CENTS` to enable quotes and new guest orders. Set it explicitly in the runtime environment. For example, `8000` means BDT 80 and `0` means free delivery. Apply the Laravel migrations and verify the API in staging before deploying the Next.js UI. Check that the application origin serves catalog images over HTTPS.

## Release checks

- Verify cart persistence and quantity editing, quote changes, COD submission, confirmation recovery, and private tracking on mobile and desktop.
- Verify the same reference and totals in the staff dashboard, move the order through fulfillment, and confirm a cancellation restores inventory once.
- Exercise invalid contact and tracking inputs, unauthorized staff requests, duplicate submissions, and concurrent purchases of the last unit against MySQL.
- Customer accounts, online payments, courier integrations, and automated notifications are deferred.
