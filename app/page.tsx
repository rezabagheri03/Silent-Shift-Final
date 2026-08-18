import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import PodcastSection from "@/components/landing/PodcastSection";
import ServicesSection from "@/components/landing/ServicesSection";
import AboutSection from "@/components/landing/AboutSection";
import ArticlesSection from "@/components/landing/ArticlesSection";
import { DesignNewsletter } from "@/components/sections/DesignNewsletter";
import { DesignFaqSection } from "@/components/sections/DesignFaqSection";

import { getLatestPodcast } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { listFaqs } from "@/lib/repos/faqs";
import { getAllContent } from "@/lib/repos/content";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const latest = getLatestPodcast();
  const articles = listArticles({ limit: 6 }).items;
  const faqs = listFaqs();
  const content = getAllContent();

  return (
    <>
      <Header />

      <main id="main" tabIndex={-1} className="outline-none">
      <div className="mx-auto max-w-page px-page-x-m md:px-12 xl:px-page-x-d">
        <div className="flex flex-col gap-section-m md:gap-8 xl:gap-section-d py-section-m xl:py-section-d">
          <Hero
            title={content.hero_title || "جایی برای مکث کردن"}
            highlight="مکث"
            subtitle={
              content.hero_subtitle ||
              "کوچینگ و منتورینگ اختصاصی برای ایرانیان خارج از کشور؛ مسیری آرام برای رشد شخصی و حرفه‌ای."
            }
            ctaLabel="هماهنگی گفتگوی اختصاصی"
            ctaHref="/contact"
            helper="یک گپ دوستانه برای آشنایی بیشتر داشته باشیم."
            imageSrc="/images/hero.jpg"
          />

          <PodcastSection latest={latest} />

          <ServicesSection />

          <AboutSection
            bio={
              content.about_short ||
              "سلام، من برزو ذاکری هستم. سال‌هاست همراه افراد و تیم‌ها بوده‌ام تا مسیرهای شخصی و شغلی‌شان را با پذیرش و تغییرات تدریجی شکل دهند."
            }
          />

          <DesignNewsletter
            description={
              content.newsletter_description ||
              "نامه‌های گاه‌به‌گاه با تازه‌ترین اپیزودها، روایت‌ها و منابع دست‌چین‌شده."
            }
          />

          <ArticlesSection articles={articles} />

          <DesignFaqSection faqs={faqs} />
        </div>
      </div>
      </main>

      <Footer />
    </>
  );
}