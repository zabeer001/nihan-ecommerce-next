"use client";

import { useRef, type ReactNode } from "react";
import { useImpactMotion } from "./impact-motion";

export function StorefrontPage({ children, className }: { children: ReactNode; className?: string }) {
  const pageRef = useRef<HTMLElement>(null);
  useImpactMotion(pageRef);

  return (
    <main ref={pageRef} className={className ? `storefront-page ${className}` : "storefront-page"}>
      {children}
    </main>
  );
}
