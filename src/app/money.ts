const bdt = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" });

export function formatPrice(cents: number) {
  return bdt.format(cents / 100);
}
