import { CartPage } from "./cart-page";
import { StorefrontPage } from "../storefront-page";

export const metadata = { title: "Cart | NIHAN" };

export default function Page() {
  return <StorefrontPage className="wrap commerce-page">
    <div className="head">
      <h1 className="category-title">Your cart</h1>
    </div>
    <CartPage />
  </StorefrontPage>;
}
