"use client";

import { useState } from "react";

export default function UploadField({
  label,
  kind,
  value,
  onChange,
}: {
  label: string;
  kind: "cover" | "audio";
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "خطا در آپلود");
      onChange(data.data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="block">
      <span className="text-d-body-sm text-text-secondary mb-1.5 block">{label}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL یا آپلود فایل"
          className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary outline-none focus:border-brand transition-colors"
          dir="ltr"
        />
        <label className="bg-surface border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary hover:border-brand hover:text-brand cursor-pointer whitespace-nowrap transition-colors">
          {uploading ? "در حال آپلود…" : "آپلود"}
          <input
            type="file"
            accept={kind === "cover" ? "image/*" : "audio/*"}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      </div>
      {value && (
        <p className="text-d-body-sm text-emerald-400 mt-1" dir="ltr">
          ✓ {value.split("/").pop()}
        </p>
      )}
      {error && <p className="text-d-body-sm text-red-400 mt-1">{error}</p>}
    </label>
  );
}
