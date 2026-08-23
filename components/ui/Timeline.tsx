export type TimelineItem = { year: string; title: string; description?: string };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative">
      {/* lead-in stub: from above section top down to the first circle's center */}
      <span aria-hidden className="absolute right-1/2 top-[-48px] h-[226px] w-[2px] translate-x-1/2 bg-[#C9A84C]" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const onRight = index % 2 === 0;
        return (
          <li key={item.year} className="relative grid min-h-[308px] grid-cols-2 items-center gap-10 md:gap-16">
            {/* spine: from this circle's center to the next circle's center — none after the last */}
            {!isLast && (
              <span aria-hidden className="absolute right-1/2 top-1/2 h-[308px] w-[2px] translate-x-1/2 bg-[#C9A84C]" />
            )}
            {/* milestone circle */}
            <span aria-hidden className="absolute right-1/2 z-10 flex h-12 w-12 translate-x-1/2 items-center justify-center rounded-full border border-[#C9A84C] bg-bg">
              {isLast && <span className="h-10 w-10 rounded-full bg-[#C9A84C]" />}
            </span>
            <div className={onRight ? "col-start-2 text-right" : "col-start-1 row-start-1 text-left"}>
              <span className="mb-3 inline-block rounded bg-white/15 px-2.5 py-1 text-[14px] leading-5 text-[#C9A84C]">
                {item.year}
              </span>
              <h3 className={`text-[18px] font-semibold leading-7 md:text-[24px] md:leading-8 ${isLast ? "text-white" : "text-text-secondary"}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-2 text-d-body-sm leading-relaxed text-text-secondary">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
