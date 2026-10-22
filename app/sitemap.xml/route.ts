import { listPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { listCategories } from "@/lib/repos/categories";
import { getContentUpdatedAt } from "@/lib/repos/content";
import { SITE_URL, toIso } from "@/lib/seo";

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

export function GET() {
  const base = SITE_URL;
  const pods = listPodcasts({ limit: 500 }).items;
  const arts = listArticles({ limit: 500 }).items;
  const contentUpdated = toIso(getContentUpdatedAt());
  const lastPod = toIso(pods.reduce<string | undefined>((max, p) => (!max || (p.updated_at || p.published_at) > max ? p.updated_at || p.published_at : max), undefined));
  const lastArt = toIso(arts.reduce<string | undefined>((max, a) => (!max || (a.updated_at || a.published_at) > max ? a.updated_at || a.published_at : max), undefined));

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${base}/`, lastmod: contentUpdated },
    { loc: `${base}/podcasts`, lastmod: lastPod },
    { loc: `${base}/articles`, lastmod: lastArt },
    { loc: `${base}/about`, lastmod: contentUpdated },
    { loc: `${base}/contact` },
    { loc: `${base}/faq`, lastmod: contentUpdated },
    { loc: `${base}/categories`, lastmod: contentUpdated },
    { loc: `${base}/tags`, lastmod: contentUpdated },
    ...pods.map((p) => ({ loc: `${base}/podcasts/${p.slug}`, lastmod: toIso(p.updated_at || p.published_at) })),
    ...arts.map((a) => ({ loc: `${base}/articles/${a.slug}`, lastmod: toIso(a.updated_at || a.published_at) })),
    ...listCategories().map((c) => ({ loc: `${base}/categories/${c.slug}`, lastmod: contentUpdated })),
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
