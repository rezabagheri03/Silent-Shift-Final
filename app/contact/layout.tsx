import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ارتباط",
  description: "برای گفت‌وگو، هماهنگی جلسه کوچینگ یا هر پرسشی با برزو ذاکری در ارتباط باشید.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
