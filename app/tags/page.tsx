import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listTags } from "@/lib/repos/tags";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "برچسب‌ها",
  description: "همه برچسب‌های پادکست‌ها و روایت‌های Silent Shift.",
  path: "/tags",
});

export default function TagsPage() {
  const tags = listTags();
  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "برچسب‌ها" }]} />
      <SectionTitle as="h1" align="right">برچسب‌ها</SectionTitle>
      <ul className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <li key={tag.id}>
            <Link
              href={`/tags/${tag.slug}`}
              className="inline-flex rounded border border-white/10 px-3 py-2 text-[14px] text-text-secondary transition-colors hover:border-brand hover:text-brand"
            >
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
