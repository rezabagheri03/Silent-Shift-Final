export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/+$/, "");
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
