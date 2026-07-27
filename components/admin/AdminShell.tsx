"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { BackupButton } from "@/components/admin/BackupButton";

const LINKS = [
  ["/admin", "داشبورد"],
  ["/admin/podcasts", "پادکست‌ها"],
  ["/admin/articles", "روایت‌ها"],
  ["/admin/categories", "دسته‌ها"],
  ["/admin/tags", "تگ‌ها"],
  ["/admin/faqs", "FAQ"],
  ["/admin/messages", "پیام‌ها"],
  ["/admin/content", "محتوا"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="bg-surface border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/admin" className="text-brand tracking-[0.05em] font-semibold text-[18px]">SILENT SHIFT · مدیریت</Link>
        <nav className="flex items-center gap-4 text-d-body-sm flex-wrap" aria-label="مدیریت">
          {LINKS.map(([href, label]) => <Link key={href} href={href} className="text-text-primary hover:text-brand transition-colors">{label}</Link>)}
          <BackupButton />
          <Link href="/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-brand transition-colors">سایت ↗</Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
