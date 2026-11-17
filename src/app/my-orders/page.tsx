import { OrderList } from "./order-list";
import { StorefrontPage } from "../storefront-page";

export const metadata = { title: "My Orders | NIHAN", robots: { index: false }, referrer: "no-referrer" as const };

export default function Page() {
  return (
    <StorefrontPage className="wrap commerce-page">
      <div className="head">
        <h1 className="category-title">My Orders</h1>
        <p className="commerce-muted saved-orders-note">Guest orders saved in this browser.</p>
      </div>
      <OrderList />
    </StorefrontPage>
  );
}
