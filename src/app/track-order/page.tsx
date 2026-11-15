import { OrderTracking } from "./order-tracking";

export const metadata = { title: "Track your order | NIHAN", robots: { index: false }, referrer: "no-referrer" as const };

export default function Page() {
  return <main className="wrap commerce-page">
    <h1 className="category-title">Track your order</h1>
    <div className="commerce-panel commerce-narrow"><OrderTracking /></div>
  </main>;
}
