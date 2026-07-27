import type { Faq } from "@/lib/types";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Button } from "@/components/ui/Button";

type Props = {
  faqs: Faq[];
};

/**
 * Contact card + FAQ accordion.
 * DESKTOP: two columns (accordion right, contact card left).
 * MOBILE: single column — contact card with accordion nested inside.
 */
export default function FaqSection({ faqs }: Props) {
  const ContactCard = (
    <div className="relative bg-surface rounded-lg p-6 md:px-6 md:py-9 flex flex-col gap-8 overflow-hidden">
      {/* Decorative glow */}
      <span
        className="absolute -left-[200px] -top-[200px] w-[500px] h-[500px] rounded-full glow-large pointer-events-none"
        style={{ background: "rgba(255,255,255,0.1)" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center md:items-start gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/design/profile.webp"
          alt=""
          className="w-[150px] h-[150px] object-contain object-bottom"
        />
        <div className="flex flex-col gap-3 text-right w-full">
          <h3 className="text-d-h4 text-text-primary">رزرو یک تماس ۳۰ دقیقه‌ای</h3>
          <p className="text-d-body-md text-text-secondary">
            یک گپ دوستانه برای آشنایی بیشتر با هم و بررسی این‌که چطور می‌توانم همراهت باشم.
          </p>
        </div>
        <Button href="/contact" variant="default" size="lg" fullWidth>
          رزرو جلسه رایگان
        </Button>

        {/* Mobile only: accordion nested inside */}
        <div className="md:hidden w-full pt-4">
          <FaqAccordion items={faqs} variant="mobile" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full">
      {/* DESKTOP: 2 columns */}
      <div className="hidden md:flex flex-row-reverse gap-12 items-start">
        <div className="flex-1 flex flex-col gap-8">
          <h2 className="text-d-h2 text-text-primary text-right">سوالات پرتکرار</h2>
          {ContactCard}
        </div>
        <div className="w-[668px]">
          <FaqAccordion items={faqs} variant="desktop" />
        </div>
      </div>

      {/* MOBILE: title + card */}
      <div className="md:hidden flex flex-col gap-8">
        <h2 className="text-m-h2 text-text-primary text-right">سوالات پرتکرار</h2>
        {ContactCard}
      </div>
    </section>
  );
}
