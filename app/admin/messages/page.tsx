"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { ContactMessage } from "@/lib/types";
import { AdminCard, AdminTable } from "@/components/admin/AdminForm";
import { LoadingBlock } from "@/components/ui/EmptyState";

type Data = {
  contact: ContactMessage[];
  subscribers: { id: number; email: string; subscribed_at: string }[];
};

export default function AdminMessages() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    apiGet<Data>("/api/admin/messages").then(setData);
  }, []);

  if (!data) return <LoadingBlock />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section>
        <h1 className="text-d-h3 text-text-primary mb-4">پیام‌های تماس ({data.contact.length})</h1>
        <AdminCard>
          {data.contact.length === 0 ? (
            <p className="text-center text-text-tertiary py-6">پیامی نیست.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.contact.map((m) => (
                <article key={m.id} className="py-4 first:pt-0 last:pb-0">
                  <header className="flex items-center justify-between text-d-body-sm text-text-tertiary mb-2">
                    <div className="text-text-secondary">
                      <strong className="text-text-primary">{m.name}</strong> · <span dir="ltr">{m.email}</span>
                    </div>
                    <time dir="ltr">{new Date(m.created_at).toLocaleString("en-GB")}</time>
                  </header>
                  {m.subject && <h3 className="text-d-h5 text-text-primary mt-2">{m.subject}</h3>}
                  <p className="text-d-body-md text-text-secondary mt-1 whitespace-pre-line">{m.message}</p>
                </article>
              ))}
            </div>
          )}
        </AdminCard>
      </section>

      <section>
        <h2 className="text-d-h3 text-text-primary mb-4">مشترکین خبرنامه ({data.subscribers.length})</h2>
        <AdminTable>
          <thead className="bg-bg text-right text-text-secondary">
            <tr>
              <th className="p-3 font-medium">ایمیل</th>
              <th className="p-3 font-medium">زمان ثبت</th>
            </tr>
          </thead>
          <tbody>
            {data.subscribers.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 text-text-primary" dir="ltr">{s.email}</td>
                <td className="p-3 text-text-secondary" dir="ltr">
                  {new Date(s.subscribed_at).toLocaleString("en-GB")}
                </td>
              </tr>
            ))}
            {data.subscribers.length === 0 && (
              <tr><td colSpan={2} className="p-8 text-center text-text-tertiary">مشترکی نیست.</td></tr>
            )}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
