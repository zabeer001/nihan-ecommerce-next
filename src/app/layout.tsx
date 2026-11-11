import type { Metadata, Viewport } from "next";
import { ArtworkDefinitions } from "./catalog";
import { Footer, Header } from "./storefront";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIHAN – Car Fragrance",
  description: "Explore the NIHAN AI Car Aroma Diffuser and refillable car fragrances. Delivering across Bangladesh.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem("nihan-theme") === "light") {
              document.documentElement.dataset.theme = "light";
            }
          } catch {}
        ` }} />
      </head>
      <body>
        <ArtworkDefinitions />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
