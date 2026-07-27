"use client";

import { useState } from "react";

export function BackupButton() {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("خطا در دریافت پشتیبان");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const iso = new Date().toISOString().split("T")[0];
      a.download = `silent-shift-backup-${iso}.db`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={busy}
      className="text-text-secondary hover:text-brand transition-colors disabled:opacity-50"
    >
      {busy ? "…" : "پشتیبان‌گیری ⬇"}
    </button>
  );
}
