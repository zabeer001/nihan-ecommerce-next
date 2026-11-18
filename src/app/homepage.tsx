"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, use, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CatalogCategory, CatalogPage, HomepageContent, HomepageReviewPage } from "./catalog-api";
import { useImpactMotion } from "./impact-motion";
import { ProductCard } from "./product-card";
import { ScentGrid } from "./scent-grid";
import { categoryHref } from "./catalog-api";
import "./homepage.css";

export type HomepageCollection = CatalogCategory & {
  products: Promise<CatalogPage | null>;
};

type HomepageProps = {
  collections: Promise<HomepageCollection[] | null>;
  homepageContent: Promise<HomepageContent[]>;
  reviews: Promise<HomepageReviewPage>;
};

const highlights = ["One-touch control", "50 ml refillable", "Starlight glow", "Cash on delivery"];

const questions = [
  ["Which refills work with the diffuser?", "The diffuser takes NIHAN refills. You can browse the Oud Noir and Rajshahi Mango Leaf refills in the collection."],
  ["Will I need to reset the intensity each drive?", "The diffuser remembers your last intensity setting. You can change it whenever you like with the one-touch control."],
  ["What does the starlight glow look like?", "The diffuser gives off a soft glow designed for nighttime drives."],
  ["Where do you deliver, and how can I pay?", "NIHAN delivers across Bangladesh and offers cash on delivery."],
];

export default function Homepage({ collections, homepageContent, reviews }: HomepageProps) {
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
      <Suspense fallback={<section className="hero" />}><HeroCarousel homepageContent={homepageContent} /></Suspense>
      <CollectionSection collections={collections} homepageContent={homepageContent} />
      <Highlights />
      <Suspense><CategoryUsageGuides collections={collections} /></Suspense>
      <Suspense><CategoryContentSections collections={collections} /></Suspense>
      <Suspense><Reviews reviews={reviews} /></Suspense>
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

function HeroCarousel({ homepageContent }: Pick<HomepageProps, "homepageContent">) {
  const slides = use(homepageContent).filter(item => item.placement === "hero");
  const [index, setIndex] = useState(0);
  const progressRef = useRef<HTMLSpanElement>(null);
  const slide = slides[index % slides.length];
  const next = () => setIndex(current => (current + 1) % slides.length);

  useEffect(() => {
    if (slides.length < 2 || slide?.media_type !== "image") return;
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % slides.length), 7000);
    return () => window.clearTimeout(timer);
  }, [index, slides.length, slide?.media_type]);

  return <section className="hero" aria-label="NIHAN diffuser introduction">
    <div className="hero-media" aria-hidden="true">
      {slide?.media_type === "video" ? <HeroVideo key={slide.id} src={slide.media_url} poster={slide.poster_url} loop={slides.length === 1} onEnded={next} onProgress={progress => {
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      }} />
        : slide ? <Image src={slide.media_url} alt="" fill unoptimized priority /> : null}
    </div>
    <div className="hero-overlay"><div className="p-wrap hero-copy">
      {slide?.heading && <h1>{slide.heading}</h1>}
      {slide?.description && <p className="hero-text">{slide.description}</p>}
      {slide?.button_text && slide.button_url && <div className="hero-actions"><a className="text-link" href={slide.button_url}>{slide.button_text}</a></div>}
    </div></div>
    {slides.length > 1 && <div className="hero-carousel-controls" role="group" aria-label="Choose a hero slide">
      {slides.map((item, position) => <button key={`${index}-${item.id}`} type="button" className="hero-carousel-line"
        aria-label={`Go to slide ${position + 1}`} aria-current={position === index % slides.length ? "true" : undefined}
        onClick={() => setIndex(position)}>
        <span className="hero-carousel-track"><span
          ref={position === index % slides.length ? progressRef : undefined}
          className={`hero-carousel-fill${position === index % slides.length && item.media_type === "image" ? " hero-carousel-fill-timed" : ""}`}
        /></span>
      </button>)}
    </div>}
  </section>;
}

function HeroVideo({ src, poster, loop, onEnded, onProgress, className, label }: { src: string; poster: string | null; loop: boolean; onEnded?: () => void; onProgress?: (progress: number) => void; className?: string; label?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let visible = false;
    let pending = false;
    let disposed = false;
    // Safari needs the DOM properties set before an explicit play attempt.
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const resume = () => {
      if (disposed || pending || !visible || document.hidden || video.ended || !video.paused) return;
      pending = true;
      void video.play().catch(() => {
        // Autoplay can be denied; a later user gesture retries synchronously.
      }).finally(() => { pending = false; });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume();
    });
    observer.observe(video);
    video.addEventListener("canplay", resume);
    video.addEventListener("pause", resume);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    document.addEventListener("touchend", resume, { passive: true });
    document.addEventListener("click", resume);
    document.addEventListener("keydown", resume);

    return () => {
      disposed = true;
      observer.disconnect();
      video.removeEventListener("canplay", resume);
      video.removeEventListener("pause", resume);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("touchend", resume);
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
    };
  }, []);
  return <video className={className} aria-label={label} ref={videoRef} src={src} poster={poster ?? undefined} autoPlay muted loop={loop} playsInline preload="auto" onEnded={onEnded} onTimeUpdate={event => {
    const video = event.currentTarget;
    onProgress?.(Number.isFinite(video.duration) && video.duration > 0 ? Math.min(video.currentTime / video.duration, 1) : 0);
  }} />;
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

