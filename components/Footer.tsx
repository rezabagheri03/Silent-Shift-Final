"use client";

import Link from "next/link";
import { useNewsletterSignup } from "@/components/useNewsletterSignup";
import {
  InstagramIcon,
  TelegramIcon,
  CastboxIcon,
  AnchorIcon,
} from "@/components/ui/Icons";

const NAV = [
  { href: "/podcasts", label: "پادکست‌ها" },
  { href: "/articles", label: "روایت‌ها" },
  { href: "/about", label: "داستان من" },
  { href: "/contact", label: "ارتباط" },
];

const SOCIALS = [
  {
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/",
    label: "Instagram",
    icon: InstagramIcon,
    // Per-icon render sizes chosen so the visible glyph ink matches the
    // Figma chip spec (each icon carries different empty margins internally)
    size: 28,
  },
  {
    href: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/8heshtaam",
    label: "Telegram",
    icon: TelegramIcon,
    size: 33,
  },
  {
    href: process.env.NEXT_PUBLIC_CASTBOX_URL || "https://castbox.fm/",
    label: "Castbox",
    icon: CastboxIcon,
    size: 31,
  },
  {
    href: process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL || "https://podcasts.apple.com/",
    label: "Apple Podcasts",
    icon: AnchorIcon,
    size: 33,
  },
];

export default function Footer() {
  const { email, setEmail, status, message: msg, messageId, submit, inputA11y } = useNewsletterSignup();

  return (
    <footer className="px-6 xl:px-[120px] pb-4 xl:pb-6 pt-8 xl:pt-12">
      {/* Outer container */}
      <div className="mx-auto flex flex-col items-center justify-center w-full max-w-[1200px] min-h-[365px] bg-[#171717] rounded-[24px] px-6 py-12 xl:px-[120px] xl:py-12">
        {/* Inner row */}
        <div className="flex flex-col xl:flex-row items-center justify-center w-full max-w-[960px] gap-12 xl:gap-[96px] min-h-[265px] xl:min-h-0" dir="rtl">
          {/* Main Footer */}
          <div className="flex flex-col items-center xl:items-start w-full xl:w-[462px] gap-[18px]">
            {/* Logo - aligned with tagline */}
            <div className="w-full xl:w-[414px] flex justify-center xl:justify-start">
              <Link href="/" aria-label="خانه">
                <img
                  src="/brand/logo-new.png"
                  alt="Silent Shift"
                  width={1254}
                  height={1254}
                  className="w-[91px] h-[67.7px] object-contain"
                />
              </Link>
            </div>

            {/* Tagline */}
            <h2 className="text-center xl:text-right w-full text-[20px] leading-[32px] text-white font-normal font-[IRANYekanXFaNum]">
              مکثی برای شروعی دوباره.
            </h2>

            {/* Newsletter */}
            <div className="flex flex-col items-center xl:items-start w-full gap-4">
              <p className="text-center xl:text-right w-full text-[16px] leading-[28px] text-[#A1A1AA] font-[IRANYekanXFaNum]">
                عضویت در خبرنامه ما
              </p>

              <div className="flex flex-col xl:flex-row-reverse items-stretch xl:items-center w-full gap-[14px]">
                <div className="flex-1 h-9 bg-white/15 rounded-sm px-4 flex items-center justify-end">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmail("")}
                    placeholder="آدرس ایمیل"
                    aria-label="ایمیل"
                    {...inputA11y}
                    className="w-full bg-transparent border-none outline-none focus-visible:outline-none text-[#A1A1AA] text-[16px] leading-[28px] text-right font-[IRANYekanXFaNum]"
                  />
                </div>

                <button
                  type="submit"
                  onClick={submit}
                  disabled={status === "loading"}
                  className="mx-auto w-[160px] xl:mx-0 xl:w-[100px] h-9 shrink-0 border border-[#C9A84C] rounded-[2px] bg-transparent px-3 py-2 text-[#C9A84C] text-[14px] leading-[20px] font-normal font-[IRANYekanXFaNum] cursor-pointer transition-colors duration-150 hover:bg-[#C9A84C] hover:text-black disabled:opacity-50"
                >
                  {status === "loading" ? "..." : "عضویت"}
                </button>
              </div>

              {msg && (
                <p id={messageId} role="status" className={`text-[14px] text-right ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
                  {msg}
                </p>
              )}
            </div>
          </div>

          {/* Divider - desktop only (Figma: gradient white 10% -> 80% -> 10%) */}
          <div
            aria-hidden
            className="hidden xl:block w-px h-[217px] shrink-0"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)' }}
          />

          {/* Mobile divider */}
          <div className="xl:hidden w-full flex justify-center py-2">
            <span
              aria-hidden
              className="block w-[80%] h-px"
              style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)' }}
            />
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col items-center justify-between w-full xl:w-[71px] h-auto xl:h-[217px] gap-6 xl:gap-0">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-center text-[16px] leading-[28px] text-white font-[IRANYekanXFaNum]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Divider - desktop only (Figma: gradient white 10% -> 80% -> 10%) */}
          <div
            aria-hidden
            className="hidden xl:block w-px h-[217px] shrink-0"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)' }}
          />

          {/* Mobile divider */}
          <div className="xl:hidden w-full flex justify-center py-2">
            <span
              aria-hidden
              className="block w-[80%] h-px"
              style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)' }}
            />
          </div>

          {/* Social Icons */}
          <div className="flex flex-row xl:flex-col items-center justify-center xl:justify-between w-full xl:w-[173px] h-auto xl:h-[217px] gap-[19px] xl:gap-0 -mt-6 mb-2 xl:mt-0 xl:mb-0">
            {SOCIALS.map(({ href, label, icon: Icon, size }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group relative flex items-center justify-center w-[40px] h-[40px] bg-[rgba(245,245,245,0.15)] rounded-full transition-colors overflow-visible"
              >
                <Icon size={size} className="shrink-0 text-[#A1A1AA] transition-colors group-hover:text-white" />
                <span
                  dir="ltr"
                  className="hidden xl:block absolute pl-3 left-full whitespace-nowrap text-[16px] leading-7 text-white opacity-0 translate-x-1 transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0"
                >
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="w-full flex justify-center py-6">
          <span
            aria-hidden
            className="block w-full h-px"
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)" }}
          />
        </div>

        {/* Copyright */}
        <p className="text-center w-full text-[14px] leading-[20px] text-[#52525B] font-[IRANYekanXFaNum]">
          تمامی حقوق برای Silent Shift محفوظ است. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
