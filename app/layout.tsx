import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/components/player/PlayerContext";
import Player from "@/components/player/Player";
import { DEFAULT_OG, SITE_URL } from "@/lib/seo";

const SITE = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Silent Shift — مکثی برای شروعی دوباره",
    template: "%s | Silent Shift",
  },
  description:
    "پادکست‌ها، روایت‌ها و همراهی برزو ذاکری برای بازنگری در باورها و شروعی تازه.",
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
  openGraph: {
    title: "Silent Shift",
    description: "مکثی برای شروعی دوباره.",
    locale: "fa_IR",
    type: "website",
    siteName: "Silent Shift",
    url: "/",
    images: [DEFAULT_OG],
  },
  twitter: {
    card: "summary_large_image",
    title: "Silent Shift",
    description: "مکثی برای شروعی دوباره.",
    images: [DEFAULT_OG.url],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

const siteGraph = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "Silent Shift",
      alternateName: "سایلنت شیفت",
      description: "پادکست‌ها، روایت‌ها و همراهی برزو ذاکری برای بازنگری در باورها و شروعی تازه.",
      url: SITE,
      logo: `${SITE}/icons/icon-512.png`,
      founder: { "@id": `${SITE}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name: "برزو ذاکری",
      url: `${SITE}/about`,
      image: `${SITE}/brand/barzo.jpg`,
      worksFor: { "@id": `${SITE}/#org` },
    },
    {
      "@type": "WebSite",
      url: SITE,
      name: "Silent Shift",
      alternateName: "سایلنت شیفت",
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE}/#org` },
    },
  ],
}).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl">
      <body className="bg-bg text-text-primary">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:bg-brand focus:text-brand-on focus:px-3 focus:py-1 focus:rounded"
        >
          پرش به محتوای اصلی
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteGraph }} />
        <PlayerProvider>
          <div>{children}</div>
          <Player />
        </PlayerProvider>
      </body>
    </html>
  );
}
