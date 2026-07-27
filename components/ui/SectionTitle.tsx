import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  align?: "right" | "center" | "left";
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function SectionTitle({ children, align = "right", as = "h2", className = "" }: Props) {
  const Tag = as;
  const alignClass =
    align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right";
  const sizeClass =
    as === "h1"
      ? "text-m-h1 md:text-d-h1"
      : as === "h2"
      ? "text-m-h2 md:text-d-h2"
      : "text-m-h4 md:text-d-h3";
  return (
    <Tag className={`${sizeClass} text-text-primary ${alignClass} ${className}`}>
      {children}
    </Tag>
  );
}
