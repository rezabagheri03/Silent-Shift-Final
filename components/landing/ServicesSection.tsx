import { ServiceCard } from "@/components/ui/ServiceCard";
import { LightbulbIcon, CompassIcon, TargetIcon } from "@/components/ui/Icons";

const MOBILE_SERVICE = { mobileTitle: "", mobileBullets: [] };

const SERVICES = [
  {
    icon: <LightbulbIcon />,
    title: "Mentoring",
    text: "جلسات گفتگوی عمیق و یک‌به‌یک برای گره‌گشایی ذهنی، شفاف‌سازی در تصمیم‌گیری‌های کلان و پیدا کردن نقطه مکث.",
    bullets: [
      "بررسی چالش‌های موردی (Case-based)",
      "ارتباط و تحلیل مستقیم",
    ],
  },
  {
    icon: <CompassIcon />,
    title: "Business & Career Coaching",
    text: "طراحی مسیر حرفه‌ای، توسعه مهارت‌های رهبری و غلبه بر موانع راه‌اندازی یا رشد کسب‌وکار برای ایرانیان خارج از کشور.",
    bullets: [
      "تدوین استراتژی شخصی و شغلی",
      "ویژه متخصصان و کارآفرینان",
    ],
  },
  {
    icon: <TargetIcon />,
    title: "Life Coaching",
    text: "همراهی برای عبور از چالش‌های روانی مهاجرت، رهایی از کمال‌گرایی و ساختن هویتی منسجم در یک محیط جدید.",
    bullets: [
      "تمرکز بر پذیرش و تغییرات آرام",
      "پکیج‌های ۴ الی ۸ جلسه‌ای",
    ],
  },
];

export default function ServicesSection() {
  return (
    <section className="w-full flex flex-col gap-12">
      <h2 className="text-m-h2 md:text-d-h2 text-text-primary text-center">
        مسیرهای همراهی
      </h2>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        dir="ltr"
      >
        {SERVICES.map((s) => (
          <div key={s.title} dir="rtl">
            <ServiceCard {...s} {...MOBILE_SERVICE} />
          </div>
        ))}
      </div>
    </section>
  );
}