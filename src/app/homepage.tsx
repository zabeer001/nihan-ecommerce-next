"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, use, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { CatalogCategory, CatalogPage } from "./catalog-api";
import { formatPrice } from "./money";

export type HomepageCollection = CatalogCategory & {
  products: Promise<CatalogPage | null>;
};

type HomepageProps = {
  videoId: string;
  collections: Promise<HomepageCollection[] | null>;
};

const diffuserSteps = [
  ["Choose a refill", "Start with a fragrance you’d enjoy on your everyday drive. Try Oud Noir for smoked wood and amber, or Mango Leaf for a lighter, greener scent."],
  ["Fill the reservoir", "Pour your chosen NIHAN refill into the 50 ml reservoir. You can refill the same diffuser when it runs low."],
  ["Set the intensity", "Use the one-touch control to select one of three levels. Start at the lowest level and adjust to taste. The diffuser remembers your last setting."],
];

const questions = [
  ["Which refills work with the diffuser?", "The diffuser takes NIHAN refills. You can browse the Oud Noir and Rajshahi Mango Leaf refills in the collection."],
  ["Will I need to reset the intensity each drive?", "The diffuser remembers your last intensity setting. You can change it whenever you like with the one-touch control."],
  ["What does the starlight glow look like?", "The diffuser gives off a soft glow designed for nighttime drives."],
  ["Where do you deliver, and how can I pay?", "NIHAN delivers across Bangladesh and offers cash on delivery."],
];

const reviews = [
  ["The glow looks beautiful at night, and the scent never overwhelms.", "Rafi · Dhaka"],
  ["One press and it just works. Refilling takes a few seconds.", "Tania · Chattogram"],
  ["Delivery was quick and the packaging felt like a gift.", "Sabbir · Rajshahi"],
];

// [family, name, description, tone]
const scents = [
  ["Woody", "Oud Noir", "Smoked oud, amber and a trace of leather.", "#c9915a"],
  ["Fresh", "Padma", "Water lily, cool musk and green tea.", "#8fc7b0"],
  ["Green", "Mango Leaf", "Crushed leaves and sun-warmed fruit.", "#b4c75e"],
  ["Warm", "Monsoon", "Wet earth, cardamom and soft vanilla.", "#d98f7a"],
];

export default function Homepage({ videoId, collections }: HomepageProps) {
  return (
    <HomeMotion>
      <style>{homepageStyles}</style>
      <noscript>
        <style>{noscriptStyles}</style>
      </noscript>
      <HeroVideo videoId={videoId} />
      <ProductHighlights />
      <CollectionSection collections={collections} />
      <QuickStart />
      <FragranceSection />
      <Reviews />
      <FAQ />
      <Newsletter />
    </HomeMotion>
  );
}

