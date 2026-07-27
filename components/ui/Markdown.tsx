import { markdownToHtml } from "@/lib/markdown";

type Props = {
  content: string;
  className?: string;
};

/**
 * Server-rendered markdown output. Input is escaped before rendering
 * so raw HTML in the source is treated as text (safe by default).
 */
export function Markdown({ content, className = "" }: Props) {
  const html = markdownToHtml(content);
  return (
    <div
      className={`md-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
