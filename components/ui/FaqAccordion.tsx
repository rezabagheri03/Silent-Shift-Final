"use client";

import { useState } from "react";
import type { Faq } from "@/lib/types";
import { PlusIcon, MinusIcon } from "./Icons";

type Props = {
  items: Faq[];
  variant?: "desktop" | "mobile";
  idPrefix?: string;
};

/**
 * Silent Shift FAQ accordion — dark surface cards, +/− toggle, 200ms animation.
 */
export function FaqAccordion({ items, variant = "desktop", idPrefix = "faq" }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (!items.length) {
    return <p className="text-d-body-sm text-text-tertiary text-center">سوالی ثبت نشده است.</p>;
  }

  const questionClass = variant === "mobile" ? "text-m-h6" : "text-d-h5";

  return (
    <ul className="flex flex-col gap-4 w-full">
      {items.map((f) => {
        const isOpen = openId === f.id;
        return (
          <li
            key={f.id}
            className={
              variant === "mobile"
                ? "bg-transparent overflow-hidden border-b border-border last:border-b-0"
                : "bg-surface rounded-lg overflow-hidden border border-transparent hover:border-border transition-colors"
            }
          >
            <button
              onClick={() => setOpenId(isOpen ? null : f.id)}
              className="w-full text-right p-4 flex items-center justify-between gap-4"
              aria-expanded={isOpen}
              aria-controls={`${idPrefix}-answer-${f.id}`}
            >
              <span className="shrink-0 text-text-primary">
                {isOpen ? <MinusIcon size={20} /> : <PlusIcon size={20} />}
              </span>
              <span className={`${questionClass} text-text-primary flex-1`}>{f.question}</span>
            </button>
            <div
              id={`${idPrefix}-answer-${f.id}`}
              className={`grid transition-all duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
              aria-hidden={!isOpen}
            >
              <div className="overflow-hidden">
                <p className="text-d-body-md text-text-secondary text-right px-4 pb-4 whitespace-pre-line">
                  {f.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
