import { formatPrice } from "./money";

export function ProductPrice({ price, original, formattedPrice }: { price: number; original?: number | null; formattedPrice?: string }) {
  return <span className="product-price">
    {original != null && original > price && <>
      <span className="visually-hidden">Price before discount: </span>
      <del>{formatPrice(original)}</del>
      <span className="visually-hidden"> Discounted price: </span>
    </>}
    <span>{formattedPrice ?? formatPrice(price)}</span>
  </span>;
}
