"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, use, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CatalogCategory, CatalogPage, HomepageContent } from "./catalog-api";
import { useImpactMotion } from "./impact-motion";
import { ProductCard } from "./product-card";
import { ScentGrid } from "./scent-grid";
import "./homepage.css";

export type HomepageCollection = CatalogCategory & {
  products: Promise<CatalogPage | null>;
};

type HomepageProps = {
  collections: Promise<HomepageCollection[] | null>;
  homepageContent: Promise<HomepageContent[] | null>;
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

export default function Homepage({ collections, homepageContent }: HomepageProps) {
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
      <Suspense fallback={<section className="hero" aria-label="NIHAN diffuser introduction" />}>
        <HeroVideo homepageContent={homepageContent} />
      </Suspense>
      <CollectionSection collections={collections} homepageContent={homepageContent} />
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

function HeroVideo({ homepageContent }: Pick<HomepageProps, "homepageContent">) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(reduceMotion).matches,
    () => true,
  );
  const [playVideo, setPlayVideo] = useState<boolean>();
  const [activeSlide, setActiveSlide] = useState(0);
  const content = use(homepageContent);
  const slides = content?.filter(item => item.placement === "hero") ?? [];
  const slide = slides.length ? slides[activeSlide % slides.length] : null;
  const playing = playVideo ?? !prefersReducedMotion;
  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion) return;
    const timer = window.setInterval(() => setActiveSlide(index => (index + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length, prefersReducedMotion]);
  return (
    <section className="hero" aria-label="NIHAN diffuser introduction">
      <div className="hero-media" aria-hidden="true">
        {slide?.media_type === "image" ? (
          <Image src={slide.media_url} alt="" width={1920} height={1080} unoptimized priority />
        ) : playing ? (
          <video
            key={slide?.id ?? "fallback"}
            src={slide?.media_url ?? "/glifnode_nihan_hero.mp4"}
            poster={slide?.poster_url ?? undefined}
            autoPlay={playing}
            muted
            loop
            playsInline
          />
        ) : (slide?.poster_url ? <Image className="hero-poster" src={slide.poster_url} alt="" width={1920} height={1080} unoptimized /> : null)}
      </div>
      <div className="hero-overlay">
        <div className="p-wrap hero-copy">
          {slide?.heading && <h1>{slide.heading}</h1>}
          {slide?.description && <p className="hero-text">{slide.description}</p>}
          <div className="hero-actions">{slide?.button_text && slide.button_url
            ? <a className="text-link" href={slide.button_url}>{slide.button_text}</a>
            : <><a className="text-link" href="#shop">Shop the collection</a><a className="text-link" href="#quick-start">See how it works</a></>}
          </div>
          {slide?.media_type !== "image" && <button type="button" className="video-toggle" onClick={() => setPlayVideo(!playing)}>{playing ? "Pause video" : "Play video"}</button>}
          {slides.length > 1 && <div className="hero-carousel-controls" aria-label="Hero carousel controls">
            <button type="button" aria-label="Previous slide" onClick={() => setActiveSlide(index => (index + slides.length - 1) % slides.length)}>‹</button>
            <span aria-live="polite">{activeSlide + 1} / {slides.length}</span>
            <button type="button" aria-label="Next slide" onClick={() => setActiveSlide(index => (index + 1) % slides.length)}>›</button>
          </div>}
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

function CollectionSection({ collections, homepageContent }: HomepageProps) {
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
          <CategoryCollections collections={collections} homepageContent={homepageContent} />
        </Suspense>
      </div>
      <p className="center">
        <Link className="text-link" href="/products">Shop all</Link>
      </p>
    </section>
  );
}

function CategoryCollections({ collections, homepageContent }: HomepageProps) {
  const rows = use(collections);
  const contents = use(homepageContent);
  const imageBlocks = contents?.filter(item => item.placement === "collection_interlude") ?? [];
  if (!rows?.length) {
    return (
      <>
        <p className="note p-wrap" role="status">
          {rows ? "No categories are available yet." : "Categories are temporarily unavailable."}
        </p>
        <CollectionImages items={imageBlocks} />
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
      {index === 0 && <CollectionImages items={imageBlocks} />}
    </Fragment>
  ));
}

function CollectionImages({ items }: { items: HomepageContent[] }) {
  if (!items.length) return <CollectionImage />;
  return <>{items.map(content => <CollectionImage key={content.id} content={content} />)}</>;
}

function CollectionImage({ content }: { content?: HomepageContent }) {
  return (
    <Image
      className="collection-image"
      src={content?.media_url ?? "/Gemini_Generated_Image_s0hpixs0hpixs0hp.jpeg"}
      alt={content?.alt_text ?? "Illustration of a sleeping orange cat beside four colorful fragrance bottles"}
      width={2752}
      height={1536}
      sizes="100vw"
      unoptimized={Boolean(content)}
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
