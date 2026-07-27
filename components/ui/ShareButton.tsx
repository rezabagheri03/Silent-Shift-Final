"use client";

import { useState } from "react";
import { Button } from "./Button";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
        await (navigator as Navigator).share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* user cancelled or unsupported */
    }
  };

  return (
    <Button onClick={onShare} variant="outline" size="md">
      {copied ? "لینک کپی شد ✓" : "اشتراک‌گذاری"}
    </Button>
  );
}
