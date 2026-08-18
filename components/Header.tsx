"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  MenuIcon,
  SearchIcon,
  CloseIcon,
  InstagramIcon,
  TelegramIcon,
  CastboxIcon,
  AnchorIcon,
} from "@/components/ui/Icons";
import SearchModal from "./SearchModal";

const NAV_ITEMS = [
  { href: "/", label: "خانه" },
  { href: "/podcasts", label: "پادکست‌ها" },
  { href: "/articles", label: "روایت‌ها" },
  { href: "/about", label: "داستان من" },
  { href: "/contact", label: "ارتباط" },
];

const SOCIALS = [
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/", label: "Instagram", icon: InstagramIcon },
  { href: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/8heshtaam", label: "Telegram", icon: TelegramIcon },
  { href: process.env.NEXT_PUBLIC_CASTBOX_URL || "https://castbox.fm/", label: "Castbox", icon: CastboxIcon },
  { href: process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL || "https://podcasts.apple.com/", label: "Apple Podcasts", icon: AnchorIcon },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`hidden xl:block sticky top-0 z-40 border-b transition-all ${scrolled ? "border-border bg-bg/90 backdrop-blur-xl" : "border-transparent bg-bg"}`}>
        <div className="mx-auto max-w-page h-[108px] px-page-x-d flex items-center justify-between" dir="ltr">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-[282px] h-11 shrink-0 rounded-md border border-border bg-surface px-3.5 flex items-center justify-end gap-2 text-text-primary hover:border-brand transition-colors"
            aria-label="جستجو"
          >
            <span className="text-d-body-sm text-right">جست و جو ...</span>
            <SearchIcon size={20} />
          </button>
          <div className="w-[144px] shrink-0" />
          <nav className="flex-1 flex items-center justify-center gap-10 lg:gap-[72px]" dir="rtl" aria-label="ناوبری اصلی">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`relative py-4 text-d-body-md transition-colors ${active ? "text-[#C9A84C]" : "text-text-secondary hover:text-white"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/" aria-label="خانه" className="w-[82px] h-[68px] shrink-0 flex items-center justify-center">
            <img src="/brand/logo-cropped.webp" alt="Silent Shift" className="w-full h-full object-contain" />
          </Link>
        </div>
      </header>

      <header className={`mobile-header-safe xl:hidden sticky top-0 z-[100] border-b transition-all ${scrolled ? "border-border bg-bg/90 backdrop-blur-xl" : "border-transparent bg-bg"}`}>
        <div className="h-full px-2 flex items-center justify-between" dir="ltr">
          <button onClick={() => setMenuOpen(true)} aria-label="باز کردن منو" aria-expanded={menuOpen} aria-controls="mobile-nav-drawer" className="w-11 h-11 -ml-2 flex items-center justify-center text-white">
            <MenuIcon size={24} />
          </button>
          <Link href="/" aria-label="خانه" className="h-[33px] shrink-0 flex items-center" dir="ltr">
            <img src="/brand/logo-cropped.webp" alt="Silent Shift" className="h-full object-contain" />
          </Link>
          <button onClick={() => setSearchOpen(true)} aria-label="جستجو" className="w-11 h-11 -mr-2 flex items-center justify-center text-white">
            <SearchIcon size={24} />
          </button>
        </div>
      </header>

      {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} onSearchOpen={() => { setMenuOpen(false); setSearchOpen(true); }} />}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileDrawer({ onClose, onSearchOpen }: { onClose: () => void; onSearchOpen: () => void }) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] xl:hidden bg-bg" role="dialog" aria-modal="true" aria-label="منوی اصلی">
      <div ref={drawerRef} className="flex flex-col h-full">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4" dir="ltr">
          <button ref={closeRef} onClick={onClose} aria-label="بستن منو" className="w-11 h-11 flex items-center justify-center text-white">
            <CloseIcon size={24} />
          </button>
          <span className="h-[28px] shrink-0 flex items-center" dir="ltr">
            <img src="/brand/logo-cropped.webp" alt="Silent Shift" className="h-full object-contain" />
          </span>
          <button onClick={onSearchOpen} aria-label="جستجو" className="w-11 h-11 flex items-center justify-center text-white">
            <SearchIcon size={24} />
          </button>
        </div>

        {/* Nav links - centered vertically */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-8" dir="rtl" aria-label="ناوبری موبایل">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} className={`text-[28px] leading-[40px] font-normal transition-colors ${active ? "text-brand" : "text-text-secondary"}`} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: divider + social icons */}
        <div className="px-6 pb-8" dir="ltr">
          <div className="w-full h-px bg-border mb-6" />
          <div className="flex items-center justify-center gap-4">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-12 h-12 rounded-full bg-overlay-chip flex items-center justify-center text-text-secondary hover:text-brand transition-colors">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
