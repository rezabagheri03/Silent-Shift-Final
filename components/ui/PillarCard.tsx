import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

/**
 * Value-pillar card used on the About page.
 * Simple surface card, hover: gold border + subtle lift.
 */
export function PillarCard({ title, description, icon, className = "" }: Props) {
  return (
    <div className={`h-[229px] bg-surface border border-border rounded-lg p-6 flex flex-col justify-center gap-3 text-right hover:border-brand hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
      {icon && <div className="text-brand mb-1">{icon}</div>}
      <h3 className="text-d-h5 text-text-primary">{title}</h3>
      <p className="text-d-body-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
