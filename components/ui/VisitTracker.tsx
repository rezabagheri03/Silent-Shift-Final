"use client";

import { useEffect } from "react";
import { recordSearchHistory } from "@/components/SearchPopover";

/**
 * Renders nothing — just records a page visit in the search history
 * for the search popover to surface later.
 */
export default function VisitTracker({
  kind,
  slug,
  title,
}: {
  kind: "podcast" | "article";
  slug: string;
  title: string;
}) {
  useEffect(() => {
    recordSearchHistory({ kind, slug, title });
  }, [kind, slug, title]);
  return null;
}