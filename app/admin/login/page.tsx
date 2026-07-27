"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { safeAdminRedirect } from "@/lib/security";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "خطا");
      router.replace(safeAdminRedirect(params.get("from")));
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-bg">
      <form
        onSubmit={onSubmit}
        className="bg-surface w-full max-w-sm p-8 rounded-xl border border-border space-y-5"
      >
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-brand tracking-[0.05em]"
            style={{ fontWeight: 600, fontSize: "20px" }}
          >
            SILENT SHIFT
          </Link>
          <h1 className="text-d-h4 text-text-primary">ورود به مدیریت</h1>
        </div>

        <label className="block">
          <span className="text-d-body-sm text-text-secondary mb-1.5 block">نام کاربری</span>
          <input
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full bg-bg border border-border rounded-md px-3 py-2.5 text-d-body-md text-text-primary outline-none focus:border-brand transition-colors"
            dir="ltr"
            autoComplete="username"
          />
        </label>

        <label className="block">
          <span className="text-d-body-sm text-text-secondary mb-1.5 block">رمز عبور</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-bg border border-border rounded-md px-3 py-2.5 text-d-body-md text-text-primary outline-none focus:border-brand transition-colors"
            dir="ltr"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="text-d-body-sm text-red-400">{error}</p>}

        <Button type="submit" variant="default" size="md" fullWidth loading={loading}>
          ورود
        </Button>

        <Link
          href="/"
          className="block text-center text-d-body-sm text-text-tertiary hover:text-brand transition-colors"
        >
          بازگشت به سایت
        </Link>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
