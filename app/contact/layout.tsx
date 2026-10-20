import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Never let this form page be prerendered with a year-long public cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "ارتباط",
  description: "برای گفت‌وگو، هماهنگی جلسه کوچینگ یا هر پرسشی با برزو ذاکری در ارتباط باشید.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
