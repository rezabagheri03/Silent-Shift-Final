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
import SearchPopover from "./SearchPopover";
import HeaderSearch from "./HeaderSearch";

const NAV_ITEMS = [
  { href: "/", label: "خانه" },
  { href: "/podcasts", label: "پادکست‌ها" },
  { href: "/articles", label: "روایت‌ها" },
  { href: "/about", label: "داستان من" },
  { href: "/contact", label: "ارتباط" },
];

const SOCIALS = [
  // size = per-icon render size matching the footer chips (Figma ink specs)
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/", label: "Instagram", icon: InstagramIcon, size: 28 },
  { href: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/8heshtaam", label: "Telegram", icon: TelegramIcon, size: 33 },
  { href: process.env.NEXT_PUBLIC_CASTBOX_URL || "https://castbox.fm/", label: "Castbox", icon: CastboxIcon, size: 31 },
  { href: process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL || "https://podcasts.apple.com/", label: "Apple Podcasts", icon: AnchorIcon, size: 33 },
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
          <div className="relative">
            <HeaderSearch />
          </div>
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
            <img src="/brand/logo-cropped.webp" alt="Silent Shift" width={1254} height={1254} className="w-full h-full object-contain" />
          </Link>
        </div>
      </header>

      <header className={`mobile-header-safe xl:hidden sticky top-0 z-[100] border-b transition-all ${scrolled ? "border-border bg-bg/90 backdrop-blur-xl" : "border-transparent bg-bg"}`}>
        <div className="h-full px-8 flex items-center justify-between" dir="ltr">
          <button onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "بستن منو" : "باز کردن منو"} aria-expanded={menuOpen} aria-controls="mobile-nav-drawer" className="w-8 h-8 shrink-0 flex items-center justify-center text-white">
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
          <span dir="ltr" className="text-[24px] font-semibold leading-8 text-[#C9A84C]">SILENT SHIFT</span>
          <div className="relative">
            <button
              data-search-trigger
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="جستجو"
              aria-expanded={searchOpen}
              aria-controls="site-search-popover"
              className={`w-8 h-8 flex items-center justify-center text-[#F5F5F5] transition-colors hover:text-white ${searchOpen ? "text-brand" : ""}`}
            >
              <SearchIcon size={24} />
            </button>
            {searchOpen && (
              <div id="site-search-popover">
                <SearchPopover open={searchOpen} onClose={() => setSearchOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </header>

      {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} onSearchOpen={() => { setMenuOpen(false); setSearchOpen(true); }} />}
    </>
  );
}

function MobileDrawer({ onClose, onSearchOpen }: { onClose: () => void; onSearchOpen: () => void }) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // T21: capture the opener once; restore focus when the drawer unmounts
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    return () => { openerRef.current?.focus?.(); };
  }, []);
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
    <div className="fixed inset-0 z-[110] xl:hidden bg-bg" role="dialog" aria-modal="true" aria-label="منوی اصلی">
      <div ref={drawerRef} className="flex flex-col h-full">
        {/* Header bar — Figma 1:2183: 48px, X left · gold "SILENT SHIFT" text center · search right */}
        {/* Icon centers sit 54px from the screen edges (px-8 bar) */}
        <div className="flex h-12 shrink-0 items-center justify-between px-8 pt-2" dir="ltr">
          <button ref={closeRef} onClick={onClose} aria-label="بستن منو" className="flex h-8 w-8 items-center justify-center text-[#F5F5F5]">
            <CloseIcon size={24} />
          </button>
          <span dir="ltr" className="text-[24px] font-semibold leading-8 text-[#C9A84C]">SILENT SHIFT</span>
          <button onClick={onSearchOpen} aria-label="جستجو" className="flex h-8 w-8 items-center justify-center text-[#F5F5F5]">
            <SearchIcon size={24} />
          </button>
        </div>

        {/* Menu Items — Figma: gap 48, centered; active 24/32 DemiBold gold, rest 28/36 DemiBold #A1A1AA */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-12 px-4 py-9" dir="rtl" aria-label="ناوبری موبایل">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`transition-colors ${
                  active
                    ? "text-[24px] font-semibold leading-8 text-[#C9A84C]"
                    : "text-[28px] font-semibold leading-9 text-[#A1A1AA]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — Figma: gradient glow divider + 40px chips spread across full width */}
        <div className="shrink-0 px-2 pb-3">
          <div
            aria-hidden
            className="mb-5 h-px w-full"
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)" }}
          />
          <div className="flex items-center justify-between px-2 pb-1">
            {SOCIALS.map(({ href, label, icon: Icon, size }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]/15 text-[#A1A1AA] transition-colors hover:text-white"
              >
                <Icon size={size} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
