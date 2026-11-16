"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, use, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import type { CatalogCategory, CatalogPage } from "./catalog-api";
import { formatPrice } from "./money";
import "./homepage.css";

export type HomepageCollection = CatalogCategory & {
  products: Promise<CatalogPage | null>;
};

type HomepageProps = {
  collections: Promise<HomepageCollection[] | null>;
};

const impactGroups = [
  [".section-heading, .row-heading", "pair"],
  [".strip ul, .steps, .reviews, .scents", "converge"],
  [".tiles, .faq-list", "alternate"],
] as const;

function impactDirection(mode: (typeof impactGroups)[number][1], index: number, middle: number) {
  if (mode === "pair") return index === 0 ? "left" : "right";
  if (mode === "alternate") return index % 2 === 0 ? "left" : "right";
  if (index === middle) return "up";
  return index < middle ? "left" : "right";
}

function useImpactMotion(pageRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return;

    const reveal = (element: Element) => element.setAttribute("data-impact-in", "");
    const observer = new IntersectionObserver(entries => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;

        if (target.hasAttribute("data-impact-from")) reveal(target);
        else target.querySelectorAll(":scope > [data-impact-from]").forEach(reveal);

        observer.unobserve(target);
      }
    }, { rootMargin: "0px 0px -6% 0px" });

    const scan = () => {
      for (const [selector, mode] of impactGroups) {
        for (const group of page.querySelectorAll(selector)) {
          const children = group.querySelectorAll<HTMLElement>(":scope > *");
          const middle = (children.length - 1) / 2;

          children.forEach((child, index) => {
            if (child.hasAttribute("data-impact-from")) return;

            const direction = impactDirection(mode, index, middle);
            const delay = direction === "up" ? 100 : mode === "alternate" ? Math.min(index, 5) * 50 : 0;

            child.setAttribute("data-impact-from", direction);
            if (delay) child.style.setProperty("--impact-delay", `${delay}ms`);
            observer.observe(mode === "alternate" ? child : group);
          });
        }
      }
    };

    scan();

    // The category headings and product grids can arrive through Suspense.
    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mutations.observe(page, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.cancelAnimationFrame(frame);
      page.querySelectorAll<HTMLElement>("[data-impact-from]").forEach(child => {
        child.removeAttribute("data-impact-from");
        child.removeAttribute("data-impact-in");
        child.style.removeProperty("--impact-delay");
      });
    };
  }, [pageRef]);
}

const highlights = ["One-touch control", "50 ml refillable", "Starlight glow", "Cash on delivery"];

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

