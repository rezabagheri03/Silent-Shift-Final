import Link from "next/link";
import type { Tag } from "@/lib/types";

type Kind = "podcasts" | "articles";

export function TagPill({
  tag,
  href,
  filterKind,
  muted = false,
}: {
  tag: Tag;
  href?: string;
  filterKind?: Kind;
  muted?: boolean;
}) {
  const cls = muted
    ? "bg-overlay-chip text-text-secondary hover:text-text-primary"
    : "bg-brand/15 text-brand hover:bg-brand/25";
  const body = (
    <span
      className={`inline-block rounded-full px-3 py-1 text-d-body-sm transition-colors ${cls}`}
    >
      {tag.name}
    </span>
  );
  const linkHref = href ?? (filterKind ? `/${filterKind}?tag=${encodeURIComponent(tag.slug)}` : undefined);
  if (linkHref) return <Link href={linkHref}>{body}</Link>;
  return body;
}

export function TagList({
  tags,
  filterKind,
  className = "",
}: {
  tags: Tag[];
  filterKind?: Kind;
  className?: string;
}) {
  if (!tags?.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((t) => (
        <TagPill key={t.id} tag={t} filterKind={filterKind} />
      ))}
    </div>
  );
}
