import Link from "next/link";
import { DiffuserArtwork, ProductGrid, ScentGrid } from "./catalog";

const features = [
  ["Intensity", "Three levels, set with a single press. It remembers your last choice."],
  ["Reservoir", "50 ml refillable. Pour in any NIHAN refill and go."],
  ["Glow", "A soft starlight light that stays easy on the eyes at night."],
  ["Body", "Dark metallic finish that sits quietly in any cabin."],
];

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

export default function Home() {
  const videoId = process.env.NIHAN_HERO_VIDEO_ID?.trim() || "ScMzIvxBSi4";
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
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <h1 className="visually-hidden" id="hero-title">NIHAN AI Car Aroma Diffuser</h1>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${videoParams}`}
          title="Landing page video"
          allow="autoplay; encrypted-media"
        />
      </section>

      <div className="strip">
        <div className="wrap">
          <ul>
            <li>One-touch control</li>
            <li>50 ml refillable</li>
            <li>Starlight glow</li>
            <li>Cash on delivery</li>
          </ul>
        </div>
      </div>

      <section id="shop">
        <div className="wrap">
          <div className="head">
            <div>
              <p className="eyebrow">The collection</p>
              <h2>Made for the<br /><em>cabin.</em></h2>
            </div>
            <Link className="link" href="/products">Shop all</Link>
          </div>
          <div className="collection-rows" id="collection">
            <section aria-labelledby="collection-fragrance">
              <div className="collection-row-heading">
                <h3 id="collection-fragrance">Fragrance</h3>
                <Link className="link" href="/fragrance">View all fragrances</Link>
              </div>
              <ProductGrid category="fragrance" />
            </section>
            <section aria-labelledby="collection-accessories">
              <div className="collection-row-heading">
                <h3 id="collection-accessories">Accessories</h3>
                <Link className="link" href="/accessories">View all accessories</Link>
              </div>
              <ProductGrid category="accessories" />
            </section>
          </div>
        </div>
      </section>

      <section className="split" id="feature">
        <div className="wrap feature">
          <div className="vis"><DiffuserArtwork /></div>
          <div>
            <p className="eyebrow">The diffuser</p>
            <h2>One touch.<br /><em>Your whole drive.</em></h2>
            <ul className="feat">
              {features.map(([title, description]) => (
                <li key={title}><strong>{title}</strong><span>{description}</span></li>
              ))}
            </ul>
            <Link className="btn" href="/accessories">Shop the diffuser</Link>
          </div>
        </div>
      </section>

      <section id="quick-start" aria-labelledby="quick-start-title">
        <div className="wrap">
          <div className="head">
            <h2 id="quick-start-title">How to use <em>your diffuser.</em></h2>
            <Link className="link" href="/fragrance#refills">Browse refills</Link>
          </div>
          <ol className="grid diffuser-steps">
            {diffuserSteps.map(([title, description]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="scents">
        <div className="wrap">
          <div className="head">
            <div>
              <p className="eyebrow">Fragrances</p>
              <h2>Four ways to <em>arrive.</em></h2>
            </div>
          </div>
          <ScentGrid />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="head">
            <div>
              <p className="eyebrow">Reviews</p>
              <h2>Said on <em>the road.</em></h2>
            </div>
          </div>
          <div className="rev">
            {reviews.map(([quote, author]) => (
              <figure key={author}>
                <blockquote>{quote}</blockquote>
                <figcaption>{author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <div className="wrap faq">
          <h2 id="faq-title">Frequently asked <em>questions.</em></h2>
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

      <section className="news">
        <div className="wrap">
          <p className="eyebrow">Newsletter</p>
          <h2>First to know, <em>first to scent.</em></h2>
          <div className="newsletter-fields">
            <input type="email" placeholder="Your email" aria-label="Email address" disabled />
            <button className="btn fill" type="button" disabled>Subscribe</button>
          </div>
        </div>
      </section>
    </main>
  );
}
