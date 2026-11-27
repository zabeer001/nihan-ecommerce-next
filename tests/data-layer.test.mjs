import assert from 'node:assert/strict';
import test from 'node:test';
import { ecommerceEvent, purchaseEvent } from '../src/app/data-layer.ts';

const items = [{ item_id: '12', item_name: 'Diffuser', price: 125.25, quantity: 2 }];

test('queues GA4 ecommerce events with BDT amounts and clears previous ecommerce data', () => {
  globalThis.window = {};
  ecommerceEvent('add_to_cart', items);
  assert.deepEqual(window.dataLayer, [
    { ecommerce: null },
    { event: 'add_to_cart', ecommerce: { currency: 'BDT', value: 250.5, items } },
  ]);
});

test('confirmed purchases separate delivery and deduplicate repeated confirmations', () => {
  window.dataLayer = [];
  const saved = new Map();
  globalThis.sessionStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  purchaseEvent(101, items, 25050, 8000);
  purchaseEvent(101, items, 25050, 8000);
  assert.equal(window.dataLayer.length, 2);
  assert.deepEqual(window.dataLayer[1].ecommerce, {
    currency: 'BDT', transaction_id: '101', value: 250.5, shipping: 80, items,
  });
  saved.set('nihan-purchase-102', '1');
  purchaseEvent(102, items, 25050, 8000);
  assert.equal(window.dataLayer.length, 2);
});

test('analytics failures and blocked storage do not interrupt commerce', () => {
  globalThis.sessionStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  window.dataLayer = { push() { throw Error('broken tag'); } };
  assert.doesNotThrow(() => purchaseEvent(103, items, 25050, 8000));
  delete globalThis.window;
  assert.doesNotThrow(() => ecommerceEvent('view_item', items));
});
