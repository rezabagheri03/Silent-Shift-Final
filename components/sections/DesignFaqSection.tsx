import type { Faq } from "@/lib/types";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { designAssets } from "@/lib/design-assets";

export function DesignFaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="design-section">
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[668px_1fr] xl:gap-12 xl:items-end xl:[direction:ltr]">
        <div className="flex flex-col gap-5 xl:order-2 [direction:rtl]">
          <h2 className="text-m-h2 xl:text-d-h2 text-text-primary text-right">سوالات پرتکرار</h2>
          <ContactCard>
            <div className="xl:hidden w-full border-t border-border pt-3">
              <FaqAccordion items={faqs} variant="mobile" idPrefix="faq-mobile" />
            </div>
          </ContactCard>
        </div>
        <div className="hidden xl:block xl:order-1 [direction:rtl]">
          <FaqAccordion items={faqs} variant="desktop" idPrefix="faq-desktop" />
        </div>
      </div>
    </section>
  );
}

function ContactCard({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/15 bg-transparent px-6 py-8 xl:px-8 xl:py-9 flex flex-col items-center gap-5 text-center">
      <span className="absolute -left-[405px] -top-[343.56px] w-[623px] h-[623px] rounded-full bg-white/10 blur-[110px]" aria-hidden />
      <img src={designAssets.profile} alt="تصویر برزو ذاکری" className="relative w-[132px] h-[132px] xl:w-[150px] xl:h-[150px] object-contain object-bottom" />
      <div className="relative flex flex-col gap-3 max-w-md">
        <h3 className="text-d-h4 text-text-primary">رزرو یک تماس ۳۰ دقیقه‌ای</h3>
        <p className="text-d-body-md text-text-secondary leading-relaxed">
          اگر سوالی دارید یا می‌خواهید ببینیم چطور می‌توانم همراهتان باشم، یک گفتگوی کوتاه و بدون تعهد رزرو کنید.
        </p>
      </div>
      <Button href="/contact" size="lg" fullWidth className="relative">
        رزرو جلسه رایگان
      </Button>
      {children}
    </div>
  );
}
