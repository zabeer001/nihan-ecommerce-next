import type { Metadata, Viewport } from "next";
import { Footer, Header } from "./storefront";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIHAN – Car Fragrance",
  description: "Explore the NIHAN AI Car Aroma Diffuser and refillable car fragrances. Delivering across Bangladesh.",
  verification: {
    google: "02FRVzx5AfvYrAPdlvIKxOh5XneV0BXojF1QKzY6TFY",
  },
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
