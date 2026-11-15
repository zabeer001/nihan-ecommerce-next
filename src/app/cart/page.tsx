import { CartPage } from "./cart-page";

export const metadata = { title: "Cart | NIHAN" };

export default function Page() {
  return <main className="wrap commerce-page">
    <h1 className="category-title">Your cart</h1>
    <CartPage />
  </main>;
}