// Splits text into words that rise out of a mask when the heading enters view.
function Words({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(" ").map((word, i, all) => (
    <Fragment key={i}>
      <span className="w"><span style={{ "--i": start + i } as CSSProperties}>{word}</span></span>
      {i < all.length - 1 && " "}
    </Fragment>
  ));
}

function HeroVideo({ videoId }: { videoId: string }) {
  const videoParams = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    rel: "0",
    playsinline: "1",
  });

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${videoParams}`}
          title="Landing page video"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
        />
      </div>
      <div className="hero-overlay">
        <div className="wrap hero-copy">
          <h1 id="hero-title">
            <span className="visually-hidden">NIHAN AI Car Aroma Diffuser. </span>
            <span className="hero-line"><span>Every drive</span></span>
            <span className="hero-line"><span>has a scent.</span></span>
          </h1>
          <p>A refillable, one-touch diffuser with a soft starlight glow. Cash on delivery across Bangladesh.</p>
          <div className="hero-actions">
            <span className="magnet" data-magnetic><a className="btn fill" href="#shop">Shop the collection</a></span>
            <a className="link" href="#quick-start">See how it works</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductHighlights() {
  return (
    <div className="strip">
      <div className="wrap">
        <ul data-home-reveal="items" data-fx="strip">
          <li>One-touch control</li>
          <li>50 ml refillable</li>
          <li>Starlight glow</li>
          <li>Cash on delivery</li>
        </ul>
      </div>
    </div>
  );
}

function CollectionSection({ collections }: Pick<HomepageProps, "collections">) {
  return (
    <section id="shop">
      <div className="wrap">
        <div className="head">
          <div>
            <p className="eyebrow" data-home-reveal="fade">The collection</p>
            <h2 data-home-reveal="words"><Words text="Made for the" /><br /><em><Words text="cabin." start={3} /></em></h2>
          </div>
          <Link className="link" href="/products">Shop all</Link>
        </div>
        <div className="collection-rows" id="collection">
          <Suspense fallback={<p role="status">Loading categories…</p>}>
            <CategoryCollections collections={collections} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function CategoryCollections({ collections }: Pick<HomepageProps, "collections">) {
  const rows = use(collections);
  if (!rows) return <p role="status">Categories are temporarily unavailable.</p>;
  if (!rows.length) return <p>No categories are available yet.</p>;

  return rows.map(({ id, name, products }) => (
    <section key={id} aria-labelledby={`collection-${id}`}>
      <div className="collection-row-heading">
        <h3 id={`collection-${id}`}>{name}</h3>
        <Link className="link" href={`/products?category=${id}`}>View all <span className="visually-hidden">{name}</span></Link>
      </div>
      <Suspense fallback={<p role="status">Loading products…</p>}>
        <CollectionProducts products={products} />
      </Suspense>
    </section>
  ));
}

function CollectionProducts({ products }: Pick<HomepageCollection, "products">) {
  const catalog = use(products);
  if (!catalog) return <p role="status">Products are temporarily unavailable.</p>;
  if (!catalog.data.length) return <p>No products on this page.</p>;

  return (
    <div className="grid">
      {catalog.data.map(product => <ProductCard key={product.slug} product={product} />)}
    </div>
  );
}

function ProductCard({ product }: { product: CatalogPage["data"][number] }) {
  const { slug, name, image, price_cents } = product;

  return (
    <article className="card">
      <Link href={`/products/${encodeURIComponent(slug)}`}>
        <div className="product-art">
          {image && <Image src={image.url} alt="" fill unoptimized className="catalog-cover" />}
        </div>
        <h3>{name}</h3>
        <p>{formatPrice(price_cents)}</p>
      </Link>
    </article>
  );
}

function QuickStart() {
  return (
    <section id="quick-start" aria-labelledby="quick-start-title">
      <div className="wrap">
        <div className="head">
          <h2 id="quick-start-title" data-home-reveal="words"><Words text="How to use" />{" "}<em><Words text="your diffuser." start={3} /></em></h2>
          <Link className="link" href="/fragrance#refills">Browse refills</Link>
        </div>
        <ol className="grid diffuser-steps" data-home-reveal="items" data-fx="steps">
          {diffuserSteps.map(([title, description]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FragranceSection() {
  return (
    <section id="scents">
      <div className="wrap">
        <div className="head">
          <div>
            <p className="eyebrow" data-home-reveal="fade">Fragrances</p>
            <h2 data-home-reveal="words"><Words text="Four ways to" />{" "}<em><Words text="arrive." start={3} /></em></h2>
          </div>
        </div>
        <ScentGrid />
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section>
      <div className="wrap">
        <div className="head">
          <div>
            <p className="eyebrow" data-home-reveal="fade">Reviews</p>
            <h2 data-home-reveal="words"><Words text="Said on" />{" "}<em><Words text="the road." start={2} /></em></h2>
          </div>
        </div>
        <div className="rev" data-home-reveal="items" data-fx="reviews">
          {reviews.map(([quote, author]) => (
            <figure key={author}>
              <blockquote>{quote}</blockquote>
              <figcaption>{author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title">
      <div className="wrap faq">
        <h2 id="faq-title" data-home-reveal="words"><Words text="Frequently asked" />{" "}<em><Words text="questions." start={2} /></em></h2>
        <div className="faq-list" data-home-reveal="items" data-fx="faq">
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScentGrid() {
  return (
    <>
      <style>{scentStyles}</style>
      <div className="scents" data-home-reveal="items" data-fx="scents">
        {scents.map(([family, name, description, tone]) => (
          <div className="scent" key={name} style={{ "--tone": tone } as CSSProperties}>
            <small>{family}</small>
            <h3>{name}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Newsletter() {
  return (
    <section className="news">
      <div className="wrap">
        <p className="eyebrow" data-home-reveal="fade">Newsletter</p>
        <h2 data-home-reveal="words" data-fx="blur"><Words text="First to know," />{" "}<em><Words text="first to scent." start={3} /></em></h2>
        <div className="newsletter-fields" data-home-reveal="items" data-fx="news">
          <input type="email" placeholder="Your email" aria-label="Email address" disabled />
          <button className="btn fill" type="button" disabled>Subscribe</button>
        </div>
      </div>
    </section>
  );
}

const collectionTargets = ".collection-row-heading, .grid > .card";
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const noscriptStyles = `
.home-page [data-home-reveal], .home-page [data-home-reveal] > *, .home-page .w > span,
.home-page .card :is(h3, p), .home-page .collection-row-heading {
  opacity: 1 !important;
  translate: none !important;
  scale: none !important;
  rotate: none !important;
  filter: none !important;
  clip-path: none !important;
}
.home-page .diffuser-steps > li::before { transform: none !important; opacity: 1 !important; }
.home-page .strip li::before { scale: 1 !important; }
.home-page .card .product-art { clip-path: none !important; }
.home-page .card .catalog-cover { scale: 1.14 !important; }
`;

function setMotionProperty(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
}

function HomeMotion({ children }: { children: ReactNode }) {
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = main.current;
    if (!page) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const hero = page.querySelector<HTMLElement>(".hero");
    const collection = page.querySelector("#collection");
    let parallax: HTMLElement[] = [];
    let frame = 0;

    function update() {
      frame = 0;
      if (!motion.matches || !page || !hero) return;

      setMotionProperty(hero, "--hero-progress", clamp(window.scrollY / Math.max(1, hero.offsetHeight)).toFixed(4));
      if (!page.hasAttribute("data-home-motion")) page.setAttribute("data-home-motion", "");

      // product images drift slightly inside their frames while scrolling
      const viewport = window.innerHeight;
      for (const element of parallax) {
        const { top, height } = element.getBoundingClientRect();
        if (top > viewport || top + height < 0) continue;
        const offset = clamp((top + height / 2 - viewport / 2) / viewport, -1, 1);
        setMotionProperty(element, "--parallax", (offset * -7).toFixed(3) + "%");
      }
    }

    function scheduleUpdate() {
      if (motion.matches && !frame) frame = window.requestAnimationFrame(update);
    }

    const observed = new WeakSet<Element>();
    const reveals = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
      for (const { isIntersecting, target } of entries) {
        if (isIntersecting) {
          target.setAttribute("data-home-entered", "");
          reveals?.unobserve(target);
        }
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }) : undefined;

    function observeReveal(target: Element) {
      if (observed.has(target)) return;
      observed.add(target);
      if (reveals) reveals.observe(target);
      else target.setAttribute("data-home-entered", "");
    }

    function observeCollection() {
      collection?.querySelectorAll(collectionTargets).forEach(observeReveal);
      parallax = Array.from(collection?.querySelectorAll<HTMLElement>(".product-art") ?? []);
      scheduleUpdate();
    }

    function updatePreference() {
      if (motion.matches) {
        scheduleUpdate();
        return;
      }
      page?.removeAttribute("data-home-motion");
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    // children of a stagger group get an index used for their delay
    page.querySelectorAll<HTMLElement>('[data-home-reveal="items"]').forEach(group => {
      Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
    });
    page.querySelectorAll("[data-home-reveal]").forEach(observeReveal);
    observeCollection();

    const catalogChanges = collection && "MutationObserver" in window
      ? new MutationObserver(observeCollection)
      : undefined;
    if (collection) catalogChanges?.observe(collection, { childList: true, subtree: true });

    const layout = "ResizeObserver" in window ? new ResizeObserver(scheduleUpdate) : undefined;
    layout?.observe(page);

    // magnetic buttons: they lean toward the pointer (mouse and trackpad only)
    const disposers: Array<() => void> = [];
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      page.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(element => {
        const move = (event: PointerEvent) => {
          if (!motion.matches) return;
          const box = element.getBoundingClientRect();
          const x = parseFloat(element.style.getPropertyValue("--mx")) || 0;
          const y = parseFloat(element.style.getPropertyValue("--my")) || 0;
          const dx = event.clientX - (box.left + box.width / 2 - x);
          const dy = event.clientY - (box.top + box.height / 2 - y);
          element.style.setProperty("--mx", clamp(dx * 0.28, -14, 14).toFixed(2) + "px");
          element.style.setProperty("--my", clamp(dy * 0.28, -9, 9).toFixed(2) + "px");
        };
        const reset = () => {
          element.style.removeProperty("--mx");
          element.style.removeProperty("--my");
        };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", reset);
        disposers.push(() => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", reset);
        });
      });
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("pageshow", scheduleUpdate);
    motion.addEventListener("change", updatePreference);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("pageshow", scheduleUpdate);
      motion.removeEventListener("change", updatePreference);
      disposers.forEach(dispose => dispose());
      window.cancelAnimationFrame(frame);
      reveals?.disconnect();
      catalogChanges?.disconnect();
      layout?.disconnect();
      page.removeAttribute("data-home-motion");
    };
  }, []);

  return <main className="home-page" ref={main}>{children}</main>;
}

const scentStyles = `
/* scents */
.scents {
  display: grid;
  gap: 0;
  border: 1px solid var(--line);
}

