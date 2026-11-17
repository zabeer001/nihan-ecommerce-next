import type { CSSProperties } from "react";

// [family, name, description, tone]
const scents = [
  ["Woody", "Oud Noir", "Smoked oud, amber and a trace of leather.", "#c9915a"],
  ["Fresh", "Padma", "Water lily, cool musk and green tea.", "#8fc7b0"],
  ["Green", "Mango Leaf", "Crushed leaves and sun-warmed fruit.", "#b4c75e"],
  ["Warm", "Monsoon", "Wet earth, cardamom and soft vanilla.", "#d98f7a"],
];

export function ScentGrid() {
  return (
    <div className="scents">
      {scents.map(([family, name, description, tone]) => (
        <div className="scent" key={name} style={{ "--tone": tone } as CSSProperties}>
          <small>{family}</small>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}
