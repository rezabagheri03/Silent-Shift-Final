"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Article, Category } from "@/lib/types";
import UploadField from "@/components/admin/UploadField";
import { TagSelector } from "@/components/admin/TagSelector";
import { MarkdownHint } from "@/components/admin/MarkdownHint";
import { Button } from "@/components/ui/Button";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from "@/components/admin/AdminForm";

type Props = {
  initial?: Article & { tags?: { id: number }[] };
  onSaved?: (a: Article) => void;
};

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_url: "",
  author: "",
  category_id: null as number | null,
  read_time_minutes: null as number | null,
  tag_ids: [] as number[],
};

export function ArticleForm({ initial, onSaved }: Props) {
  const isEdit = !!initial;
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title,
          slug: initial.slug,
          excerpt: initial.excerpt ?? "",
          body: initial.body ?? "",
          cover_url: initial.cover_url ?? "",
          author: initial.author ?? "",
          category_id: initial.category_id ?? null,
          read_time_minutes: initial.read_time_minutes ?? null,
          tag_ids: (initial.tags ?? []).map((t) => t.id),
        }
      : empty
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Category[]>("/api/categories").then(setCats);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const url = isEdit ? `/api/admin/articles/${initial!.id}` : "/api/admin/articles";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "خطا");
      setMessage(isEdit ? "با موفقیت ذخیره شد ✓" : "ایجاد شد ✓");
      if (!isEdit) setForm(empty);
      onSaved?.(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AdminInput label="عنوان" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
      <AdminInput label="شناسه" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} dir="ltr" />
      <AdminInput label="نویسنده" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
      <AdminSelect
        label="دسته"
        value={form.category_id ?? ""}
        onChange={(v) => setForm({ ...form, category_id: v ? Number(v) : null })}
        options={[{ value: "", label: "—" }, ...cats.map((c) => ({ value: String(c.id), label: c.name }))]}
      />
      <UploadField label="کاور" kind="cover" value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url })} />
      <AdminInput
        label="زمان مطالعه (دقیقه) — اختیاری، اگر خالی باشد از روی متن حساب می‌شود"
        type="number"
        value={form.read_time_minutes != null ? String(form.read_time_minutes) : ""}
        onChange={(v) => setForm({ ...form, read_time_minutes: v ? Number(v) : null })}
        dir="ltr"
      />
      <AdminTextarea label="چکیده" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} rows={2} className="md:col-span-2" />
      <div className="md:col-span-2">
        <MarkdownHint />
      </div>
      <AdminTextarea label="متن (Markdown)" value={form.body} onChange={(v) => setForm({ ...form, body: v })} rows={12} required className="md:col-span-2" />
      <div className="md:col-span-2">
        <TagSelector value={form.tag_ids} onChange={(ids) => setForm({ ...form, tag_ids: ids })} />
      </div>
      {error && <p className="text-red-400 text-d-body-sm md:col-span-2">{error}</p>}
      {message && <p className="text-emerald-400 text-d-body-sm md:col-span-2">{message}</p>}
      <div className="md:col-span-2">
        <Button type="submit" variant="default" size="md" loading={saving}>
          {isEdit ? "ذخیره تغییرات" : "ایجاد"}
        </Button>
      </div>
    </form>
  );
}
