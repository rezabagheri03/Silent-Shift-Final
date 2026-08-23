import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PillarCard } from "@/components/ui/PillarCard";
import { Timeline } from "@/components/ui/Timeline";
import { Button } from "@/components/ui/Button";
import { getAllContent } from "@/lib/repos/content";
import { listFaqs } from "@/lib/repos/faqs";
import { designAssets } from "@/lib/design-assets";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "داستان من", description: "درباره برزو ذاکری و چرایی ساختن Silent Shift.", alternates: { canonical: "/about" } };

const PILLARS = [
  { title: "شنیدن بدون قضاوت", description: "فضایی امن برای گفت‌وگو، بدون قضاوت؛ جایی که می‌توانی خودت باشی و مسیر را از نو ببینی." },
  { title: "تغییرات ارگانیک", description: "به‌جای فشار و راه‌حل‌های سریع، روی تغییرات آرام، پایدار و هم‌سو با ارزش‌های شخصی تمرکز می‌کنیم." },
  { title: "همراهی در تضادها", description: "در چالش‌های همزمان مهاجرت، هویت و کار همراهت هستم تا آرام‌آرام مسیر خودت را انتخاب کنی." },
];
const JOURNEY = [
  { year: "۱۳۹۵", title: "آغاز مسیر مشاوره و ورود به دنیای توسعه فردی", description: "یادگیری از انسان‌ها در بحران‌های حرفه‌ای و شخصی." },
  { year: "۱۴۰۰", title: "نقطه عطف بیزینس‌کوچینگ و تمرکز بر چالش‌های رشد", description: "همراهی با متخصصان و کارآفرینان برای بازطراحی مسیر شغلی." },
  { year: "۱۴۰۴", title: "تولد Silent Shift: خلق پلتفرمی برای مکث و تغییرات عمیق", description: "ساختن فضایی برای ایستادن، شنیدن و آغاز یک تغییر ماندگار." },
];

export default function AboutPage() {
  const content = getAllContent();
  const faqs = listFaqs();
  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "داستان من" }]} />

      <section className="grid gap-8 md:grid-cols-2 md:gap-8 items-center md:[direction:ltr]">
        <div className="order-1 text-right flex flex-col gap-5 [direction:rtl]">
          <h1 className="text-m-h1 md:text-d-h1 text-[#FFEFC4]">داستان من</h1>
          <p className="text-m-body-lg md:text-d-body-lg text-text-secondary leading-loose">
            من برزو هستم؛ کسی که در طول سال‌های گذشته، در کنار صدها نفر نشسته تا صدای تغییرات آرام درونشان را بشنود.
          </p>
        </div>
        {/* Figma: portrait photo 584x626, no backdrop */}
        <div className="order-2 relative flex justify-end overflow-hidden">
          <img
            src={designAssets.profile}
            alt="برزو ذاکری"
            className="w-full max-w-[584px] aspect-[584/626] object-cover"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[220px_1fr] md:gap-12 items-start">
        <h2 className="text-m-h2 md:text-d-h2 text-white text-right">تولد یک تغییر</h2>
        <p className="text-d-body-md md:text-d-body-lg text-text-secondary leading-loose whitespace-pre-line text-right">
          {content.about_long || "سال‌ها فعالیت در حوزه‌ی مشاوره کسب‌وکار و توسعه‌ی فردی به من نشان داد که بزرگ‌ترین گره‌های زندگی ما در شلوغی‌ها باز نمی‌شوند. Silent Shift از دل همین نیاز متولد شد: فضایی برای ایستادن، نگاه کردن به مسیر و پیدا کردن شجاعت برای قدم‌های بی‌صدا اما ماندگار."}
        </p>
      </section>

      {/* Figma 1:1098: 3 cards, 24px gap */}
      <section className="grid md:grid-cols-3" style={{ columnGap: 24 }}>{PILLARS.map((p) => <PillarCard key={p.title} {...p} />)}</section>

      {/* Figma Slogan: pale-gold quote + gold hairline rule, left-aligned block */}
      <blockquote className="flex max-w-4xl mx-auto flex-row items-center gap-[22px] py-8 md:py-14">
        <span aria-hidden className="h-full w-px self-stretch shrink-0 bg-[#C9A84C]" />
        <p className="text-m-h2 md:text-d-h2 text-right leading-relaxed text-[#FFEFC4]">
          برای پیدا کردن راه، نیازی به دویدن نیست؛ به سکوتی نیاز داریم تا بتوانیم صدای مسیر را بشنویم.
        </p>
      </blockquote>

      <section className="max-w-4xl w-full mx-auto py-4 md:py-10">
        <Timeline items={JOURNEY} />
      </section>

      <section className="flex flex-col items-center gap-5 text-center py-8">
        <h2 className="text-m-h2 md:text-d-h2 text-white">داستان شما از کدام نقطه نیاز به بازنویسی دارد؟</h2>
        <Button href="/contact" size="lg">رزرو جلسه معارفه رایگان</Button>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-m-h2 md:text-d-h2 text-white text-right">سوالات پرتکرار</h2>
        <FaqAccordion items={faqs} />
      </section>
    </PageShell>
  );
}
