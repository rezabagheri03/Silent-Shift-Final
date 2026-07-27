"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { AdminCard } from "@/components/admin/AdminForm";

const KEYS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "hero_title", label: "عنوان هیرو" },
  { key: "hero_subtitle", label: "زیرعنوان هیرو" },
  { key: "about_short", label: "متن کوتاه درباره", multiline: true },
  { key: "about_long", label: "متن بلند درباره", multiline: true },
  { key: "newsletter_description", label: "توضیحات خبرنامه" },
];

const inputBase =
  "w-full bg-bg border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary outline-none focus:border-brand transition-colors";

export default function AdminContent() {
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Record<string, string>>("/api/admin/content").then(setData);
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await apiPut("/api/admin/content", data);
      setMsg("ذخیره شد ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-d-h3 text-text-primary mb-6">محتوای سایت</h1>
      <AdminCard>
        <div className="space-y-4">
          {KEYS.map((k) => (
            <label key={k.key} className="block">
              <span className="text-d-body-sm text-text-secondary mb-1.5 block">{k.label}</span>
              {k.multiline ? (
                <textarea
                  rows={5}
                  value={data[k.key] || ""}
                  onChange={(e) => setData({ ...data, [k.key]: e.target.value })}
                  className={`${inputBase} resize-none`}
                />
              ) : (
                <input
                  value={data[k.key] || ""}
                  onChange={(e) => setData({ ...data, [k.key]: e.target.value })}
                  className={inputBase}
                />
              )}
            </label>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={save} variant="default" size="md" loading={saving}>
              ذخیره
            </Button>
            {msg && (
              <span
                className={`text-d-body-sm ${
                  msg.includes("خطا") ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {msg}
              </span>
            )}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
