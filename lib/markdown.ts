/**
 * Minimal, safe markdown → HTML converter.
 *
 * - Escapes all HTML first (no raw HTML pass-through — XSS-safe)
 * - Supports: # ## ### headings, **bold**, *italic*, `code`, links [text](url),
 *   ordered + unordered lists, > blockquote, --- hr, paragraph breaks
 * - RTL-friendly: doesn't reorder any characters or bytes
 *
 * We roll our own instead of adding a dependency because our needs are small
 * and this keeps the bundle lean.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape a string so it can't break out of a double-quoted HTML attribute.
 * Applied as defence-in-depth AFTER the global escapeHtml on the raw input.
 */
function escapeAttrValue(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Validate and sanitise a link href.
 * Only allows: http(s), mailto, tel, relative paths (/…), and fragments (#…).
 * Returns "#" for anything else.
 */
function safeHref(raw: string): string {
  const trimmed = raw.trim();
  // Relative paths and fragments
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  // Absolute URIs — parse and check protocol
  try {
    const url = new URL(trimmed);
    if (/^https?$/i.test(url.protocol)) return trimmed;
    if (url.protocol === "mailto:" || url.protocol === "tel:") return trimmed;
  } catch {
    // Not a valid URL at all → reject
  }
  return "#";
}

function inline(s: string): string {
  return s
    // inline code first (so ** inside `` doesn't get parsed)
    .replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>')
    // bold
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    // italic (avoid matching ** already handled)
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
    // links [text](url) — validate scheme, then escape for attribute context
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text: string, href: string) => {
      const safe = safeHref(href);
      const external = /^https?:\/\//i.test(safe);
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="md-link" href="${escapeAttrValue(safe)}"${rel}>${text}</a>`;
    });
}

export function markdownToHtml(input: string): string {
  if (!input) return "";

  const src = escapeHtml(input.replace(/\r\n/g, "\n"));
  const lines = src.split("\n");

  const out: string[] = [];
  let i = 0;
  let listType: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let paraBuffer: string[] = [];

  const flushPara = () => {
    if (paraBuffer.length) {
      out.push(`<p>${inline(paraBuffer.join(" "))}</p>`);
      paraBuffer = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }
  };
  const closeAll = () => {
    flushPara();
    closeList();
    closeBlockquote();
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Empty line → paragraph break
    if (line.trim() === "") {
      closeAll();
      i++;
      continue;
    }

    // Standalone image
    const image = line.match(/^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      closeAll();
      let src = "";
      const rawSrc = image[2].trim();
      // Only allow absolute URLs (http/https) or relative paths
      if (/^https?:\/\//i.test(rawSrc)) {
        try { new URL(rawSrc); src = rawSrc; } catch { /* reject */ }
      } else if (rawSrc.startsWith("/")) {
        src = rawSrc;
      }
      if (src) out.push(`<figure class="md-figure"><img src="${escapeAttrValue(src)}" alt="${image[1]}" loading="lazy" /></figure>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*---+\s*$/.test(line)) {
      closeAll();
      out.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // Heading
    const h = line.match(/^\s*(#{1,3})\s+(.+)$/);
    if (h) {
      closeAll();
      const level = h[1].length + 1; // # -> h2, ## -> h3, ### -> h4
      const tag = `h${Math.min(level, 4)}`;
      out.push(`<${tag} class="md-h${level}">${inline(h[2])}</${tag}>`);
      i++;
      continue;
    }

    // Blockquote (note: > was HTML-escaped to &gt; earlier)
    const bq = line.match(/^\s*(?:&gt;|>)\s?(.*)$/);
    if (bq) {
      flushPara();
      closeList();
      if (!inBlockquote) {
        out.push('<blockquote class="md-blockquote">');
        inBlockquote = true;
      }
      out.push(`<p>${inline(bq[1])}</p>`);
      i++;
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // Ordered list
    const ol = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ol) {
      flushPara();
      if (listType && listType !== "ol") closeList();
      if (!listType) {
        out.push('<ol class="md-ol">');
        listType = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      i++;
      continue;
    }

    // Unordered list
    const ul = line.match(/^\s*[-*+]\s+(.+)$/);
    if (ul) {
      flushPara();
      if (listType && listType !== "ul") closeList();
      if (!listType) {
        out.push('<ul class="md-ul">');
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    } else if (listType) {
      closeList();
    }

    // Paragraph line (accumulate)
    paraBuffer.push(line);
    i++;
  }

  closeAll();
  return out.join("\n");
}
