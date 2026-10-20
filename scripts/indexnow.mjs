// Submit sitemap URLs to IndexNow (Bing/Yandex/Seznam).
// The key file lives at public/<KEY>.txt and is served from the site root.
const KEY = "11cbc53a5fa2366b2af550d5bc1ef57d";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://silentshift.life").replace(/\/$/, "");

const sitemap = await fetch(`${SITE_URL}/sitemap.xml`).then((res) => {
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  return res.text();
});
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (urlList.length === 0) throw new Error("sitemap contains no URLs");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  }),
});
console.log(`IndexNow ${res.status} ${res.statusText} — ${urlList.length} URLs`);
if (!res.ok) process.exitCode = 1;
