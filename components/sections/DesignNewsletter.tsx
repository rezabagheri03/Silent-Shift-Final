"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";

export function DesignNewsletter({
  title = "روایت‌های Silent Shift را در ایمیل خود دریافت کنید",
  description = "هفته‌ای یک‌بار، مجموعه‌ای از نوشته‌ها، ایده‌ها و تأملات درباره رشد فردی، زندگی حرفه‌ای و تغییرات ماندگار.",
}: {
  title?: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const data = await apiPost<{ message: string }>("/api/newsletter", { email });
      setMessage(data.message);
      setEmail("");
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در ثبت ایمیل");
      setState("error");
    }
  }

  return (
    <section className="flex w-full flex-col items-center gap-[24px] px-4 py-8" dir="rtl">
      {/* Title */}
      <h2 className="w-full max-w-[800px] text-right text-[36px] font-semibold leading-[44px] text-[#FFFFFF]">
        {title}
      </h2>

      {/* Description */}
      <p className="w-full max-w-[800px] text-right text-[20px] font-normal leading-[32px] text-[#A1A1AA]">
        {description}
      </p>

      {/* 
        Form wrapper:
        sm:flex-row-reverse forces the first element (Input) to the LEFT and the second element (Button) to the RIGHT.
      */}
      <form
        onSubmit={submit}
        className="mt-[8px] flex w-full max-w-[1200px] flex-col items-start justify-center gap-[24px] sm:flex-row-reverse sm:items-start"
      >
        {/* Email Column (Input + Subtext) - Displayed on the LEFT */}
        <div className="flex w-full flex-col gap-[8px] sm:max-w-[588px]">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل شما (برای ارسال نامه‌های گاه‌به‌گاه)"
            aria-label="ایمیل"
            className="box-border h-[56px] w-full rounded-[6px] border border-[#FFFFFF] bg-white/20 px-[16px] text-right text-[16px] font-medium leading-[24px] text-[#FFFFFF] placeholder:text-[#A1A1AA] backdrop-blur-[40px] outline-none transition-colors focus:border-[#C9A84C]"
          />

          <p
            className={`w-full text-right text-[14px] font-normal leading-[20px] ${
              state === "error"
                ? "text-red-400"
                : state === "success"
                  ? "text-emerald-400"
                  : "text-[#A1A1AA]"
            }`}
            role="status"
          >
            {message ||
              "با کلیک بر روی عضویت شما می‌پذیرید که آخرین مقالات و بروزرسانی‌ها برای شما ارسال شود."}
          </p>
        </div>

        {/* Standard Button - Displayed on the RIGHT */}
        <Button
          type="submit"
          loading={state === "loading"}
          className="box-border flex h-[56px] w-full shrink-0 items-center justify-center !rounded-[4px] !bg-[#C9A84C] px-[16px] text-center text-[16px] font-medium leading-[24px] !text-[#000000] transition-colors hover:!bg-[#b49541] sm:w-[180px]"
        >
          عضویت
        </Button>
      </form>
    </section>
  );
}