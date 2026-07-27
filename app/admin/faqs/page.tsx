"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type { Faq } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AdminCard } from "@/components/admin/AdminForm";

const inputClass =
  "w-full bg-bg border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary outline-none focus:border-brand transition-colors";

export default function AdminFaqs() {
  const [list, setList] = useState<Faq[]>([]);
  const [form, setForm] = useState({ question: "", answer: "", sort_order: 999 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: number; question: string; answer: string; sort_order: number } | null>(null);

  const reload = () => apiGet<Faq[]>("/api/faqs").then(setList);

  useEffect(() => {
    reload();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiPost("/api/admin/faqs", form);
      setForm({ question: "", answer: "", sort_order: 999 });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/admin/faqs/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editing.question,
          answer: editing.answer,
          sort_order: editing.sort_order,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "خطا");
      setEditing(null);
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "خطا");
    }
  };

  const del = async (id: number) => {
    if (!confirm("حذف این سوال؟")) return;
    await apiDelete(`/api/admin/faqs/${id}`);
    reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-d-h3 text-text-primary">سوالات پرتکرار</h1>

      <AdminCard>
        <form onSubmit={create} className="space-y-3">
          <label className="block">
            <span className="text-d-body-sm text-text-secondary mb-1.5 block">سوال</span>
            <input
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-d-body-sm text-text-secondary mb-1.5 block">پاسخ</span>
            <textarea
              required
              rows={3}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </label>
          <label className="block max-w-[200px]">
            <span className="text-d-body-sm text-text-secondary mb-1.5 block">ترتیب نمایش</span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className={inputClass}
              dir="ltr"
            />
          </label>
          {error && <p className="text-red-400 text-d-body-sm">{error}</p>}
          <Button type="submit" variant="default" size="md" loading={saving}>
            افزودن
          </Button>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {list.map((f) => (
          <AdminCard key={f.id}>
            {editing?.id === f.id ? (
              <div className="space-y-3">
                <input
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  className={inputClass}
                  placeholder="سوال"
                />
                <textarea
                  rows={3}
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="پاسخ"
                />
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className={`${inputClass} max-w-[200px]`}
                  dir="ltr"
                />
                <div className="flex gap-3">
                  <Button type="button" variant="default" size="md" onClick={saveEdit}>
                    ذخیره
                  </Button>
                  <Button type="button" variant="outline" size="md" onClick={() => setEditing(null)}>
                    لغو
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-d-body-md text-text-primary font-medium">{f.question}</h3>
                  <p className="text-d-body-sm text-text-secondary mt-2 whitespace-pre-line">
                    {f.answer}
                  </p>
                  <p className="text-d-body-sm text-text-tertiary mt-2" dir="ltr">
                    ترتیب: {f.sort_order}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(f)}
                    className="text-brand hover:text-brand-hover transition-colors text-d-body-sm"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => del(f.id)}
                    className="text-red-400 hover:text-red-300 transition-colors text-d-body-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            )}
          </AdminCard>
        ))}
        {list.length === 0 && (
          <p className="text-center text-text-tertiary py-8">هیچ سوالی ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}
