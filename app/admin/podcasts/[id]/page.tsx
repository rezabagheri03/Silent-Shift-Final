"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import type { Podcast } from "@/lib/types";
import { AdminCard } from "@/components/admin/AdminForm";
import { PodcastForm } from "@/components/admin/PodcastForm";
import { LoadingBlock } from "@/components/ui/EmptyState";

type FullPodcast = Podcast & {
  tags?: { id: number; name: string; slug: string }[];
  chapters?: { title: string; start_seconds: number }[];
};

export default function EditPodcastPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<FullPodcast | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiGet<FullPodcast>(`/api/admin/podcasts/${params.id}`)
      .then(setData)
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-text-tertiary text-center py-10">پیدا نشد.</p>
        <div className="text-center">
          <Link href="/admin/podcasts" className="text-brand hover:text-brand-hover transition-colors">
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return <LoadingBlock />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/podcasts"
            className="text-d-body-sm text-text-tertiary hover:text-brand transition-colors"
          >
            ← بازگشت به لیست
          </Link>
          <h1 className="text-d-h3 text-text-primary mt-2">ویرایش پادکست</h1>
        </div>
      </div>

      <AdminCard>
        <PodcastForm initial={data} onSaved={() => router.refresh()} />
      </AdminCard>
    </div>
  );
}
