import { getPodcastBySlug, listPodcasts } from "@/lib/repos/podcasts";
import { getArticleBySlug, listArticles } from "@/lib/repos/articles";
import { getCategoryBySlug, listCategories } from "@/lib/repos/categories";
import { getTagBySlug, listTags } from "@/lib/repos/tags";
import { listFaqs } from "@/lib/repos/faqs";
import { getAllContent } from "@/lib/repos/content";
import { SITE_URL, absoluteUrl, toIso } from "@/lib/seo";

export const dynamic = "force-dynamic";

function plain(value: string | null | undefined): string {
  return (value || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>#]+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function markdown(body: string, canonical: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Location": canonical,
      "Link": `<${canonical}>; rel="canonical"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vary": "Accept",
    },
  });
}

function notFound(): Response {
  return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function header(title: string, canonical: string, description?: string | null): string {
  return [
    `# ${title}`,
    "",
    description ? plain(description) : "",
    "",
    `Canonical: ${canonical}`,
    `Site: ${SITE_URL}`,
    "",
  ].join("\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const [section, identifier] = slug;

  if (!section) {
    const podcasts = listPodcasts({ limit: 5 }).items;
    const articles = listArticles({ limit: 5 }).items;
    const body = [
      header("Silent Shift", `${SITE_URL}/`, "پادکست و روایت‌های فارسی درباره مکث، تغییر آرام، مهاجرت و توسعه فردی."),
      "## Latest episodes",
      ...podcasts.map((p) => `- [${plain(p.title)}](${SITE_URL}/podcasts/${p.slug})`),
      "",
      "## Latest articles",
      ...articles.map((a) => `- [${plain(a.title)}](${SITE_URL}/articles/${a.slug})`),
      "",
      "## Pages",
      `- [Podcasts](${SITE_URL}/podcasts)`,
      `- [Articles](${SITE_URL}/articles)`,
      `- [About](${SITE_URL}/about)`,
      `- [FAQ](${SITE_URL}/faq)`,
      `- [Contact](${SITE_URL}/contact)`,
    ].join("\n");
    return markdown(body, `${SITE_URL}/`);
  }

  if (section === "podcasts" && !identifier) {
    const podcasts = listPodcasts({ limit: 500 }).items;
    const body = [
      header("پادکست‌ها", `${SITE_URL}/podcasts`, "همه اپیزودهای Silent Shift."),
      ...podcasts.map((p) =>
        [
          `- [${plain(p.title)}](${SITE_URL}/podcasts/${p.slug})`,
          `  - ${toIso(p.published_at)}${p.duration_seconds ? ` · ${Math.round(p.duration_seconds / 60)} دقیقه` : ""}`,
          plain(p.summary || p.description) ? `  - ${plain(p.summary || p.description)}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      ),
    ].join("\n");
    return markdown(body, `${SITE_URL}/podcasts`);
  }

  if (section === "podcasts" && identifier) {
    const podcast = getPodcastBySlug(identifier);
    if (!podcast) return notFound();
    const canonical = `${SITE_URL}/podcasts/${podcast.slug}`;
    const paragraphs = plain(podcast.summary || podcast.description);
    const transcript = podcast.transcript?.trim();
    const body = [
      header(podcast.title, canonical, podcast.subtitle || paragraphs),
      "## Metadata",
      `- Published: ${toIso(podcast.published_at)}`,
      `- Updated: ${toIso(podcast.updated_at || podcast.published_at)}`,
      podcast.episode_number ? `- Episode: ${podcast.episode_number}` : "",
      podcast.duration_seconds ? `- Duration: ${Math.round(podcast.duration_seconds / 60)} minutes` : "",
      podcast.category_name ? `- Category: ${podcast.category_name}` : "",
      podcast.audio_url ? `- Audio: ${absoluteUrl(podcast.audio_url)}` : "",
      "",
      paragraphs ? `## Summary\n\n${paragraphs}` : "",
      podcast.chapters?.length
        ? `## Chapters\n\n${podcast.chapters.map((c) => `- ${c.title} — ${c.start_seconds}s`).join("\n")}`
        : "",
      transcript ? `## Transcript\n\n${transcript}` : "",
      podcast.tags?.length ? `## Tags\n\n${podcast.tags.map((t) => `- [${t.name}](${SITE_URL}/tags/${t.slug})`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    return markdown(body, canonical);
  }

  if (section === "articles" && !identifier) {
    const articles = listArticles({ limit: 500 }).items;
    const body = [
      header("روایت‌ها", `${SITE_URL}/articles`, "همه روایت‌های Silent Shift."),
      ...articles.map((a) =>
        [
          `- [${plain(a.title)}](${SITE_URL}/articles/${a.slug})`,
          `  - ${toIso(a.published_at)}${a.category_name ? ` · ${a.category_name}` : ""}`,
          plain(a.excerpt) ? `  - ${plain(a.excerpt)}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      ),
    ].join("\n");
    return markdown(body, `${SITE_URL}/articles`);
  }

  if (section === "articles" && identifier) {
    const article = getArticleBySlug(identifier);
    if (!article) return notFound();
    const canonical = `${SITE_URL}/articles/${article.slug}`;
    const body = [
      header(article.title, canonical, article.excerpt),
      "## Metadata",
      `- Published: ${toIso(article.published_at)}`,
      `- Updated: ${toIso(article.updated_at || article.published_at)}`,
      article.author ? `- Author: ${article.author}` : "",
      article.category_name ? `- Category: ${article.category_name}` : "",
      "",
      article.body?.trim() || "",
      article.tags?.length
        ? `## Tags\n\n${article.tags.map((t) => `- [${t.name}](${SITE_URL}/tags/${t.slug})`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    return markdown(body, canonical);
  }

  if (section === "about" && !identifier) {
    const content = getAllContent();
    const body = [
      header("داستان من", `${SITE_URL}/about`, content.about_short),
      content.about_long || "",
      `\n[تماس](${SITE_URL}/contact)`,
    ].join("\n\n");
    return markdown(body, `${SITE_URL}/about`);
  }

  if (section === "faq" && !identifier) {
    const faqs = listFaqs();
    const body = [
      header("سوالات متداول", `${SITE_URL}/faq`),
      ...faqs.map((f) => `## ${plain(f.question)}\n\n${plain(f.answer)}`),
    ].join("\n\n");
    return markdown(body, `${SITE_URL}/faq`);
  }

  if (section === "contact" && !identifier) {
    const body = [
      header("ارتباط", `${SITE_URL}/contact`, "برای هماهنگی گفتگو یا پرسش، از صفحه تماس استفاده کنید."),
      `[فرم تماس](${SITE_URL}/contact)`,
      `[تلگرام](https://t.me/+g_XSWnv44WI4NmI0)`,
    ].join("\n\n");
    return markdown(body, `${SITE_URL}/contact`);
  }

  if (section === "categories" && !identifier) {
    const categories = listCategories();
    const body = [
      header("دسته‌بندی‌ها", `${SITE_URL}/categories`),
      ...categories.map((c) => `- [${c.name}](${SITE_URL}/categories/${c.slug})`),
    ].join("\n");
    return markdown(body, `${SITE_URL}/categories`);
  }

  if (section === "categories" && identifier) {
    const category = getCategoryBySlug(identifier);
    if (!category) return notFound();
    const podcasts = listPodcasts({ category: category.slug, limit: 500 }).items;
    const articles = listArticles({ category: category.slug, limit: 500 }).items;
    const canonical = `${SITE_URL}/categories/${category.slug}`;
    const body = [
      header(category.name, canonical, `همه محتوای دسته ${category.name}.`),
      "## Episodes",
      ...podcasts.map((p) => `- [${plain(p.title)}](${SITE_URL}/podcasts/${p.slug})`),
      "",
      "## Articles",
      ...articles.map((a) => `- [${plain(a.title)}](${SITE_URL}/articles/${a.slug})`),
    ].join("\n");
    return markdown(body, canonical);
  }

  if (section === "tags" && !identifier) {
    const tags = listTags();
    const body = [
      header("برچسب‌ها", `${SITE_URL}/tags`),
      ...tags.map((t) => `- [${t.name}](${SITE_URL}/tags/${t.slug})`),
    ].join("\n");
    return markdown(body, `${SITE_URL}/tags`);
  }

  if (section === "tags" && identifier) {
    const tag = getTagBySlug(identifier);
    if (!tag) return notFound();
    const podcasts = listPodcasts({ tag: tag.slug, limit: 500 }).items;
    const articles = listArticles({ tag: tag.slug, limit: 500 }).items;
    const canonical = `${SITE_URL}/tags/${tag.slug}`;
    const body = [
      header(tag.name, canonical, `همه محتوای مرتبط با برچسب ${tag.name}.`),
      "## Episodes",
      ...podcasts.map((p) => `- [${plain(p.title)}](${SITE_URL}/podcasts/${p.slug})`),
      "",
      "## Articles",
      ...articles.map((a) => `- [${plain(a.title)}](${SITE_URL}/articles/${a.slug})`),
    ].join("\n");
    return markdown(body, canonical);
  }

  if (section === "search") {
    return markdown(
      [header("جستجو", `${SITE_URL}/search`), `Search is interactive: ${SITE_URL}/search`].join("\n\n"),
      `${SITE_URL}/search`
    );
  }

  return notFound();
}
