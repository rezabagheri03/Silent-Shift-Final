import { Button } from "./Button";

type Props = {
  href?: string;
  variant?: "default" | "compact";
};

/**
 * "رزرو جلسه معارفه" card used on landing, about, contact, faq pages.
 * Consistent booking CTA across the site.
 */
export function BookingCard({ href = "/contact", variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4 text-center items-center">
        <CalendarIcon />
        <div className="flex flex-col gap-2">
          <h3 className="text-d-h5 text-text-primary">رزرو جلسه معارفه</h3>
          <p className="text-d-body-sm text-text-secondary max-w-xs">
            یک گفتگوی ۳۰ دقیقه‌ای رایگان برای بررسی مسیر شما.
          </p>
        </div>
        <Button href={href} variant="outline" size="md" fullWidth>
          هماهنگی گفتگوی اختصاصی
        </Button>
      </div>
    );
  }
  return (
    <div className="bg-surface border border-border rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
      <div className="flex flex-col gap-2 max-w-xl">
        <h3 className="text-d-h4 text-text-primary">داستان شما از کدام نقطه نیاز به بازنویسی دارد؟</h3>
        <p className="text-d-body-md text-text-secondary">
          یک گپ دوستانه ۳۰ دقیقه‌ای رایگان. با هم بررسی می‌کنیم چطور می‌توانم همراهت باشم.
        </p>
      </div>
      <Button href={href} variant="default" size="lg" className="shrink-0">
        رزرو جلسه معارفه رایگان
      </Button>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-brand" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
