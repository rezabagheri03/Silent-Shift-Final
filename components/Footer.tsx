"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api-client";
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
  },
  {
    href: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/8heshtaam",
    label: "Telegram",
    icon: TelegramIcon,
  },
  {
    href: process.env.NEXT_PUBLIC_CASTBOX_URL || "https://castbox.fm/",
    label: "Castbox",
    icon: CastboxIcon,
  },
  {
    href: process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL || "https://podcasts.apple.com/",
    label: "Apple Podcasts",
    icon: AnchorIcon,
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const data = await apiPost<{ message: string }>("/api/newsletter", { email });
      setMsg(data.message);
      setEmail("");
      setStatus("success");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "خطا در ثبت ایمیل");
      setStatus("error");
    }
  }

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
                  src="/brand/logo-cropped.png"
                  alt="Silent Shift"
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

              <div className="flex flex-col xl:flex-row-reverse items-stretch xl:items-center w-full gap-3">
                <div className="flex-1 h-[48px] bg-white/15 rounded px-4 flex items-center justify-end">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="آدرس ایمیل"
                    aria-label="ایمیل"
                    className="w-full bg-transparent border-none outline-none text-[#A1A1AA] text-[16px] leading-[28px] text-right font-[IRANYekanXFaNum]"
                  />
                </div>

                <button
                  type="submit"
                  onClick={submit}
                  disabled={status === "loading"}
                  className="w-full xl:w-[100px] h-[48px] border border-[#C9A84C] rounded bg-transparent text-[#C9A84C] text-[14px] leading-[20px] font-[IRANYekanXFaNum] cursor-pointer disabled:opacity-50"
                >
                  {status === "loading" ? "..." : "عضویت"}
                </button>
              </div>

              {msg && (
                <p className={`text-[14px] text-right ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
                  {msg}
                </p>
              )}
            </div>
          </div>

          {/* Divider - desktop only */}
          <div className="hidden xl:flex w-0 h-[217px]">
            <span className="w-[1px] h-full bg-[#262626]" />
          </div>

          {/* Mobile divider */}
          <div className="xl:hidden w-full flex justify-center py-2">
            <span className="w-[80%] h-[1px] bg-[#3F3F46]" />
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

          {/* Divider - desktop only */}
          <div className="hidden xl:flex w-0 h-[217px]">
            <span className="w-[1px] h-full bg-[#262626]" />
          </div>

          {/* Mobile divider */}
          <div className="xl:hidden w-full flex justify-center py-2">
            <span className="w-[80%] h-[1px] bg-[#3F3F46]" />
          </div>

          {/* Social Icons */}
          <div className="flex flex-row xl:flex-col items-center justify-center xl:justify-between w-full xl:w-[173px] h-auto xl:h-[217px] gap-4 xl:gap-0">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-[40px] h-[40px] p-2 bg-[rgba(245,245,245,0.15)] rounded-full"
              >
                <Icon size={24} className="text-[#A1A1AA]" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="w-full flex justify-center py-6">
          <span className="w-full h-[1px] bg-[#262626]" />
        </div>

        {/* Copyright */}
        <p className="text-center w-full text-[14px] leading-[20px] text-[#52525B] font-[IRANYekanXFaNum]">
          تمامی حقوق برای Silent Shift محفوظ است. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
