const headers = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ slug: string }> };

async function forward(request: Request, context: Context, method: "GET" | "POST") {
  const { slug } = await context.params;
  let body: string | undefined;
  if (method === "POST") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "Invalid request origin." }, { status: 403, headers });
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return Response.json({ message: "Expected JSON." }, { status: 415, headers });
    body = await request.text();
    if (body.length > 16_000) return Response.json({ message: "Review is too long." }, { status: 413, headers });
    try { JSON.parse(body); } catch { return Response.json({ message: "Invalid review." }, { status: 422, headers }); }
  }
  try {
    const url = new URL(`/api/storefront/products/${encodeURIComponent(slug)}/reviews`, process.env.NIHAN_CATALOG_API_URL || "http://localhost:97");
    if (method === "GET") {
      const page = Number(new URL(request.url).searchParams.get("page") || 1);
      url.searchParams.set("page", String(Number.isInteger(page) && page > 0 ? Math.min(page, 10_000) : 1));
    }
    const response = await fetch(url, {
      method, body, headers: { Accept: "application/json", "Content-Type": "application/json" },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 429) return Response.json({ message: "Too many requests. Please try again shortly." }, {
      status: 429, headers: { ...headers, "Retry-After": response.headers.get("retry-after") || "60" },
    });
    if (response.ok || [404, 422].includes(response.status)) return Response.json(await response.json(), { status: response.status, headers });
  } catch { /* Return a retryable message when the review service is unavailable. */ }
  return Response.json({ message: "Reviews are temporarily unavailable. Please try again." }, { status: 503, headers });
}

export async function GET(request: Request, context: Context) { return forward(request, context, "GET"); }
export async function POST(request: Request, context: Context) { return forward(request, context, "POST"); }
