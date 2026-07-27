"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-bg">
      <h1 className="text-d-h2 text-text-primary mb-3">یک خطا رخ داد</h1>
      <p className="text-d-body-md text-text-secondary mb-6 max-w-md">
        {error.message || "لطفاً دوباره تلاش کنید."}
      </p>
      <Button onClick={reset} variant="default">
        تلاش مجدد
      </Button>
    </div>
  );
}
