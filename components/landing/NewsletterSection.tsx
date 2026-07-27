"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { EmailInput } from "@/components/ui/EmailInput";

type Props = {
  title: string;
  subtitle: string;
};

export default function NewsletterSection({ title, subtitle }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const data = await apiPost<{ message: string }>("/api/newsletter", { email });
      setStatus("success");
      setMsg(data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "خطا در ثبت ایمیل");
    }
  };

  return (
    <section className="w-full flex flex-col gap-6 items-center py-8">
      <h2 className="text-m-h2 md:text-d-h2 text-text-primary text-center md:text-right w-full max-w-[800px]">
        {title}
      </h2>
      <p className="text-m-body-lg md:text-d-body-lg text-text-secondary text-right w-full max-w-[800px]">
        {subtitle}
      </p>

      <form
        onSubmit={submit}
        className="w-full flex flex-col md:flex-row gap-4 md:gap-6 md:px-[204px] items-stretch md:items-start"
      >
        <div className="flex-1 md:max-w-[588px]">
          <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            label="ایمیل"
            description="با کلیک بر روی «همراه شدن»، می‌پذیری که نامه‌های گاه‌به‌گاه سایلنت شیفت برایت ارسال شود."
          />
        </div>
        <div className="md:max-w-[180px] md:flex-1">
          <Button type="submit" variant="default" size="lg" fullWidth loading={status === "loading"}>
            همراه شدن
          </Button>
        </div>
      </form>

      {msg && (
        <p
          className={`text-d-body-sm w-full text-right ${
            status === "error" ? "text-red-400" : "text-emerald-400"
          }`}
          role="status"
        >
          {msg}
        </p>
      )}
    </section>
  );
}
