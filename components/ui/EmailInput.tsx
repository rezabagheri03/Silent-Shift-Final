"use client";

import { forwardRef } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  description?: string;
  label?: string;
};

/**
 * Frosted-glass email input matching the Silent Shift Newsletter design.
 * Semi-transparent white background + 40px backdrop-blur + white border.
 */
export const EmailInput = forwardRef<HTMLInputElement, Props>(function EmailInput(
  { description, label, className = "", id, ...rest },
  ref
) {
  const inputId = id || "email-input";
  return (
    <div className="w-full">
      <div className="relative">
        {label && (
          <label htmlFor={inputId} className="sr-only">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="email"
          placeholder="ایمیل خود را وارد نمایید"
          className={`w-full rounded-[10px] border border-white/80 backdrop-email px-4 py-4 text-d-button text-text-primary placeholder:text-white/70 outline-none focus:border-brand transition-colors ${className}`}
          {...rest}
        />
      </div>
      {description && (
        <p className="mt-2 text-d-body-sm text-text-secondary text-right">
          {description}
        </p>
      )}
    </div>
  );
});
