"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
};

export function MenuItem({ href, label, onClick, className = "" }: Props) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-colors ${className}`}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={`text-d-body-md transition-colors ${
          isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        {label}
      </span>
      <span
        className={`w-1 h-1 rounded-full transition-opacity ${
          isActive ? "bg-brand opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}
