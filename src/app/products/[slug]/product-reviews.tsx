"use client";

import { useEffect, useState, type FormEvent } from "react";
import "./product-reviews.css";

type Review = { id: number; author_name: string; rating: number; title: string | null; body: string; created_at: string };
type Reviews = { data: Review[]; current_page: number; last_page: number; summary: { count: number; average: number | null } };

function Stars({ rating }: { rating: number }) {
  return <span className="review-stars" aria-label={`${rating} out of 5 stars`}>{"★".repeat(rating)}<span aria-hidden="true">{"☆".repeat(5 - rating)}</span></span>;
}

export function ProductReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Reviews | null>(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const endpoint = `/api/reviews/${encodeURIComponent(slug)}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${endpoint}?page=${page}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Could not load reviews.");
      if (!controller.signal.aborted) setReviews(payload);
    }).catch(e => { if (!controller.signal.aborted) setLoadError(e.message); });
    return () => controller.abort();
  }, [endpoint, page, retry]);

  function changePage(next: number) { setReviews(null); setLoadError(""); setPage(next); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: data.get("author_name"), rating: Number(data.get("rating")), title: data.get("title"), body: data.get("body") }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.errors ? Object.values(payload.errors).flat().join(" ") : payload.message || "Could not submit your review.");
      setNotice(payload.message); form.reset();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit your review."); }
    finally { setBusy(false); }
  }

  return <section className="product-reviews" id="reviews" aria-labelledby="product-reviews-heading">
    <div className="review-heading"><div><p className="review-eyebrow">Your experience</p><h2 id="product-reviews-heading">Product reviews</h2></div>
      {reviews && <p className="review-summary">{reviews.summary.average !== null ? <><strong>{reviews.summary.average.toFixed(1)}</strong> / 5 · </> : null}{reviews.summary.count} {reviews.summary.count === 1 ? "review" : "reviews"}</p>}
    </div>
    <div className="reviews-layout"><div className="review-list">
      {loadError && <div role="alert"><p>{loadError}</p><button className="link" onClick={() => { setLoadError(""); setRetry(value => value + 1); }}>Try again</button></div>}
      {!reviews && !loadError && <p role="status">Loading reviews…</p>}
      {reviews && !reviews.data.length && <p>No reviews yet. Share your experience with this product.</p>}
      {reviews?.data.map(review => <article className="review-card" key={review.id}>
        <Stars rating={review.rating} />
        {review.title && <h3>{review.title}</h3>}
        <p className="review-body">{review.body}</p>
        <p className="review-author">{review.author_name} <span>· <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })}</time></span></p>
      </article>)}
      {reviews && reviews.last_page > 1 && <div className="review-pagination"><button className="link" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button><span>{page} / {reviews.last_page}</span><button className="link" disabled={page >= reviews.last_page} onClick={() => changePage(page + 1)}>Next</button></div>}
    </div><form className="review-form" onSubmit={submit}>
      <h3>Write a review</h3><p className="review-help">Reviews appear after approval.</p>
      <fieldset disabled={busy}>
        <label>Your name<input className="commerce-input" name="author_name" required maxLength={100} autoComplete="name" /></label>
        <label>Rating<select className="commerce-input" name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map(value => <option value={value} key={value}>{value} {value === 1 ? "star" : "stars"}</option>)}</select></label>
        <label>Title <span className="review-help">(optional)</span><input className="commerce-input" name="title" maxLength={150} /></label>
        <label>Your review<textarea className="commerce-input" name="body" rows={5} required minLength={5} maxLength={3000} /></label>
      </fieldset>
      {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
      <button className="btn" disabled={busy}>{busy ? "Submitting…" : "Submit review"}</button>
    </form></div>
  </section>;
}
