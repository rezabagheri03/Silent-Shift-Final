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
      className={`group relative h-[229px] overflow-hidden p-4
        bg-surface border border-border-medium rounded-sm
        transition-all duration-200
        hover:border-[#E5C15D] hover:shadow-[0_0_20px_rgba(229,193,93,0.25)]
        ${className}`}
    >
      {/* Text block — centered at rest, slides UP on hover */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 transition-transform duration-200 group-hover:-translate-y-7">
        {icon && <div className="text-text-secondary mb-1">{icon}</div>}
        <h3 className="text-[24px] font-semibold leading-8 text-text-secondary text-center transition-colors group-hover:text-[#F5F5F5]">
          {title}
        </h3>
        <p className="text-[14px] leading-5 text-text-tertiary text-right transition-colors group-hover:text-text-secondary">
          {description}
        </p>
      </div>

      {/* CTA — hidden below, slides up into view under the text */}
      <a
        href={ctaHref}
        tabIndex={-1}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-20 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 flex h-9 w-[183px] max-w-full items-center justify-center rounded-[2px] bg-[#C9A84C] px-3 text-center text-[14px] font-normal leading-5 text-black"
      >
        رزرو جلسه رایگان
      </a>
    </div>
  );
}
