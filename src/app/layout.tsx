import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getStorefrontSettings } from "./catalog-api";
import { Footer, Header } from "./storefront";
import "./globals.css";
import { ProductPixel } from "./products/[slug]/product-pixel";
import { PageTracking } from "./ecommerce-tracking";
import { TagManager } from "./tag-manager";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings().catch(() => null);
  return {
    title: settings?.meta_title || "NIHAN – Car Fragrance",
    description: settings?.meta_description || undefined,
    verification: settings?.google_site_verification
      ? { google: settings.google_site_verification } : undefined,
  };
}

async function StorefrontPixel() {
  const settings = await getStorefrontSettings().catch(() => null);
  return <><TagManager containerId={settings?.gtm_container_id} /><ProductPixel pixelId={settings?.meta_pixel_id || null} /></>;
}

async function RuntimeMetadata() {
  await connection();
  return null;
}

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const sharedTheme = document.cookie.match(/(?:^|;\\s*)nihan-theme=(light|dark)(?:;|$)/)?.[1];
            const theme = sharedTheme || localStorage.getItem("nihan-theme");
            if (theme === "light" || theme === "dark") {
              document.documentElement.dataset.theme = theme;
              if (!sharedTheme) document.cookie = "nihan-theme=" + theme + "; Path=/; Max-Age=31536000; SameSite=Lax";
            }
          } catch {}
        ` }} />
      </head>
      <body>
        <Suspense><PageTracking /></Suspense>
        <Suspense><StorefrontPixel /></Suspense>
        <Suspense><RuntimeMetadata /></Suspense>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
