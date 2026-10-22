import test from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml } from "@/lib/markdown";
import { estimateReadingTime } from "@/lib/reading-time";
import { formatDuration, slugify, toAsciiDigits } from "@/lib/utils";
import { safeAdminRedirect } from "@/lib/security";
import { socialUrl } from "@/lib/seo";

test("socialUrl drops unset and placeholder profiles", () => {
  assert.equal(socialUrl(undefined), undefined);
  assert.equal(socialUrl(""), undefined);
  assert.equal(socialUrl("https://instagram.com/yourusername"), undefined);
  assert.equal(socialUrl("https://castbox.fm/channel/yourchannel"), undefined);
  assert.equal(socialUrl("https://podcasts.apple.com/yourpodcast"), undefined);
  assert.equal(socialUrl("not a url"), undefined);
  assert.equal(socialUrl("https://instagram.com/silentshift"), "https://instagram.com/silentshift");
});

 test("safeAdminRedirect only accepts internal admin paths", () => {
  assert.equal(safeAdminRedirect("/admin/articles"), "/admin/articles");
  assert.equal(safeAdminRedirect("https://example.com"), "/admin");
  assert.equal(safeAdminRedirect("//example.com"), "/admin");
  assert.equal(safeAdminRedirect("javascript:alert(1)"), "/admin");
});

test("markdown escapes HTML and rejects unsafe links", () => {
  const html = markdownToHtml('<script>alert(1)</script>\n\n[x](javascript:alert(1))');
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /href="javascript:/);
});

test("markdown renders safe standalone images", () => {
  const html = markdownToHtml("![توضیح](/uploads/covers/test.webp)");
  assert.match(html, /<img src="\/uploads\/covers\/test.webp" alt="توضیح"/);
});

test("utility formatting is deterministic", () => {
  assert.equal(formatDuration(3725), "1:02:05");
  assert.equal(toAsciiDigits("۱۲٣"), "123");
  assert.equal(slugify("  Hello World  "), "hello-world");
});

test("reading time is always at least one minute", () => {
  assert.equal(estimateReadingTime(""), 1);
  assert.equal(estimateReadingTime("یک متن کوتاه"), 1);
});
