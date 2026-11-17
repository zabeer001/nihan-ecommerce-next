import Link from "next/link";
import { Suspense } from "react";
import { categoryHref, getCategories } from "./catalog-api";
import { CartLink } from "./cart/cart-link";
import { StorefrontMenu } from "./storefront-menu";
import { ThemeToggle } from "./theme-toggle";

async function CategoryLinks() {
  const categories = await getCategories().catch(() => []);
  return categories.map(({ id, name }) => <Link key={id} href={categoryHref(id)}>{name}</Link>);
}

export function Header() {
  const links = (
    <>
      <Link href="/products">Shop</Link>
      <Suspense><CategoryLinks /></Suspense>
      <Link href="/our-story">Our story</Link>
      <Link href="/my-orders">My Orders</Link>
    </>
  );

  return (
    <header>
      <div className="wrap bar">
        <StorefrontMenu>{links}</StorefrontMenu>
        <Link className="logo" href="/" aria-label="NIHAN home">
          <span className="brand-wordmark" aria-hidden="true" />
        </Link>
        <div className="icons">
          <Suspense><ThemeToggle /></Suspense>
          <a className="account-link" href="/sign-in/" aria-label="Sign in">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
            </svg>
          </a>
          <CartLink />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fg">
          <div className="brand">
            <Link className="logo" href="/">NIHAN</Link>
            <p>Car fragrance, made with intent. Delivering across Bangladesh.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link href="/products">All products</Link>
            <Suspense><CategoryLinks /></Suspense>
          </div>
          <div>
            <h4>Help</h4>
            <Link href="/#faq">FAQs</Link>
            <Link href="/track-order">Track an order</Link>
            <span>Delivery</span>
            <span>Returns</span>
            <span>Contact</span>
          </div>
          <div>
            <h4>Follow</h4>
            <span>Instagram</span>
            <span>Facebook</span>
            <span>YouTube</span>
          </div>
        </div>
        <div className="copy">
          <span>© 2026 NIHAN</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}