export default function Homepage({ collections }: HomepageProps) {
  const pageRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const hero = page?.querySelector(".hero");
    const header = page?.parentElement?.querySelector(":scope > header");
    if (!page || !hero || !header) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      page.toggleAttribute("data-past-hero", hero.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(header);
    observer.observe(hero);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useImpactMotion(pageRef);

  return (
    <main className="home-page" ref={pageRef}>
      <HeroVideo />
      <CollectionSection collections={collections} />
      <Highlights />
      <QuickStart />
      <FragranceSection />
      <Reviews />
      <FAQ />
    </main>
  );
}

function SectionHeading({ id, title, text, action }: { id?: string; title: string; text?: string; action?: { href: string; label: string } }) {
  return (
    <div className="section-heading">
      <h2 id={id}>{title}</h2>
      {text && <p>{text}</p>}
      {action && <Link className="text-link" href={action.href}>{action.label}</Link>}
    </div>
  );
}

const reduceMotion = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia(reduceMotion);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function HeroVideo() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(reduceMotion).matches,
    () => true,
  );
  const [playVideo, setPlayVideo] = useState<boolean>();
  const playing = playVideo ?? !prefersReducedMotion;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        {playing && (
          <video
            src="/glifnode_nihan_hero.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>
      <div className="hero-overlay">
        <div className="p-wrap hero-copy">
          <p className="hero-label">NIHAN AI Car Aroma Diffuser</p>
          <h1 id="hero-title">Every drive has a scent</h1>
          <p className="hero-text">A refillable car diffuser with one-touch control and a soft starlight glow.</p>
          <div className="hero-actions">
            <a className="text-link" href="#shop">Shop the collection</a>
            <a className="text-link" href="#quick-start">See how it works</a>
          </div>
          <button type="button" className="video-toggle" onClick={() => setPlayVideo(!playing)}>
            {playing ? "Stop video" : "Play video"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <div className="strip">
      <div className="p-wrap">
        <ul>
          {highlights.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

function CollectionSection({ collections }: Pick<HomepageProps, "collections">) {
  return (
    <section id="shop" aria-labelledby="shop-title">
      <div className="p-wrap">
        <SectionHeading
          id="shop-title"
          title="The Collection"
          text="Refillable car diffusers and fragrances made for the cabin."
        />
      </div>
      <div className="collection-rows" id="collection">
        <Suspense fallback={<p className="note p-wrap" role="status">Loading categories…</p>}>
          <CategoryCollections collections={collections} />
        </Suspense>
      </div>
      <p className="center">
        <Link className="text-link" href="/products">Shop all</Link>
      </p>
    </section>
  );
}

function CategoryCollections({ collections }: Pick<HomepageProps, "collections">) {
  const rows = use(collections);
  if (!rows?.length) {
    return (
      <>
        <p className="note p-wrap" role="status">
          {rows ? "No categories are available yet." : "Categories are temporarily unavailable."}
        </p>
        <CollectionImage />
      </>
    );
  }

  return rows.map(({ id, name, products }, index) => (
    <Fragment key={id}>
      <section className="p-wrap" aria-labelledby={`collection-${id}`}>
        <div className="row-heading">
          <h3 id={`collection-${id}`}>{name}</h3>
          <Link className="text-link" href={`/products?category=${id}`}>View all <span className="visually-hidden">{name}</span></Link>
        </div>
        <Suspense fallback={<p className="note" role="status">Loading products…</p>}>
          <CollectionProducts products={products} />
        </Suspense>
      </section>
      {index === 0 && <CollectionImage />}
    </Fragment>
  ));
}

function CollectionImage() {
  return (
    <Image
      className="collection-image"
      src="/Gemini_Generated_Image_s0hpixs0hpixs0hp.jpeg"
      alt="Illustration of a sleeping orange cat beside four colorful fragrance bottles"
      width={2752}
      height={1536}
      sizes="100vw"
    />
  );
}

function CollectionProducts({ products }: Pick<HomepageCollection, "products">) {
  const catalog = use(products);
  if (!catalog) return <p className="note" role="status">Products are temporarily unavailable.</p>;
  if (!catalog.data.length) return <p className="note">No products on this page.</p>;

  return (
    <div className="tiles">
      {catalog.data.map(product => <ProductCard key={product.slug} product={product} />)}
    </div>
  );
}

function ProductCard({ product }: { product: CatalogPage["data"][number] }) {
  const { slug, name, image, price_cents } = product;

  return (
    <article className="tile">
      <Link href={`/products/${encodeURIComponent(slug)}`}>
        <div className="tile-art">
          {image && <Image src={image.url} alt="" fill unoptimized className="cover" />}
        </div>
        <h4>{name}</h4>
        <p>{formatPrice(price_cents)}</p>
      </Link>
    </article>
  );
}

function QuickStart() {
  return (
    <section id="quick-start" aria-labelledby="quick-start-title" className="alt">
      <div className="p-wrap">
        <SectionHeading
          id="quick-start-title"
          title="How to use your diffuser"
          action={{ href: "/fragrance#refills", label: "Browse refills" }}
        />
        <ol className="columns steps" role="list">
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
    <section id="scents" aria-labelledby="scents-title">
      <div className="p-wrap">
        <SectionHeading
          id="scents-title"
          title="Fragrances"
          action={{ href: "/fragrance", label: "Explore fragrances" }}
        />
        <ScentGrid />
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="alt">
      <div className="p-wrap">
        <SectionHeading id="reviews-title" title="Said on the road" />
        <div className="columns reviews">
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
      <div className="p-wrap narrow">
        <SectionHeading id="faq-title" title="Frequently asked questions" />
        <div className="faq-list">
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
      <div className="scents">
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
