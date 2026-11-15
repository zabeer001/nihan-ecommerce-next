import { connection } from "next/server";

export async function GET() {
  await connection();
  const laravelOrigin = process.env.NIHAN_LARAVEL_PUBLIC_URL
    || process.env.NIHAN_CATALOG_API_URL
    || "http://localhost:97";

  return Response.redirect(new URL("/sign-in", laravelOrigin), 307);
}
