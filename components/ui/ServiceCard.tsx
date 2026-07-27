import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  text: string;
  bullets: string[];
  mobileTitle?: string;
  mobileBullets?: string[];
  className?: string;
};

export function ServiceCard({
  icon,
  title,
  text,
  bullets,
  mobileTitle,
  mobileBullets,
  className = "",
}: Props) {
  return (
    <article
      className={`group relative flex flex-col items-center gap-4 p-6 h-full
        bg-[#1a1a1a] border border-white/10 rounded-xl
        transition-all duration-200
        hover:border-brand hover:-translate-y-1
        hover:shadow-[0_8px_24px_rgba(212,175,55,0.12)]
        ${className}`}
    >
      <div className="flex justify-center text-text-secondary group-hover:text-brand transition-colors">
        {icon}
      </div>

      <h3 className="md:hidden text-d-h4 text-text-primary text-center">
        {mobileTitle || title}
      </h3>
      <h3 className="hidden md:block text-d-h4 text-text-primary text-center">
        {title}
      </h3>

      <p className="text-d-body-sm text-text-tertiary text-center leading-relaxed w-full">
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
    </article>
  );
}