.scent {
  position: relative;
  overflow: hidden;
  padding: 44px 32px;
  border-bottom: 1px solid var(--line);
}

.scent > * {
  position: relative;
}

.scent::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(90% 75% at 50% 115%, color-mix(in oklab, var(--tone, var(--gold)) 30%, transparent), transparent);
  opacity: 0;
  transition: opacity .5s;
  pointer-events: none;
}

.scent:last-child {
  border: 0;
}

.scent:hover::after {
  opacity: 1;
}

.scent h3 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.scent small {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: .85rem;
  letter-spacing: .04em;
  color: var(--tone, var(--gold));
  margin-bottom: 18px;
}

.scent small::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.scent p {
  margin: 0;
  color: var(--mute);
  font-size: .88rem;
  max-width: 28ch;
}

@media (min-width: 900px) {
  .scents {
    grid-template-columns: repeat(4, 1fr);
  }
  .scent {
    border-bottom: 0;
    border-right: 1px solid var(--line);
  }
  .scent:last-child {
    border-right: 0;
  }
}
`;

const homepageStyles = `
.home-page {
  interpolate-size: allow-keywords;
}

.home-page :is(a, button, summary):focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 4px;
}

/* hero */
.home-page .hero {
  position: relative;
  height: max(520px, calc(100svh - 120px));
  container-type: size;
  overflow: hidden;
  background: #0a110e;
}

