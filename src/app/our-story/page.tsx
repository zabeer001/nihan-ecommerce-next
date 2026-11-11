import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story – NIHAN",
  description: "Read how NIHAN began making car fragrances for everyday drives across Bangladesh.",
};

export default function OurStoryPage() {
  return (
    <main>
      <section className="split" aria-labelledby="story-title">
        <div className="wrap">
          <div className="head">
            <h1 className="category-title" id="story-title">Our story</h1>
          </div>
          <div className="story">
            <blockquote>A tiger moves with <em>calm intent.</em> We wanted the same for the road.</blockquote>
            <p>NIHAN began in 2026 with one idea: the car is a room you carry with you, and it should smell like it was chosen. We make fragrance for that room, and we deliver it across Bangladesh.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
