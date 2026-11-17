import { OrderTracking } from "./order-tracking";
import { StorefrontPage } from "../storefront-page";

export const metadata = { title: "Track your order | NIHAN", robots: { index: false }, referrer: "no-referrer" as const };

export default function Page() {
  return <StorefrontPage className="wrap commerce-page">
    <div className="head">
      <h1 className="category-title">Track your order</h1>
    </div>
    <div className="commerce-panel commerce-narrow"><OrderTracking /></div>
  </StorefrontPage>;
}
