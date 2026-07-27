"use client";

import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { designAssets } from "@/lib/design-assets";
import { apiGet, apiPost } from "@/lib/api-client";
import type { Faq } from "@/lib/types";
import { useEffect } from "react";

const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/8heshtaam";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    apiGet<Faq[]>("/api/faqs").then(setFaqs).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const data = await apiPost<{ id: number; message: string }>("/api/contact", form);
      setStatus("success");
      setMsg(data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "خطا در ارسال پیام");
    }
  };

  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "ارتباط" }]} />

      {/* Hero with atmospheric image + big centered title */}
      <section className="relative overflow-hidden border-y border-border mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={designAssets.contactHero}
          alt=""
          className="w-full h-[300px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-black/15" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <h1 className="text-m-h1 md:text-d-h1 text-brand drop-shadow-lg">
            نقطه گفت و گو
          </h1>
        </div>
      </section>

      {/* Main section: Form + Booking card */}
      <section className="grid gap-8 md:grid-cols-[1fr_380px] md:items-start" dir="rtl">
        {/* Form - right side */}
        <form onSubmit={submit} className="flex flex-col gap-6 order-1">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="نام شما" htmlFor="name" required>
              <input
                id="name"
                required
                placeholder="نام خود را وارد کنید"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="آدرس ایمیل" htmlFor="email" required>
              <input
                id="email"
                type="email"
                required
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label="موضوع پیام (اختیاری)" htmlFor="subject">
            <input
              id="subject"
              placeholder="در مورد چه چیزی می‌خواهید گفت و گو کنیم؟"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="پیام شما" htmlFor="message" required>
            <textarea
              id="message"
              required
              rows={6}
              placeholder="جزییات پیام خود را اینجا بنویسید…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${textareaClass} resize-none`}
            />
          </Field>

          {msg && (
            <p
              className={`text-d-body-sm text-right ${
                status === "error" ? "text-red-400" : "text-emerald-400"
              }`}
              role="status"
            >
              {msg}
            </p>
          )}

          {/* Gold divider + submit */}
          <div className="flex flex-col items-end gap-4 pt-4">
            <div className="w-full h-px bg-brand/40" />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 text-d-button text-brand hover:text-white disabled:opacity-50 transition-colors"
            >
              <span>ارسال پیام</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 6L9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Booking card - left side */}
        <div className="order-2 md:sticky md:top-24">
          <div className="bg-surface border border-border rounded-lg p-8 flex flex-col items-center gap-5 text-center">
            <CalendarIcon />
            <div className="flex flex-col gap-2">
              <h2 className="text-d-h4 text-text-primary">رزرو جلسه معارفه</h2>
              <p className="text-d-body-sm text-text-tertiary">
                یک گفتگوی ۳۰ دقیقه‌ای رایگان برای بررسی مسیر شما.
              </p>
            </div>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-brand text-brand text-d-button rounded hover:bg-brand/10 transition-colors w-full"
            >
              هماهنگی گفتگوی اختصاصی
            </a>
          </div>

          {/* Quote below booking card */}
          <p className="text-d-body-sm text-text-tertiary text-right leading-relaxed mt-6">
            «من پیام‌ها را با دقت و بدون عجله می‌خوانم. معمولاً در روزهای دوشنبه و پنجشنبه شخصاً به شما پاسخ می‌دهم. ممنون از صبوری شما.»
          </p>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="flex flex-col gap-6 mt-12">
          <h2 className="text-m-h2 md:text-d-h2 text-text-primary text-right">سوالات پرتکرار</h2>
          <FaqAccordion items={faqs} />
        </section>
      )}
    </PageShell>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-md px-4 py-3 text-d-body-md text-text-primary placeholder:text-text-secondary outline-none focus:border-brand transition-colors text-right";
const textareaClass =
  "w-full min-h-[140px] bg-surface border border-border rounded-md px-4 py-3 text-d-body-md text-text-primary placeholder:text-text-secondary outline-none focus:border-brand transition-colors text-right";

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-right">
      <span className="text-d-body-sm text-text-secondary">
        {label}
        {required && <span className="text-brand mr-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-text-secondary" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
