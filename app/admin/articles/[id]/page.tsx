"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import type { Article } from "@/lib/types";
import { AdminCard } from "@/components/admin/AdminForm";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { LoadingBlock } from "@/components/ui/EmptyState";

type FullArticle = Article & { tags?: { id: number; name: string; slug: string }[] };

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<FullArticle | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiGet<FullArticle>(`/api/admin/articles/${params.id}`)
      .then(setData)
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-text-tertiary text-center py-10">پیدا نشد.</p>
        <div className="text-center">
          <Link href="/admin/articles" className="text-brand hover:text-brand-hover transition-colors">
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return <LoadingBlock />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/articles"
          className="text-d-body-sm text-text-tertiary hover:text-brand transition-colors"
        >
          ← بازگشت به لیست
        </Link>
        <h1 className="text-d-h3 text-text-primary mt-2">ویرایش روایت</h1>
      </div>

      <AdminCard>
        <ArticleForm initial={data} onSaved={() => router.refresh()} />
      </AdminCard>
    </div>
  );
}
