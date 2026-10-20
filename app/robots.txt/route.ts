import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function GET() {
  const base = SITE_URL;
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
