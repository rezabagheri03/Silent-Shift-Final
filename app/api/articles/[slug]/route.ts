import { getArticleBySlug, getRelatedArticles, incrementArticleView } from "@/lib/repos/articles";
import { getPodcastsByCategoryId } from "@/lib/repos/podcasts";
import { ok, fail } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const article = getArticleBySlug((await params).slug);
  if (!article) return fail("روایت پیدا نشد", 404);

  // Only bump view count when ?track=1 (called explicitly from the public page)
  const url = new URL(req.url);
  if (url.searchParams.get("track") === "1") {
    const limit = rateLimit(clientKey(req, `article:${(await params).slug}`), { windowSeconds: 3600, max: 20 });
    if (limit.ok) incrementArticleView((await params).slug);
  }

  const relatedArticles = getRelatedArticles(article.id, 3);
  const relatedPodcasts = getPodcastsByCategoryId(article.category_id, 3);
  return ok({ article, related_articles: relatedArticles, related_podcasts: relatedPodcasts });
}
