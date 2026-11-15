import { OrderList } from "./order-list";

export const metadata = { title: "My Orders | NIHAN", robots: { index: false }, referrer: "no-referrer" as const };

export default function Page() {
  return (
    <main className="wrap commerce-page">
      <h1 className="category-title">My Orders</h1>
      <p className="commerce-muted saved-orders-note">Guest orders saved in this browser.</p>
      <OrderList />
    </main>
  );
}
