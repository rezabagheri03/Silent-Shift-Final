import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/components/player/PlayerContext";
import Player from "@/components/player/Player";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Silent Shift — مکثی برای شروعی دوباره",
    template: "%s | Silent Shift",
  },
  description:
    "پادکست‌ها، روایت‌ها و همراهی برزو ذاکری برای بازنگری در باورها و شروعی تازه.",
  openGraph: {
    title: "Silent Shift",
    description: "مکثی برای شروعی دوباره.",
    locale: "fa_IR",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/brand/logo-cropped.webp", type: "image/webp" },
    ],
    shortcut: ["/brand/logo-cropped.webp"],
    apple: [
      { url: "/brand/logo-cropped.webp" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-bg text-text-primary">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:bg-brand focus:text-brand-on focus:px-3 focus:py-1 focus:rounded"
        >
          پرش به محتوای اصلی
        </a>
        <PlayerProvider>
          <div id="main">{children}</div>
          <Player />
        </PlayerProvider>
      </body>
    </html>
  );
}