function CollectionSection({ collections, homepageContent }: Omit<HomepageProps, "reviews">) {
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

function CategoryCollections({ collections, homepageContent }: Omit<HomepageProps, "reviews">) {
  const rows = use(collections);
  if (!rows?.length) {
    return (
      <>
        <p className="note p-wrap" role="status">
          {rows ? "No categories are available yet." : "Categories are temporarily unavailable."}
        </p>
        <CollectionMedia homepageContent={homepageContent} />
      </>
    );
  }

  return rows.map(({ id, name, products }, index) => (
    <Fragment key={id}>
      <section className={`category-section${index > 0 && index % 4 < 2 ? " category-alt" : ""}`} aria-labelledby={`collection-${id}`}>
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
      {index === 0 && <CollectionMedia homepageContent={homepageContent} />}
    </Fragment>
  ));
}

function CollectionMedia({ homepageContent }: Pick<HomepageProps, "homepageContent">) {
  const files = use(homepageContent).filter(item => item.placement === "collection_interlude");
  return files.map(item => item.media_type === "video"
    ? <HeroVideo key={item.id} className="collection-image" src={item.media_url} poster={item.poster_url} loop label={item.alt_text || undefined} />
    : <Image key={item.id} className="collection-image" src={item.media_url} alt={item.alt_text || ""} width={2752} height={1536} sizes="100vw" unoptimized />);
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

function CategoryUsageGuides({ collections }: Pick<HomepageProps, "collections">) {
  const categories = use(collections)?.filter(category => category.usage_guide?.heading && category.usage_guide.steps?.length);
  if (!categories?.length) return null;
  return <div id="quick-start">{categories.map((category, index) => {
    const guide = category.usage_guide!;
    return <section key={category.id} aria-labelledby={`usage-guide-${category.id}`} className={`usage-guide content-band${index % 4 < 2 ? " alt" : ""}`}>
      <div className="p-wrap">
        <SectionHeading id={`usage-guide-${category.id}`} title={guide.heading!}
          action={guide.button_text && guide.button_url ? { href: guide.button_url, label: guide.button_text } : undefined} />
        <ol className="columns steps" role="list">
          {guide.steps.map((step, index) => <li key={index}><h3>{step.title}</h3><p>{step.description}</p></li>)}
        </ol>
      </div>
    </section>;
  })}</div>;
}

function CategoryContentSections({ collections }: Pick<HomepageProps, "collections">) {
  const categories = use(collections);
  const guideCount = categories?.filter(category => category.usage_guide?.heading && category.usage_guide.steps?.length).length ?? 0;
  return categories?.filter(category => category.content_cards?.length).map((category, index) => (
    <section key={category.id} aria-labelledby={`category-content-${category.id}`} className={`content-band${(guideCount + index) % 4 < 2 ? " alt" : ""}`}>
      <div className="p-wrap">
        <SectionHeading id={`category-content-${category.id}`} title={category.name}
          action={{ href: categoryHref(category.id), label: `Explore ${category.name}` }} />
        <ScentGrid cards={category.content_cards} />
      </div>
    </section>
  ));
}

function Reviews({ reviews }: Pick<HomepageProps, "reviews">) {
  const initial = use(reviews);
  const sectionRef = useRef<HTMLElement>(null);
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const [more, setMore] = useState<HomepageReviewPage>({ data: [], current_page: initial.current_page, last_page: initial.last_page });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const publishedReviews = [...new Map([...initial.data, ...more.data].map(review => [review.id, review])).values()];
  async function loadMore() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/reviews?page=${more.current_page + 1}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Could not load reviews.");
      const next: HomepageReviewPage = payload;
      setMore(current => ({ ...next, data: [...current.data, ...next.data] }));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load reviews."); }
    finally { setLoading(false); }
  }
  function seeLess() {
    setMore({ data: [], current_page: initial.current_page, last_page: initial.last_page });
    setError("");
    window.requestAnimationFrame(() => {
      loadMoreRef.current?.focus({ preventScroll: true });
      sectionRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    });
  }
  if (!publishedReviews.length) return null;
  return (
    <section ref={sectionRef} aria-labelledby="reviews-title" className="alt">
      <div className="p-wrap">
        <SectionHeading id="reviews-title" title="Said on the road" />
        <div id="homepage-reviews" className="columns reviews">
          {publishedReviews.map(review => (
            <figure key={review.id}>
              <p className="homepage-review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}<span aria-hidden="true">{"☆".repeat(5 - review.rating)}</span></p>
              <blockquote>{review.body}</blockquote>
              <figcaption>{review.author_name} · <Link href={`/products/${encodeURIComponent(review.product_slug)}#reviews`}>{review.product_name}</Link></figcaption>
            </figure>
          ))}
        </div>
        {error && <p role="alert">{error}</p>}
        {(more.current_page < more.last_page || more.data.length > 0) && <div className="reviews-actions">
          {more.current_page < more.last_page && <button ref={loadMoreRef} type="button" className="reviews-load-more" disabled={loading} aria-busy={loading} aria-controls="homepage-reviews" onClick={loadMore}>
            <span>{loading ? "Loading reviews…" : "Load more reviews"}</span>
            <svg className={loading ? "reviews-loading-icon" : undefined} viewBox="0 0 24 24" aria-hidden="true">
              {loading ? <path d="M12 3a9 9 0 1 1-9 9" /> : <path d="M12 5v14m-6-6 6 6 6-6" />}
            </svg>
          </button>}
          {more.data.length > 0 && <button type="button" className="reviews-load-more" disabled={loading} aria-controls="homepage-reviews" onClick={seeLess}>
            <span>See less</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
          </button>}
        </div>}
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
