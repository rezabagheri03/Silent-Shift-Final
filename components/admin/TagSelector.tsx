"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Tag } from "@/lib/types";

type Props = {
  value: number[];
  onChange: (ids: number[]) => void;
};

export function TagSelector({ value, onChange }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    apiGet<Tag[]>("/api/tags").then(setTags).catch(() => {});
  }, []);

  const toggle = (id: number) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  return (
    <label className="block">
      <span className="text-d-body-sm text-text-secondary mb-1.5 block">تگ‌ها</span>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <span className="text-d-body-sm text-text-tertiary">هیچ تگی هنوز تعریف نشده.</span>
        )}
        {tags.map((t) => {
          const on = value.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`px-3 py-1.5 rounded-full text-d-body-sm transition-colors ${
                on
                  ? "bg-brand text-brand-on"
                  : "bg-surface border border-border text-text-secondary hover:border-brand hover:text-text-primary"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </label>
  );
}
