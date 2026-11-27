import Script from "next/script";

export function TagManager({ containerId }: { containerId?: string | null }) {
  const id = containerId || process.env.NEXT_PUBLIC_GTM_ID;
  const validId = id && /^GTM-[A-Z0-9]+$/.test(id) ? id : null;
  return <Script id="nihan-gtm" strategy="afterInteractive">{`
    window.dataLayer = window.dataLayer || [];
    ${validId ? `
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=${validId}';
    document.head.appendChild(script);` : ""}
  `}</Script>;
}
