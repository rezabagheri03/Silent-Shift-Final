"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { Category, Podcast } from "@/lib/types";
import UploadField from "@/components/admin/UploadField";
import { TagSelector } from "@/components/admin/TagSelector";
import { ChaptersEditor, type ChapterInput } from "@/components/admin/ChaptersEditor";
import { MarkdownHint } from "@/components/admin/MarkdownHint";
import { Button } from "@/components/ui/Button";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from "@/components/admin/AdminForm";

type Props = {
  initial?: Podcast & {
    tags?: { id: number }[];
    chapters?: { title: string; start_seconds: number }[];
  };
  onSaved?: (p: Podcast) => void;
};

const empty = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  summary: "",
  cover_url: "",
  audio_url: "",
  duration_seconds: 0,
  episode_number: null as number | null,
  producer: "",
  category_id: null as number | null,
  apple_url: "",
  castbox_url: "",
  transcript: "",
  tag_ids: [] as number[],
  chapters: [] as ChapterInput[],
};

export function PodcastForm({ initial, onSaved }: Props) {
  const isEdit = !!initial;
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title,
          slug: initial.slug,
          subtitle: initial.subtitle ?? "",
          description: initial.description ?? "",
          summary: initial.summary ?? "",
          cover_url: initial.cover_url ?? "",
          audio_url: initial.audio_url ?? "",
          duration_seconds: initial.duration_seconds ?? 0,
          episode_number: initial.episode_number ?? null,
          producer: initial.producer ?? "",
          category_id: initial.category_id ?? null,
          apple_url: initial.apple_url ?? "",
          castbox_url: initial.castbox_url ?? "",
          transcript: initial.transcript ?? "",
          tag_ids: (initial.tags ?? []).map((t) => t.id),
          chapters: (initial.chapters ?? []).map((c) => ({
            title: c.title,
            start_seconds: c.start_seconds,
          })),
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
      const payload = {
        ...form,
        duration_seconds: Number(form.duration_seconds) || 0,
      };
      const url = isEdit ? `/api/admin/podcasts/${initial!.id}` : "/api/admin/podcasts";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <AdminInput label="شناسه (اختیاری)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} dir="ltr" />
      <AdminInput label="زیرعنوان" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
      <AdminInput label="تهیه‌کننده" value={form.producer} onChange={(v) => setForm({ ...form, producer: v })} />
      <AdminSelect
        label="دسته"
        value={form.category_id ?? ""}
        onChange={(v) => setForm({ ...form, category_id: v ? Number(v) : null })}
        options={[{ value: "", label: "—" }, ...cats.map((c) => ({ value: String(c.id), label: c.name }))]}
      />
      <AdminInput
        label="مدت (ثانیه)"
        type="number"
        value={String(form.duration_seconds)}
        onChange={(v) => setForm({ ...form, duration_seconds: Number(v) })}
        dir="ltr"
      />
      <AdminInput
        label="شماره اپیزود"
        type="number"
        value={form.episode_number != null ? String(form.episode_number) : ""}
        onChange={(v) => setForm({ ...form, episode_number: v ? Number(v) : null })}
        dir="ltr"
      />
      <UploadField label="کاور" kind="cover" value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url })} />
      <UploadField label="فایل صوتی" kind="audio" value={form.audio_url} onChange={(url) => setForm({ ...form, audio_url: url })} />
      <AdminInput label="Apple Podcasts URL" value={form.apple_url} onChange={(v) => setForm({ ...form, apple_url: v })} dir="ltr" />
      <AdminInput label="Castbox URL" value={form.castbox_url} onChange={(v) => setForm({ ...form, castbox_url: v })} dir="ltr" />

      <AdminTextarea label="توضیح کوتاه" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

      <div className="md:col-span-2">
        <MarkdownHint />
      </div>
      <AdminTextarea label="خلاصه (Markdown)" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={5} className="md:col-span-2" />
      <AdminTextarea label="متن (transcript) — Markdown" value={form.transcript} onChange={(v) => setForm({ ...form, transcript: v })} rows={8} className="md:col-span-2" />

      <div className="md:col-span-2">
        <TagSelector value={form.tag_ids} onChange={(ids) => setForm({ ...form, tag_ids: ids })} />
      </div>

      <div className="md:col-span-2">
        <ChaptersEditor value={form.chapters} onChange={(chapters) => setForm({ ...form, chapters })} />
      </div>

      {error && <p className="text-red-400 text-d-body-sm md:col-span-2">{error}</p>}
      {message && <p className="text-emerald-400 text-d-body-sm md:col-span-2">{message}</p>}
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" variant="default" size="md" loading={saving}>
          {isEdit ? "ذخیره تغییرات" : "ایجاد"}
        </Button>
      </div>
    </form>
  );
}
