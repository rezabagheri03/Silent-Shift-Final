import { listPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { listFaqs } from "@/lib/repos/faqs";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

function plain(value: string | null | undefined): string {
  return (value || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>#]+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function GET() {
  const podcasts = listPodcasts({ limit: 100 }).items;
  const articles = listArticles({ limit: 100 }).items;
  const faqs = listFaqs();

  const body = `# Silent Shift

> پادکست و روایت‌های فارسی درباره مکث، تغییر آرام، مهاجرت و توسعه فردی؛ همراهی برزو ذاکری.

## Podcast
${podcasts.map((p) => `- [${plain(p.title)}](${SITE_URL}/podcasts/${p.slug}): ${plain(p.summary || p.description)}`).join("\n")}

## Articles
${articles.map((a) => `- [${plain(a.title)}](${SITE_URL}/articles/${a.slug}): ${plain(a.excerpt)}`).join("\n")}

## FAQ
${faqs.map((f) => `- ${plain(f.question)} ${plain(f.answer)}`).join("\n")}

## Pages
- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [FAQ](${SITE_URL}/faq)
- [Categories](${SITE_URL}/categories)
- [Tags](${SITE_URL}/tags)
- [RSS](${SITE_URL}/rss.xml)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
