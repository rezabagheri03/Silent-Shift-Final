import fs from "node:fs";
import path from "node:path";
import { listPodcasts } from "@/lib/repos/podcasts";
import { SITE_URL, absoluteUrl, toIso } from "@/lib/seo";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plain(value: string | null | undefined): string {
  return (value || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>#]+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function audioType(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "m4a" || ext === "aac") return "audio/mp4";
  if (ext === "ogg" || ext === "opus") return "audio/ogg";
  if (ext === "wav") return "audio/wav";
  return "audio/mpeg";
}

/** Byte size for locally hosted audio; 0 for remote files (unknown without a HEAD request). */
function audioLength(url: string): number {
  if (!url.startsWith("/")) return 0;
  const publicDir = path.resolve(process.cwd(), "public");
  const full = path.resolve(publicDir, url.replace(/^\/+/, ""));
  if (!full.startsWith(publicDir + path.sep)) return 0;
  try {
    return fs.statSync(full).size;
  } catch {
    return 0;
  }
}

function rfc822(value: string | null | undefined): string {
  const iso = toIso(value);
  const date = iso ? new Date(iso) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function itunesDuration(totalSeconds: number): string | undefined {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return undefined;
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function ownerEmail(): string | undefined {
  const explicit = process.env.PODCAST_OWNER_EMAIL?.trim();
  if (explicit) return explicit;
  const smtp = process.env.SMTP_FROM?.trim();
  if (!smtp) return undefined;
  const match = smtp.match(/<([^>]+)>/);
  return match ? match[1] : smtp.includes("@") ? smtp : undefined;
}

export function GET() {
  const episodes = listPodcasts({ limit: 500 }).items;
  const cover = `${SITE_URL}/og/podcast-cover-3000.png`;
  const description =
    "پادکست‌ها، روایت‌ها و همراهی برزو ذاکری برای بازنگری در باورها و شروعی تازه.";
  const email = ownerEmail();

  const items = episodes
    .map((episode) => {
      const link = `${SITE_URL}/podcasts/${episode.slug}`;
      const summary = escapeXml(plain(episode.summary || episode.description) || episode.title);
      const duration = itunesDuration(episode.duration_seconds);
      const enclosure = episode.audio_url
        ? `\n      <enclosure url="${escapeXml(absoluteUrl(episode.audio_url))}" length="${audioLength(episode.audio_url)}" type="${audioType(episode.audio_url)}" />`
        : "";
      return `    <item>
      <title>${escapeXml(episode.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${summary}</description>
      <pubDate>${rfc822(episode.published_at)}</pubDate>${enclosure}
      <itunes:summary>${summary}</itunes:summary>
      <itunes:image href="${escapeXml(cover)}" />
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>${
        episode.episode_number ? `\n      <itunes:episode>${episode.episode_number}</itunes:episode>` : ""
      }${duration ? `\n      <itunes:duration>${duration}</itunes:duration>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Silent Shift</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>fa-ir</language>
    <copyright>© ${new Date().getFullYear()} Silent Shift</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${escapeXml(cover)}</url>
      <title>Silent Shift</title>
      <link>${SITE_URL}</link>
    </image>
    <itunes:author>برزو ذاکری</itunes:author>
    <itunes:summary>${escapeXml(description)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${escapeXml(cover)}" />
    <itunes:category text="Education">
      <itunes:category text="Self-Improvement" />
    </itunes:category>${
      email
        ? `\n    <itunes:owner>
      <itunes:name>Silent Shift</itunes:name>
      <itunes:email>${escapeXml(email)}</itunes:email>
    </itunes:owner>`
        : ""
    }
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
