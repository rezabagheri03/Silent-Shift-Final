export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const base = new URL(req.url).origin;
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
