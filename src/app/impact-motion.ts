"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

const impactGroups = [
  [".section-heading, .row-heading, .head, .catalog-detail, .story", "pair"],
  [".strip ul, .steps, .reviews, .scents", "converge"],
  [".tiles, .faq-list, .saved-order-list", "alternate"],
] as const;

function impactDirection(mode: (typeof impactGroups)[number][1], index: number, middle: number) {
  if (mode === "pair") return index === 0 ? "left" : "right";
  if (mode === "alternate") return index % 2 === 0 ? "left" : "right";
  if (index === middle) return "up";
  return index < middle ? "left" : "right";
}

export function useImpactMotion(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    // Let the server-rendered page paint in its starting position first.
    // A frame later, the page entrance can transition in instead of being
    // revealed before the visitor sees it.
    const frame = window.requestAnimationFrame(() => page.setAttribute("data-impact-ready", ""));

    return () => {
      window.cancelAnimationFrame(frame);
      page.removeAttribute("data-impact-ready");
    };
  }, [pageRef]);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return;

    const reveal = (element: Element) => element.setAttribute("data-impact-in", "");
    const observer = new IntersectionObserver(entries => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;

        if (target.hasAttribute("data-impact-from")) reveal(target);
        else target.querySelectorAll(":scope > [data-impact-from]").forEach(reveal);

        observer.unobserve(target);
      }
    }, { rootMargin: "0px 0px -6% 0px" });

    const scan = () => {
      for (const [selector, mode] of impactGroups) {
        for (const group of page.querySelectorAll(selector)) {
          const children = group.querySelectorAll<HTMLElement>(":scope > *");
          const middle = (children.length - 1) / 2;

          children.forEach((child, index) => {
            if (child.hasAttribute("data-impact-from")) return;

            const direction = impactDirection(mode, index, middle);
            const delay = direction === "up" ? 100 : mode === "alternate" ? Math.min(index, 5) * 50 : 0;

            child.setAttribute("data-impact-from", direction);
            if (delay) child.style.setProperty("--impact-delay", `${delay}ms`);
            observer.observe(mode === "alternate" ? child : group);
          });
        }
      }
    };

    scan();

    // The category headings and product grids can arrive through Suspense.
    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mutations.observe(page, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.cancelAnimationFrame(frame);
      page.querySelectorAll<HTMLElement>("[data-impact-from]").forEach(child => {
        child.removeAttribute("data-impact-from");
        child.removeAttribute("data-impact-in");
        child.style.removeProperty("--impact-delay");
      });
    };
  }, [pageRef]);
}
