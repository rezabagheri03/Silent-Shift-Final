import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ارتباط",
  description: "برای گفت‌وگو، هماهنگی جلسه کوچینگ یا هر پرسشی با برزو ذاکری در ارتباط باشید.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
