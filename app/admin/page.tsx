import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function count(table: string): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
}

export default function AdminDashboard() {
  const stats = {
    podcasts: count("podcasts"),
    articles: count("articles"),
    subscribers: count("newsletter_subscribers"),
    messages: count("contact_messages"),
  };
  const cards: { label: string; value: number; href: string; hint?: string }[] = [
    { label: "پادکست‌ها", value: stats.podcasts, href: "/admin/podcasts", hint: "افزودن / ویرایش" },
    { label: "روایت‌ها", value: stats.articles, href: "/admin/articles", hint: "افزودن / ویرایش" },
    { label: "مشترکین خبرنامه", value: stats.subscribers, href: "/admin/messages", hint: "لیست ایمیل‌ها" },
    { label: "پیام‌های تماس", value: stats.messages, href: "/admin/messages", hint: "خواندن پیام‌ها" },
  ];
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-d-h3 text-text-primary mb-8">داشبورد</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-surface rounded-lg p-6 border border-border hover:border-brand transition-colors"
          >
            <div className="text-d-body-sm text-text-secondary">{c.label}</div>
            <div className="text-[36px] font-bold text-brand mt-2 leading-none">{c.value}</div>
            {c.hint && <div className="text-d-body-sm text-text-tertiary mt-3">{c.hint}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
