"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, use, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CatalogCategory, CatalogPage } from "./catalog-api";
import { useImpactMotion } from "./impact-motion";
import { ProductCard } from "./product-card";
import { ScentGrid } from "./scent-grid";
import "./homepage.css";

export type HomepageCollection = CatalogCategory & {
  products: Promise<CatalogPage | null>;
};

type HomepageProps = {
  collections: Promise<HomepageCollection[] | null>;
};

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
    <section className="hero" aria-label="NIHAN diffuser introduction">
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
      <section className={`category-section${index % 2 === 1 ? " category-alt" : ""}`} aria-labelledby={`collection-${id}`}>
        <div className="p-wrap">
          <div className="row-heading">
            <h3 id={`collection-${id}`}>{name}</h3>
            <Link className="text-link" href={`/products?category=${id}`}>View all <span className="visually-hidden">{name}</span></Link>
          </div>
          <Suspense fallback={<p className="note" role="status">Loading products…</p>}>
            <CollectionProducts products={products} />
          </Suspense>
        </div>
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
      {catalog.data.map(product => <ProductCard key={product.slug} product={product} heading="h4" />)}
    </div>
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
