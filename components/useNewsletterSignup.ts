"use client";

import { useId, useState } from "react";
import { apiPost } from "@/lib/api-client";

/**
 * Shared newsletter signup logic (audit T33 — was duplicated in Footer,
 * NewsletterSection and DesignNewsletter) with a11y wiring (audit T22):
 * the status message is programmatically associated with the input.
 */
export function useNewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const messageId = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const data = await apiPost<{ message: string }>("/api/newsletter", { email });
      setMessage(data.message);
      setEmail("");
      setStatus("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در ثبت ایمیل");
      setStatus("error");
    }
  }

  const inputA11y = {
    "aria-invalid": status === "error" ? true : undefined,
    "aria-describedby": message ? messageId : undefined,
  };

  return { email, setEmail, status, message, messageId, submit, inputA11y };
}
