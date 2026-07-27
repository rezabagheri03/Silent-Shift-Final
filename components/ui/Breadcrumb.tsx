import Link from "next/link";

type Item = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <nav
      aria-label="مسیر صفحه"
      className="text-d-body-sm text-text-secondary text-right"
    >
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? (
            <Link href={it.href} className="hover:text-text-primary transition-colors">
              {it.label}
            </Link>
          ) : (
            <span className="text-text-primary">{it.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-1.5 text-text-tertiary">/</span>}
        </span>
      ))}
    </nav>
  );
}