.home-page .hero-video {
  position: absolute;
  inset: 0;
}

.home-page .hero-video > iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 177.778cqh);
  height: max(100%, 56.25cqw);
  transform: translate(-50%, -50%);
  border: 0;
  pointer-events: none;
}

.home-page .hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
}

.home-page .hero-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 17, 14, .92), rgba(10, 17, 14, .45) 45%, rgba(10, 17, 14, .1) 75%);
  pointer-events: none;
}

.home-page .hero-copy {
  position: relative;
  display: grid;
  justify-items: start;
  gap: 20px;
  width: 100%;
  padding-block: clamp(32px, 6vw, 72px);
}

.home-page .hero-copy h1 {
  margin: 0;
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(2.9rem, 8.5vw, 6.75rem);
  line-height: .98;
  letter-spacing: -.02em;
  color: var(--ivory);
}

.home-page .hero-line {
  display: block;
  overflow: hidden;
  padding-bottom: .12em;
  margin-bottom: -.12em;
}

.home-page .hero-line > span {
  display: block;
}

.home-page .hero-copy p {
  margin: 0;
  max-width: 46ch;
  font-size: 1.05rem;
  color: color-mix(in srgb, var(--ivory) 82%, transparent);
}

.home-page .hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 28px;
}

/* highlights */
.home-page .strip {
  border-block: 1px solid var(--line);
  background: var(--bg2);
}

.home-page .strip ul {
  list-style: none;
  margin: 0;
  padding: 30px 0;
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr 1fr;
  font-size: .92rem;
  letter-spacing: .03em;
  color: var(--mute);
}

.home-page .strip li {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.home-page .strip li::before {
  content: "";
  flex: none;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold);
}

