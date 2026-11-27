"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type PixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: PixelFunction;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: PixelFunction;
    _fbq?: PixelFunction;
    nihanPixelIds?: Set<string>;
  }
}

export function ProductPixel({ pixelId, slug, name }: { pixelId: string | null; slug?: string; name?: string }) {
  const pathname = usePathname();
  const tracked = useRef("");

  useEffect(() => {
    if (!pixelId || !/^[0-9]{5,30}$/.test(pixelId)) return;
    const key = `${pixelId}:${slug || pathname}`;
    if (tracked.current === key) return;

    if (!window.fbq) {
      const fbq: PixelFunction = Object.assign(function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      }, { queue: [] as unknown[][], loaded: true, version: "2.0" }) as PixelFunction;
      fbq.push = fbq;
      window.fbq = fbq;
      window._fbq = fbq;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    const initialized = window.nihanPixelIds ??= new Set<string>();
    if (!initialized.has(pixelId)) {
      window.fbq("set", "autoConfig", false, pixelId);
      window.fbq("init", pixelId);
      initialized.add(pixelId);
    }
    if (slug) {
      window.fbq("trackSingle", pixelId, "ViewContent", {
        content_ids: [slug], content_name: name, content_type: "product",
      });
    } else window.fbq("trackSingle", pixelId, "PageView");
    tracked.current = key;
  }, [pixelId, slug, name, pathname]);

  return null;
}
