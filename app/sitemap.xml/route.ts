import { listPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";

export const dynamic = "force-dynamic";

/** Escape a string for safe inclusion in XML text/attribute content. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET(req: Request) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/+$/, "");
  const pods = listPodcasts({ limit: 500 }).items;
  const arts = listArticles({ limit: 500 }).items;

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${base}/` },
    { loc: `${base}/podcasts` },
    { loc: `${base}/articles` },
    { loc: `${base}/about` },
    { loc: `${base}/contact` },
    { loc: `${base}/faq` },
    ...pods.map((p) => ({ loc: `${base}/podcasts/${p.slug}`, lastmod: p.published_at })),
    ...arts.map((a) => ({ loc: `${base}/articles/${a.slug}`, lastmod: a.published_at })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""}</url>`
  )
  .join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
