"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type { Paginated, Podcast } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AdminCard, AdminTable } from "@/components/admin/AdminForm";
import { PodcastForm } from "@/components/admin/PodcastForm";

export default function AdminPodcasts() {
  const [list, setList] = useState<Paginated<Podcast> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => apiGet<Paginated<Podcast>>("/api/admin/podcasts").then(setList);

  useEffect(() => {
    reload();
  }, []);

  const del = async (id: number) => {
    if (!confirm("حذف این پادکست؟")) return;
    await apiDelete(`/api/admin/podcasts/${id}`);
    reload();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-d-h3 text-text-primary">پادکست‌ها</h1>
        <Button onClick={() => setShowForm((s) => !s)} variant="default" size="md">
          {showForm ? "بستن فرم" : "افزودن پادکست"}
        </Button>
      </div>

      {showForm && (
        <AdminCard>
          <PodcastForm
            onSaved={() => {
              setShowForm(false);
              reload();
            }}
          />
        </AdminCard>
      )}

      <div className="mt-6">
        <AdminTable>
          <thead className="bg-bg text-right text-text-secondary">
            <tr>
              <th className="p-3 font-medium">عنوان</th>
              <th className="p-3 font-medium">شناسه</th>
              <th className="p-3 font-medium">دسته</th>
              <th className="p-3 font-medium">پخش</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {list?.items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 text-text-primary">{p.title}</td>
                <td className="p-3 text-text-tertiary" dir="ltr">{p.slug}</td>
                <td className="p-3 text-text-secondary">{p.category_name || "—"}</td>
                <td className="p-3 text-text-secondary" dir="ltr">{p.play_count}</td>
                <td className="p-3 text-left">
                  <Link
                    href={`/admin/podcasts/${p.id}`}
                    className="text-brand hover:text-brand-hover ml-3 transition-colors"
                  >
                    ویرایش
                  </Link>
                  <button
                    onClick={() => del(p.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {list?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-tertiary">
                  هیچ موردی ثبت نشده.
                </td>
              </tr>
            )}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
