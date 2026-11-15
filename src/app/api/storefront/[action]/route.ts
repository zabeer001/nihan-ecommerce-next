const actions = new Set(["quote", "orders", "tracking"]);
const headers = { "Cache-Control": "private, no-store" };

export async function POST(request: Request, context: RouteContext<"/api/storefront/[action]">) {
  const { action } = await context.params;
  if (!actions.has(action)) return Response.json({ message: "Not found." }, { status: 404, headers });

  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return Response.json({ message: "Expected a JSON request." }, { status: 415, headers });
  }
  const body = await request.text();
  if (body.length > 24_000) {
    return Response.json({ message: "Request is too large." }, { status: 413, headers });
  }

  try {
    const origin = process.env.NIHAN_CATALOG_API_URL || "http://localhost:97";
    const response = await fetch(new URL(`/api/storefront/${action}`, origin), {
      method: "POST",
      body,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404 && action === "tracking") {
      return Response.json({ message: "Order not found." }, { status: 404, headers });
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      return Response.json({ message: "Too many requests. Please try again shortly." }, {
        status: 429,
        headers: retryAfter ? { ...headers, "Retry-After": retryAfter } : headers,
      });
    }
    if (response.ok || response.status === 409 || response.status === 422) {
      return Response.json(await response.json(), { status: response.status, headers });
    }
  } catch {
    // An unavailable upstream and an uncertain write both need a retryable response.
  }

  return Response.json({ message: "The order service is temporarily unavailable. Please try again." }, { status: 503, headers });
}
