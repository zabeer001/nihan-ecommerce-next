export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const page = Number(new URL(request.url).searchParams.get("page") || 1);
  if (!Number.isSafeInteger(page) || page < 1) return Response.json({ message: "Invalid page." }, { status: 422, headers });
  try {
    const url = new URL('/api/storefront/reviews', process.env.NIHAN_CATALOG_API_URL || 'http://localhost:97');
    url.searchParams.set('page', String(page));
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(5000) });
    if (response.ok) return Response.json(await response.json(), { headers });
  } catch { /* Show a retryable error without discarding displayed reviews. */ }
  return Response.json({ message: 'Could not load more reviews. Please try again.' }, { status: 503, headers });
}
