import { CheckoutPage } from "./checkout-page";

export const metadata = { title: "Checkout | NIHAN", robots: { index: false } };

export default function Page() {
  return <main className="wrap commerce-page">
    <h1 className="category-title">Checkout</h1>
    <CheckoutPage />
  </main>;
}
