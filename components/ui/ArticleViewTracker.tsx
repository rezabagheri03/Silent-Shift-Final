"use client";

import { useEffect } from "react";

export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `ss-view:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/articles/${encodeURIComponent(slug)}?track=1`, { cache: "no-store" }).catch(() => {
      sessionStorage.removeItem(key);
    });
  }, [slug]);
  return null;
}
