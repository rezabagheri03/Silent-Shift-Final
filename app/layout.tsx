import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/components/player/PlayerContext";
import Player from "@/components/player/Player";
import { DEFAULT_OG, SITE_URL, socialUrl } from "@/lib/seo";

const SITE = SITE_URL;

/** Profiles that actually exist; placeholders are dropped rather than asserted. */
const SAME_AS = [
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_TELEGRAM_URL,
  process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL,
  process.env.NEXT_PUBLIC_CASTBOX_URL,
]
  .map(socialUrl)
  .filter((url): url is string => Boolean(url));

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
  verification: { google: "1Qb9rKnqguxe1DO2ETDQPHYymRNDVo4wBOddV46uLbY" },
  icons: {
    icon: [
      { url: "/icons/icon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
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
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/favicon-512.png`,
        width: 512,
        height: 512,
      },
      founder: { "@id": `${SITE}/#person` },
      ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name: "برزو ذاکری",
      url: `${SITE}/about`,
      image: `${SITE}/brand/barzo.jpg`,
      jobTitle: "کوچ و منتور",
      description:
        "کوچ و منتور ایرانیان خارج از کشور در توسعه فردی، مسیر شغلی و رشد کسب‌وکار.",
      knowsAbout: ["توسعه فردی", "کوچینگ حرفه‌ای", "منتورینگ", "کارآفرینی", "مهاجرت"],
      worksFor: { "@id": `${SITE}/#org` },
      ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Silent Shift",
      alternateName: "سایلنت شیفت",
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE}/#org` },
    },
  ],
}).replace(/</g, "\\u003c");

const CLARITY_SNIPPET = `(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "z4tqh7nhgj");`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl">
      <head>
        {/* Microsoft Clarity loader — must live in <head>; CSP allows clarity.ms (middleware.ts) */}
        <script dangerouslySetInnerHTML={{ __html: CLARITY_SNIPPET }} />
      </head>
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
