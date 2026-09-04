import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  ctaHref?: string;
  className?: string;
};

/**
 * Value-pillar card used on the About page.
 * Figma 1:1098 static specs; hover matches the landing ServiceCard:
 * card grows, gold border + glow, and a CTA button rises from the bottom.
 */
export function PillarCard({ title, description, icon, ctaHref = "/contact", className = "" }: Props) {
  return (
    <div
      className={`group relative overflow-hidden
        bg-surface border border-border-medium rounded-sm
        transition-all duration-200
        md:hover:border-[#E5C15D] md:hover:shadow-[0_0_20px_rgba(229,193,93,0.25)]
        min-h-[121px] p-4 md:h-[229px] md:min-h-0
        max-md:rounded-[4px]
        ${className}`}
    >
      {/* Text block — centered at rest, slides UP on hover (desktop only) */}
      <div className="flex flex-col items-center justify-center gap-4 p-4 transition-transform duration-200 md:absolute md:inset-0 md:group-hover:-translate-y-7">
        {icon && <div className="text-text-secondary mb-1">{icon}</div>}
        <h3 className="text-[20px] font-semibold leading-7 text-text-secondary text-center transition-colors md:text-[24px] md:leading-8 md:group-hover:text-[#F5F5F5]">
          {title}
        </h3>
        <p className="w-full text-[14px] leading-5 text-text-tertiary text-right transition-colors md:group-hover:text-text-secondary">
          {description}
        </p>
      </div>

      {/* CTA — desktop hover only; Figma mobile has no CTA */}
      <a
        href={ctaHref}
        tabIndex={-1}
        className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-20 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 h-9 w-[183px] max-w-full items-center justify-center rounded-[2px] bg-[#C9A84C] px-3 text-center text-[14px] font-normal leading-5 text-black"
      >
        رزرو جلسه رایگان
      </a>
    </div>
  );
}
