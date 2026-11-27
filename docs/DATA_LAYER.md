# NIHan data layer setup

The storefront queues standard GA4 ecommerce events in `window.dataLayer`. Events work without a GTM ID; sending them to GA4 or advertising platforms requires a configured GTM container.

Access is controlled by **Roles → Storefront SEO & Tracking → Manage Storefront SEO & Tracking** (`storefront.manage`). Admin and superadmin receive this permission; grant it explicitly to other roles. Homepage management is a separate permission.

## Enable Google Tag Manager

1. Create a Web container in Google Tag Manager and copy its `GTM-...` ID.
2. Open admin **Settings → Storefront SEO & Tracking**, enter your **Google Tag Manager container ID**, and save. Reload the storefront to use the saved value; no storefront rebuild is needed. `NEXT_PUBLIC_GTM_ID` remains an optional build-time fallback when the Settings ID is blank.
3. In GTM, add a Google tag using your GA4 measurement ID (`G-...`).
4. Create a Custom Event trigger with regex matching enabled and this event name:
   `^(view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|purchase)$`
5. Add a GA4 Event tag using the Google tag's measurement ID. Use the built-in `{{Event}}` variable as the event name, enable **Send Ecommerce data**, and select **Data Layer** as its source. Attach the custom event trigger.
6. Use GTM Preview to verify the events and GA4 DebugView to verify receipt before publishing the container.

## Event reference

| Event | Trigger |
| --- | --- |
| `page_view` | Initial storefront load and pathname changes; contains `page_path` only |
| `view_item` | Product detail loads or a different variant is selected |
| `add_to_cart` | Successful addition from product cards/details, or a cart quantity increase |
| `remove_from_cart` | Cart quantity decreases or an item is removed |
| `view_cart` | Cart has a successful, available price quote |
| `begin_checkout` | Checkout has a successful, available price quote |
| `purchase` | Server confirms a COD order, including recovery of an uncertain submission |

The Data Layer is always enabled. It supplies analytics and advertising events; SEO title, description, and Google verification are managed separately in Settings.

For manual page tracking in GA4, create a separate `page_view` Custom Event tag with `page_path` mapped from the Data Layer, and turn off automatic page views/history measurement to avoid duplicates. Keep automatic URL/fragment collection disabled for private tracking links.

Every ecommerce event clears the previous ecommerce object, then includes `currency: "BDT"`, `value`, and `items`. Item fields are `item_id` (stable variant ID), `item_name`, optional `item_variant`, `price`, and `quantity`. Prices are taka amounts, converted from integer cents; `value` excludes delivery. Cart changes contain only the changed quantity. Cart and checkout views fire again if their quoted items/prices change.

Purchase adds `transaction_id` (order reference) and `shipping` (delivery amount). Purchase means the COD order was received, not that payment was collected or delivery completed. The backend receipt supplies the subtotal/delivery values; the accepted checkout snapshot supplies items. Purchase events are deduplicated in memory and session storage; GA4 also receives a stable transaction ID. Old checkout attempts created before this feature have no item snapshot and do not emit purchase events. Old saved cart lines without prices do not emit cart-change events until re-added; quoted cart/checkout events still work.

Example:

```js
window.dataLayer.push({ ecommerce: null });
window.dataLayer.push({
  event: 'purchase',
  ecommerce: {
    currency: 'BDT', transaction_id: '101', value: 250.5, shipping: 80,
    items: [{ item_id: '12', item_name: 'Diffuser', price: 125.25, quantity: 2 }]
  }
});
```

Customer names, email, phone, delivery address, and private tracking secrets are not included in these ecommerce payloads. When configuring GTM, avoid collecting URL fragments or private tracking links through automatic page-view tags. Do not create a second copy of these ecommerce events in GTM. The global Meta Pixel configured under admin Settings remains separate; configure any additional advertising tags deliberately to avoid counting the same action twice.

To inspect locally, open the browser console and run `window.dataLayer.filter(entry => entry.event)`. Test a product view, add/increase/decrease/remove, checkout, and a confirmed test COD order. Failed validation and failed/unconfirmed orders must not produce `purchase`.

## Product management

Use **Add product** in the admin sidebar or **Products → Add product**. Fill the product/price/stock/photo fields and save. Products require the `products.create` permission.

Use **Products → Delete** to remove a product from sale. Confirm the Delete product dialog; the backend soft-deletes the product and archives its variants, preserving existing orders and stock history. Deleted products disappear from the admin product list and storefront. Creating, viewing, editing, and deleting remain permission controlled (`products.create`, `products.view`, `products.update`, `products.delete`). An administrator can grant these under Roles; this change does not broaden existing staff permissions.

Official references: [Google data layer](https://developers.google.com/tag-platform/tag-manager/datalayer), [GA4 ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm).
