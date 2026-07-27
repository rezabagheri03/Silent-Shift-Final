"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AdminCard, AdminTable } from "@/components/admin/AdminForm";

const inputClass =
  "bg-bg border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary outline-none focus:border-brand transition-colors";

export default function AdminCategories() {
  const [list, setList] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string; slug: string } | null>(null);

  const reload = () => apiGet<Category[]>("/api/categories").then(setList);

  useEffect(() => {
    reload();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiPost("/api/admin/categories", form);
      setForm({ name: "", slug: "" });
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
      const res = await fetch(`/api/admin/categories/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, slug: editing.slug }),
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
    if (!confirm("حذف این دسته؟ پادکست‌ها و روایت‌های مرتبط به «بدون دسته» تغییر می‌کنند."))
      return;
    await apiDelete(`/api/admin/categories/${id}`);
    reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-d-h3 text-text-primary">دسته‌ها</h1>

      <AdminCard>
        <form onSubmit={create} className="flex flex-col md:flex-row gap-3 items-end">
          <label className="flex-1 flex flex-col gap-1.5">
            <span className="text-d-body-sm text-text-secondary">نام دسته</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex-1 flex flex-col gap-1.5">
            <span className="text-d-body-sm text-text-secondary">
              شناسه (اختیاری، انگلیسی)
            </span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
              dir="ltr"
              placeholder="my-category"
            />
          </label>
          <Button type="submit" variant="default" size="md" loading={saving}>
            افزودن
          </Button>
        </form>
        {error && <p className="text-red-400 text-d-body-sm mt-3">{error}</p>}
      </AdminCard>

      <AdminTable>
        <thead className="bg-bg text-right text-text-secondary">
          <tr>
            <th className="p-3 font-medium">نام</th>
            <th className="p-3 font-medium">شناسه</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="p-3 text-text-primary">
                {editing?.id === c.id ? (
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  c.name
                )}
              </td>
              <td className="p-3 text-text-tertiary" dir="ltr">
                {editing?.id === c.id ? (
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                  />
                ) : (
                  c.slug
                )}
              </td>
              <td className="p-3 text-left space-x-3 space-x-reverse">
                {editing?.id === c.id ? (
                  <>
                    <button onClick={saveEdit} className="text-brand hover:text-brand-hover transition-colors">
                      ذخیره
                    </button>
                    <button onClick={() => setEditing(null)} className="text-text-tertiary hover:text-text-primary transition-colors">
                      لغو
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing({ id: c.id, name: c.name, slug: c.slug })}
                      className="text-brand hover:text-brand-hover transition-colors ml-3"
                    >
                      ویرایش
                    </button>
                    <button onClick={() => del(c.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      حذف
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={3} className="p-8 text-center text-text-tertiary">
                هیچ دسته‌ای ثبت نشده.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>
    </div>
  );
}