@media (min-width: 900px) {
  .home-page .strip ul {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* collection */
.home-page .collection-rows {
  display: grid;
  gap: clamp(40px, 6vw, 80px);
}

.home-page .collection-row-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px 24px;
  margin-bottom: 24px;
}

.home-page .collection-row-heading h3 {
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
}

.home-page .card .product-art {
  overflow: hidden;
}

.home-page .card a:is(:hover, :focus-visible) h3 {
  color: var(--gold);
}

/* steps (a real sequence, so numbered) */
.home-page .diffuser-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

.home-page .diffuser-steps > li {
  position: relative;
  counter-increment: step;
  padding: 32px 28px 28px 0;
  border-top: 1px solid var(--line);
}

.home-page .diffuser-steps > li::before {
  content: counter(step);
  display: block;
  margin-bottom: 20px;
  font-family: var(--serif);
  font-size: 3.4rem;
  line-height: 1;
  color: var(--gold);
}

.home-page .diffuser-steps > li::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
}

.home-page .diffuser-steps > li:nth-child(2) { --step-index: 1; }
.home-page .diffuser-steps > li:nth-child(3) { --step-index: 2; }

.home-page .diffuser-steps h3 {
  margin-top: 0;
  font-size: 1.7rem;
}

.home-page .diffuser-steps p,
.home-page .faq-list p {
  margin: 12px 0 0;
  color: var(--mute);
  font-size: .9rem;
  max-width: 52ch;
}

@media (max-width: 899px) {
  .home-page .diffuser-steps > li {
    padding-right: 0;
  }
}

/* reviews */
.home-page .rev {
  display: grid;
  gap: 28px;
}

.home-page .rev figure {
  margin: 0;
  padding: 36px;
  border: 1px solid var(--line);
  transition: border-color .4s;
}

.home-page .rev figure:hover {
  border-color: var(--gold);
}

.home-page .rev blockquote {
  margin: 0 0 22px;
  font-family: var(--serif);
  font-size: 1.45rem;
  line-height: 1.35;
  text-wrap: pretty;
}

.home-page .rev figcaption {
  font-size: .85rem;
  letter-spacing: .04em;
  color: var(--mute);
}

@media (min-width: 900px) {
  .home-page .rev {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* faq */
.home-page .faq {
  display: grid;
  gap: 32px;
}

.home-page .faq-list {
  border-top: 1px solid var(--line);
}

.home-page .faq-list details {
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.home-page .faq-list summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  list-style: none;
  cursor: pointer;
  font-weight: 500;
}

.home-page .faq-list summary::-webkit-details-marker {
  display: none;
}

.home-page .faq-list summary::after {
  content: "+";
  flex: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--gold);
}

.home-page .faq-list details[open] summary::after {
  transform: rotate(45deg);
}

@media (min-width: 960px) {
  .home-page .faq {
    grid-template-columns: 1fr 1.25fr;
    gap: 72px;
  }
}

/* newsletter */
.home-page .news {
  text-align: center;
  background: var(--bg2);
  border-top: 1px solid var(--line);
}

.home-page .newsletter-fields {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}

.home-page .news input {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--gold);
  color: var(--ivory);
  padding: 14px 4px;
  min-width: min(340px, 100%);
  font: inherit;
  font-size: .9rem;
}

.home-page .news input::placeholder {
  color: var(--mute);
}

/* motion */
.home-page {
  --ease: cubic-bezier(.16, 1, .3, 1);
}

.home-page .w {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding: 0 .08em .14em 0;
  margin: 0 -.08em -.14em 0;
}

.home-page .w > span {
  display: inline-block;
}

.home-page .magnet {
  display: inline-block;
}

