import { Button } from "@/components/ui/Button";
import { designAssets } from "@/lib/design-assets";

type Props = {
  bio: string;
};

/**
 * "سلام، من برزو هستم" — About Me section with photo + decorative glow.
 */
export default function AboutSection({ bio }: Props) {
  return (
    <section className="w-full flex flex-col gap-12 items-center">
      <h2 className="text-m-h1 xl:text-d-h1 text-text-primary text-center">
        سلام، من <span className="text-brand">برزو</span> هستم
      </h2>

      {/* DESKTOP: text right, photo left */}
      <div className="hidden xl:flex flex-row-reverse gap-[112px] items-center w-full">
        <div className="flex-1 text-d-body-lg text-text-secondary text-right leading-relaxed space-y-4">
          <p>Silent Shift از یک باور ساده شکل گرفت: بسیاری از مهم‌ترین تغییرات زندگی، نه در لحظه‌های بزرگ و پرهیاهو، بلکه در سکوت و در دل تصمیم‌های کوچک و پیوسته اتفاق می‌افتند. به همین دلیل، اینجا خبری از وعده‌های یک‌شبه، فرمول‌های جادویی یا مسیرهای میان‌بر نیست.</p>
          <p>سال‌ها فعالیت در حوزه کوچینگ، منتورینگ و مشاوره کسب‌وکار به من نشان داده که رشد واقعی زمانی اتفاق می‌افتد که با آگاهی، صبر و استمرار همراه باشد. هدف من از ساخت Silent Shift ایجاد فضایی برای گفت‌وگو، یادگیری و تامل است؛ جایی که بتوانیم درباره توسعه فردی، زندگی حرفه‌ای و مسیر ساختن یک زندگی معنادار بیشتر فکر کنیم. اگر به دنبال تغییراتی آرام، عمیق و ماندگار هستید، خوشحالم که در این مسیر همراه شما باشم.</p>
        </div>
        <div className="relative w-[402px] h-[399px] shrink-0 grid place-items-center">
          {/* Decorative blur circle behind photo */}
          <span
            className="absolute w-[321px] h-[321px] rounded-full glow-soft"
            style={{ background: "rgba(255,255,255,0.3)" }}
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={designAssets.profile}
            alt="برزو ذاکری"
            className="relative w-full h-full object-cover object-bottom"
          />
        </div>
      </div>

      {/* MOBILE: photo, then text */}
      <div className="xl:hidden flex flex-col gap-8 items-center w-full">
        <div className="relative w-full max-w-[364px] aspect-square grid place-items-center">
          <span
            className="absolute w-[290px] h-[290px] rounded-full glow-soft"
            style={{ background: "rgba(255,255,255,0.3)" }}
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={designAssets.profile}
            alt="برزو ذاکری"
            className="relative w-full h-full object-cover object-bottom"
          />
        </div>
        <p className="text-m-body-lg text-text-secondary text-right w-full leading-relaxed">
          Silent Shift از یک باور ساده شکل گرفت: بسیاری از مهم‌ترین تغییرات زندگی، نه در لحظه‌های بزرگ و پرهیاهو، بلکه در سکوت و در دل تصمیم‌های کوچک و پیوسته اتفاق می‌افتند. به همین دلیل، اینجا خبری از وعده‌های یک‌شبه، فرمول‌های جادویی یا مسیرهای میان‌بر نیست.
        </p>
        <p className="text-m-body-lg text-text-secondary text-right w-full leading-relaxed">
          سال‌ها فعالیت در حوزه کوچینگ، منتورینگ و مشاوره کسب‌وکار به من نشان داده که رشد واقعی زمانی اتفاق می‌افتد که با آگاهی، صبر و استمرار همراه باشد. هدف من از ساخت Silent Shift ایجاد فضایی برای گفت‌وگو، یادگیری و تامل است؛ جایی که بتوانیم درباره توسعه فردی، زندگی حرفه‌ای و مسیر ساختن یک زندگی معنادار بیشتر فکر کنیم. اگر به دنبال تغییراتی آرام، عمیق و ماندگار هستید، خوشحالم که در این مسیر همراه شما باشم.
        </p>
      </div>

      <Button href="/about" variant="outline" size="md" fullWidth className="xl:!w-auto underline-offset-4">
        من رو بیشتر بشناس
      </Button>
    </section>
  );
}
