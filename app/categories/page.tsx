import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listCategories } from "@/lib/repos/categories";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "دسته‌بندی‌ها",
  description: "همه دسته‌بندی‌های پادکست‌ها و روایت‌های Silent Shift.",
  path: "/categories",
});

export default function CategoriesPage() {
  const categories = listCategories();
  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "دسته‌بندی‌ها" }]} />
      <SectionTitle as="h1" align="right">دسته‌بندی‌ها</SectionTitle>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="block rounded border border-white/10 px-4 py-3 text-right text-text-primary transition-colors hover:border-brand hover:text-brand"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
