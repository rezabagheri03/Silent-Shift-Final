"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api-client";
import type { Article, Paginated } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AdminCard, AdminTable } from "@/components/admin/AdminForm";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default function AdminArticles() {
  const [list, setList] = useState<Paginated<Article> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => apiGet<Paginated<Article>>("/api/admin/articles").then(setList);

  useEffect(() => {
    reload();
  }, []);

  const del = async (id: number) => {
    if (!confirm("حذف این روایت؟")) return;
    await apiDelete(`/api/admin/articles/${id}`);
    reload();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-d-h3 text-text-primary">روایت‌ها</h1>
        <Button onClick={() => setShowForm((s) => !s)} variant="default" size="md">
          {showForm ? "بستن فرم" : "افزودن روایت"}
        </Button>
      </div>

      {showForm && (
        <AdminCard>
          <ArticleForm
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
              <th className="p-3 font-medium">بازدید</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {list?.items.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-3 text-text-primary">{a.title}</td>
                <td className="p-3 text-text-tertiary" dir="ltr">{a.slug}</td>
                <td className="p-3 text-text-secondary">{a.category_name || "—"}</td>
                <td className="p-3 text-text-secondary" dir="ltr">{a.view_count}</td>
                <td className="p-3 text-left">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="text-brand hover:text-brand-hover ml-3 transition-colors"
                  >
                    ویرایش
                  </Link>
                  <button
                    onClick={() => del(a.id)}
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
