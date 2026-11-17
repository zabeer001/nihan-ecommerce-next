import { CheckoutPage } from "./checkout-page";
import { StorefrontPage } from "../storefront-page";

export const metadata = { title: "Checkout | NIHAN", robots: { index: false } };

export default function Page() {
  return <StorefrontPage className="wrap commerce-page">
    <div className="head">
      <h1 className="category-title">Checkout</h1>
    </div>
    <CheckoutPage />
  </StorefrontPage>;
}
