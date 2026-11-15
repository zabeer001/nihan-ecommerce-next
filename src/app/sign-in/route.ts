import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const laravelOrigin = process.env.NIHAN_LARAVEL_PUBLIC_URL
    || process.env.NIHAN_CATALOG_API_URL
    || "http://localhost:97";

  const destination = new URL("/sign-in", laravelOrigin);
  const theme = request.cookies.get("nihan-theme")?.value;
  if (theme === "light" || theme === "dark") {
    destination.searchParams.set("storefront_theme", theme);
  }

  return new Response(null, {
    status: 307,
    headers: { Location: destination.href, "Cache-Control": "private, no-store" },
  });
}
