import type { CSSProperties } from "react";
import type { CategoryContentCard } from "./catalog-api";

export function ScentGrid({ cards }: { cards: CategoryContentCard[] | null }) {
  if (!cards?.length) return null;
  return (
    <div className="scents" style={{ "--card-count": cards.length } as CSSProperties}>
      {cards.map(({ label, title, description, color }, index) => (
        <div className="scent" key={index} style={{ "--tone": color } as CSSProperties}>
          <small>{label}</small>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}
