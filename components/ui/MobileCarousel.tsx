"use client";

import { useEffect, useRef, useState } from "react";
import { CarouselDots } from "./CarouselDots";

type Props = {
  children: React.ReactNode[];
  ariaLabel?: string;
};

export function MobileCarousel({ children, ariaLabel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const count = children.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const center = el.getBoundingClientRect().left + el.clientWidth / 2;
      const slides = Array.from(el.querySelectorAll<HTMLElement>("[data-carousel-slide]"));
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;
      slides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();
        const next = Math.abs(rect.left + rect.width / 2 - center);
        if (next < distance) { distance = next; nearest = index; }
      });
      setActiveIdx(nearest);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-carousel-slide]")[i]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  if (count === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        className="flex overflow-x-auto scroll-snap-x no-scrollbar snap-x snap-mandatory"
      >
        {children.map((child, i) => (
          <div
            key={i}
            data-carousel-slide
            className="w-full shrink-0 snap-start"
          >
            {child}
          </div>
        ))}
      </div>
      <CarouselDots count={count} active={activeIdx} onSelect={scrollTo} label={ariaLabel || "مورد"} />
    </div>
  );
}
