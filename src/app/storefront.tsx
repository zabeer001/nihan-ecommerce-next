import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <>
      <div className="ann" id="top">Delivering across Bangladesh · Est. 2026</div>
      <header>
        <div className="wrap bar">
          <Link className="logo" href="/" aria-label="NIHAN home">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 8l8 4 8-3 8 3 8-4-2 12 3 9-8 10-9 4-9-4-8-10 3-9z" />
              <path d="M17 24l5 2M31 24l-5 2M24 28v8M20 37l4 2 4-2" />
              <circle cx="18" cy="22" r="1" fill="currentColor" />
              <circle cx="30" cy="22" r="1" fill="currentColor" />
            </svg>
            NIHAN
          </Link>
          <nav aria-label="Main">
            <Link href="/products">Shop</Link>
            <Link href="/fragrance">Car fragrance</Link>
            <Link href="/accessories">Accessories</Link>
            <Link href="/our-story">Our story</Link>
          </nav>
          <div className="icons">
            <ThemeToggle />
            <button type="button" aria-label="Search" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </button>
            <button type="button" aria-label="Account" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
              </svg>
            </button>
            <button type="button" aria-label="Cart" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
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
            <Link href="/accessories">Diffusers</Link>
            <Link href="/fragrance">Refills</Link>
            <Link href="/accessories">Accessories</Link>
          </div>
          <div>
            <h4>Help</h4>
            <Link href="/#faq">FAQs</Link>
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