@media (prefers-reduced-motion: no-preference) {
  /* hero: the one orchestrated moment. The film settles, the headline rises out of a mask. */
  .home-page .hero {
    --hero-travel: 2.6cqh;
    --hero-scale: 1.07;
  }

  .home-page .hero-video {
    transform: translateY(calc(var(--hero-progress, 0) * var(--hero-travel))) scale(var(--hero-scale));
    animation: home-settle 2.8s var(--ease) backwards;
  }

  .home-page .hero-overlay::before {
    animation: home-fade 1.8s ease-out backwards;
  }

  .home-page .hero-line > span {
    transform-origin: 0 100%;
    animation: home-line-rise 1.5s var(--ease) .3s backwards;
  }

  .home-page .hero-line + .hero-line > span { animation-delay: .44s; }

  .home-page .hero-copy p {
    animation: home-blur-in 1.4s var(--ease) .95s backwards;
  }

  .home-page .hero-actions {
    animation: home-blur-in 1.4s var(--ease) 1.1s backwards;
  }

  .home-page .hero-copy {
    opacity: calc(1 - var(--hero-progress, 0) * 1.6);
    transform: translateY(calc(var(--hero-progress, 0) * -28px));
  }

  .home-page .hero::after {
    content: "";
    position: absolute;
    inset: 0;
    background: #0a110e;
    opacity: calc(var(--hero-progress, 0) * .67);
    pointer-events: none;
  }

  @media (min-width: 960px) {
    .home-page .hero {
      --hero-travel: 5cqh;
      --hero-scale: 1.12;
    }
  }

  /* headings: words rise out of a mask */
  .home-page [data-home-reveal="words"] .w > span {
    translate: 0 118%;
    transition: translate 1.3s var(--ease) calc(var(--i, 0) * .07s);
  }

  .home-page [data-home-reveal="words"][data-home-entered] .w > span {
    translate: 0 0;
  }

  .home-page [data-home-reveal="fade"] {
    opacity: 0;
    transition: opacity 1.2s ease .1s;
  }

  .home-page [data-home-reveal="fade"][data-home-entered] {
    opacity: 1;
  }

  /* groups: items settle one after another (doubled attribute outranks per-item hover rules) */
  .home-page [data-home-reveal][data-home-reveal="items"] > * {
    --d: calc(var(--i, 0) * .11s);
    opacity: 0;
    translate: 0 36px;
    transition: opacity .9s ease-out var(--d), translate 1.3s var(--ease) var(--d), border-color .4s;
  }

  .home-page [data-home-reveal][data-home-reveal="items"][data-home-entered] > * {
    opacity: 1;
    translate: 0 0;
  }

  /* highlights: slide in from the left and pop the dots */
  .home-page [data-fx="strip"][data-home-reveal="items"] > * {
    opacity: 0;
    translate: -28px 0;
    scale: 1;
    transition: opacity .8s ease-out var(--d), translate 1.1s var(--ease) var(--d);
  }

  .home-page [data-fx="strip"][data-home-reveal][data-home-entered] > * {
    opacity: 1;
    translate: 0 0;
  }

  .home-page .strip li::before {
    scale: 0;
    transition: scale .6s var(--ease) .5s;
  }

  .home-page .strip ul[data-home-entered] li::before { scale: 1; }

  /* steps: slide in from the right and scale up the numbers */
  .home-page [data-fx="steps"][data-home-reveal="items"] > * {
    opacity: 0;
    translate: 48px 0;
    transition: opacity .9s ease-out calc(var(--i, 0) * .28s), translate 1.3s var(--ease) calc(var(--i, 0) * .28s);
  }

  .home-page [data-fx="steps"][data-home-reveal][data-home-entered] > * {
    opacity: 1;
    translate: 0 0;
  }

  .home-page .diffuser-steps > li::before {
    transform: scale(.5);
    transform-origin: left bottom;
    opacity: 0;
  }

  .home-page .diffuser-steps[data-home-entered] > li::before {
    transform: scale(1);
    opacity: 1;
    transition: transform 1s var(--ease) calc(var(--i, 0) * .28s + .3s), opacity .8s ease calc(var(--i, 0) * .28s + .3s);
  }

  /* scents: open from the center while coming into focus */
  .home-page [data-fx="scents"][data-home-reveal="items"] > * {
    opacity: 0;
    translate: 0 0;
    filter: blur(12px);
    clip-path: inset(0 50% 0 50%);
    transition: opacity .9s ease var(--d), filter 1.1s ease var(--d), clip-path 1.3s var(--ease) var(--d);
  }

  .home-page [data-fx="scents"][data-home-reveal][data-home-entered] > * {
    opacity: 1;
    filter: blur(0);
    clip-path: inset(0);
  }

  /* reviews: settle with alternating tilts */
  .home-page [data-fx="reviews"][data-home-reveal="items"] > * {
    opacity: 0;
    translate: 0 60px;
    rotate: -4deg;
    transform-origin: 50% 100%;
    transition: opacity .9s ease var(--d), translate 1.4s var(--ease) var(--d), rotate 1.4s var(--ease) var(--d), border-color .4s;
  }

  .home-page [data-fx="reviews"][data-home-reveal="items"] > :where(:nth-child(even)) { rotate: 4deg; }

  .home-page [data-fx="reviews"][data-home-reveal][data-home-entered] > * {
    opacity: 1;
    translate: 0 0;
    rotate: 0deg;
  }

  /* FAQ: wipe rows in from the left */
  .home-page [data-fx="faq"][data-home-reveal="items"] > * {
    opacity: 1;
    translate: 0 0;
    clip-path: inset(0 100% 0 0);
    transition: clip-path 1.2s var(--ease) var(--d);
  }

  .home-page [data-fx="faq"][data-home-reveal][data-home-entered] > * { clip-path: inset(0); }

  /* newsletter: bring the heading into focus and scale up the fields */
  .home-page [data-fx="blur"][data-home-reveal="words"] .w { overflow: visible; }

  .home-page [data-fx="blur"][data-home-reveal="words"] .w > span {
    translate: 0 0;
    opacity: 0;
    filter: blur(14px);
    scale: .92;
    transition: opacity 1.2s ease calc(var(--i, 0) * .09s), filter 1.4s ease calc(var(--i, 0) * .09s), scale 1.4s var(--ease) calc(var(--i, 0) * .09s);
  }

  .home-page [data-fx="blur"][data-home-reveal="words"][data-home-entered] .w > span {
    opacity: 1;
    filter: blur(0);
    scale: 1;
  }

  .home-page [data-fx="news"][data-home-reveal="items"] > * {
    opacity: 0;
    translate: 0 0;
    scale: .7;
    transition: opacity .8s ease var(--d), scale 1.2s var(--ease) var(--d);
  }

  .home-page [data-fx="news"][data-home-reveal][data-home-entered] > * {
    opacity: 1;
    scale: 1;
  }

  /* steps: a gold rule draws across each step */
  .home-page .diffuser-steps[data-home-entered] > li::after {
    transform: scaleX(1);
    transition: transform 1.6s var(--ease) calc(var(--i, 0) * .28s + .2s);
  }

  /* collection: image rises behind a curtain, then the text follows */
  .home-page .collection-row-heading {
    opacity: 0;
    translate: 0 16px;
    transition: opacity .9s ease-out, translate 1.2s var(--ease);
  }

  .home-page .collection-row-heading[data-home-entered] {
    opacity: 1;
    translate: 0 0;
  }

  .home-page .card {
    --d: calc(var(--reveal-index, 0) * .12s);
  }

  .home-page .card .product-art {
    clip-path: inset(100% 0 0 0);
    transition: clip-path 1.4s var(--ease) var(--d);
  }

  .home-page .card .catalog-cover {
    scale: 1.3;
    translate: 0 var(--parallax, 0%);
    transition: scale 1.8s var(--ease) var(--d), transform 1s var(--ease);
  }

  .home-page .card :is(h3, p) {
    opacity: 0;
    translate: 0 14px;
    transition: opacity .9s ease-out calc(var(--d) + .45s), translate 1.1s var(--ease) calc(var(--d) + .45s), color .3s;
  }

  .home-page .card[data-home-entered] .product-art { clip-path: inset(0); }
  .home-page .card[data-home-entered] .catalog-cover { scale: 1.14; }
  .home-page .card[data-home-entered] :is(h3, p) { opacity: 1; translate: 0 0; }

  @media (min-width: 640px) and (max-width: 999px) {
    .home-page #collection .card:nth-child(2n) { --reveal-index: 1; }
  }

  @media (min-width: 1000px) {
    .home-page #collection .card:nth-child(3n + 2) { --reveal-index: 1; }
    .home-page #collection .card:nth-child(3n) { --reveal-index: 2; }
  }

  /* responses to the visitor's own actions */
  @media (hover: hover) {
    .home-page .card a:hover .catalog-cover {
      transform: scale(1.05);
    }
  }

  .home-page .magnet {
    translate: var(--mx, 0px) var(--my, 0px);
    transition: translate .7s var(--ease);
  }

  .home-page .faq-list summary::after {
    transition: transform .5s var(--ease);
  }

  .home-page .faq-list details::details-content {
    block-size: 0;
    overflow: hidden;
    transition: block-size .5s var(--ease), content-visibility .5s allow-discrete;
  }

  .home-page .faq-list details[open]::details-content {
    block-size: auto;
  }
}

@keyframes home-settle {
  from { scale: 1.18; }
}

@keyframes home-fade {
  from { opacity: 0; }
}

@keyframes home-line-rise {
  from { translate: 0 112%; rotate: 5deg; }
}

@keyframes home-blur-in {
  from { opacity: 0; translate: 0 22px; filter: blur(10px); }
}
`;
