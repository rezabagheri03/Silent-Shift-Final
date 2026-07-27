"use client";

import type { ReactNode } from "react";

const inputBase =
  "w-full bg-bg border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary outline-none focus:border-brand transition-colors";

export function AdminInput({
  label,
  value,
  onChange,
  required,
  type = "text",
  dir,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  dir?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-d-body-sm text-text-secondary mb-1.5 block">
        {label}
        {required && <span className="text-brand mr-1">*</span>}
      </span>
      <input
        type={type}
        required={required}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      />
    </label>
  );
}

export function AdminTextarea({
  label,
  value,
  onChange,
  rows = 3,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-d-body-sm text-text-secondary mb-1.5 block">
        {label}
        {required && <span className="text-brand mr-1">*</span>}
      </span>
      <textarea
        rows={rows}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} resize-none`}
      />
    </label>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-d-body-sm text-text-secondary mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">{children}</div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-d-body-sm">{children}</table>
    </div>
  );
}
