import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  text: string;
  bullets: string[];
  mobileTitle?: string;
  mobileBullets?: string[];
  ctaHref?: string;
  className?: string;
};

export function ServiceCard({
  icon,
  title,
  text,
  bullets,
  mobileTitle,
  mobileBullets,
  ctaHref = "https://t.me/+g_XSWnv44WI4NmI0",
  className = "",
}: Props) {
  return (
    <article
      className={`group relative flex flex-col items-center gap-4 overflow-hidden p-4 md:max-h-[229px] md:hover:max-h-[380px]
        bg-surface border border-border-medium rounded-sm
        transition-all duration-200
        hover:border-[#E5C15D] hover:shadow-[0_0_20px_rgba(229,193,93,0.25)]
        ${className}`}
    >
      <div className="flex justify-center text-text-secondary group-hover:text-[#F5F5F5] transition-colors">
        {icon}
      </div>

      <h3 className="md:hidden text-d-h4 text-text-primary text-center">
        {mobileTitle || title}
      </h3>
      <h3 className="hidden md:block text-d-h4 text-text-primary text-center group-hover:text-[#F5F5F5] transition-colors">
        {title}
      </h3>

      <p className="text-d-body-sm text-text-tertiary text-center leading-relaxed w-full group-hover:text-text-secondary transition-colors">
        {text}
      </p>

      <ul className="md:hidden w-full text-d-body-sm text-text-tertiary space-y-1 text-right list-disc pr-4 group-hover:text-text-secondary transition-colors">
        {(mobileBullets || bullets).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <ul className="hidden md:block w-full text-d-body-sm text-text-tertiary space-y-1 text-right list-disc pr-4 group-hover:text-text-secondary transition-colors">
        {bullets.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {/* Small Button — rises from the bottom on hover (Figma: 183×36, #C9A84C, radius 2) */}
      <div
        aria-hidden={!ctaHref}
        className="w-full max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-[60px] group-hover:opacity-100"
      >
        <a
          href={ctaHref}
          tabIndex={-1}
          className="mx-auto mt-6 flex h-9 w-[183px] max-w-full translate-y-3 items-center justify-center rounded-[2px] bg-[#C9A84C] px-3 text-center text-[14px] font-normal leading-5 text-black transition-transform duration-200 group-hover:translate-y-0"
        >
          هماهنگی گفتگوی اختصاصی
        </a>
      </div>
    </article>
  );
}