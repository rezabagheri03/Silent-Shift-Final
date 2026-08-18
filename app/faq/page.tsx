import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { listFaqs } from "@/lib/repos/faqs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ سوالات پرتکرار درباره پادکست، جلسات کوچینگ و همراهی Silent Shift.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const faqs = listFaqs();
  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "سوالات متداول" }]} />
      <SectionTitle as="h1" align="right">سوالات پرتکرار</SectionTitle>
      <p className="text-d-body-lg text-text-secondary text-right max-w-2xl">
        اگر پاسخ سؤالتان اینجا نبود، از صفحه‌ی ارتباط پیام بدهید.
      </p>

      <div className="max-w-3xl w-full mr-auto md:mx-auto">
        <FaqAccordion items={faqs} />
      </div>

      <section className="bg-surface border border-border rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="text-d-h4 text-text-primary">هنوز جوابتون رو پیدا نکردید؟</h2>
          <p className="text-d-body-md text-text-secondary">
            پیام بدید — با کمال میل پاسخ‌گو هستم.
          </p>
        </div>
        <Button href="/contact" variant="outline" size="md" className="shrink-0">
          تماس با ما
        </Button>
      </section>
    </PageShell>
  );
}
