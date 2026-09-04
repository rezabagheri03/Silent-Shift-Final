export type TimelineItem = { year: string; title: string; description?: string };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <>
      {/* Mobile (Figma 1:1898): one continuous chain — line, chip, title, circle — with 10px joints */}
      <ol className="flex flex-col items-center px-6 py-12 md:hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          return (
            <li key={item.year} className="flex w-full flex-col items-center">
              {/* line segment from the previous circle down to this chip */}
              <span aria-hidden className="w-[2px] shrink-0 bg-[#C9A84C]" style={{ height: index === 0 ? 160 : 240 }} />
              <div className="flex flex-col items-center" style={{ gap: 8, marginTop: 10, marginBottom: 10 }}>
                <span
                  className="inline-block rounded text-[14px] leading-5 text-[#C9A84C]"
                  style={{
                    padding: "4px 8px",
                    background: "rgba(245, 245, 245, 0.15)",
                    border: "0.2px solid #C9A84C",
                    borderRadius: 4,
                  }}
                >
                  {item.year}
                </span>
                <h3
                  className="text-center"
                  style={{
                    fontSize: isFirst ? 16 : 18,
                    lineHeight: isFirst ? "24px" : "24px",
                    fontWeight: isFirst ? 400 : 500,
                    color: isLast ? "#FFFFFF" : "#52525B",
                  }}
                >
                  {item.title}
                </h3>
              </div>
              {/* milestone circle below the text; 137px rhythm gap after each entry */}
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A84C] bg-bg p-1">
                {isLast && <span className="h-10 w-10 rounded-full bg-[#C9A84C]" />}
              </span>
              {!isLast && <span aria-hidden className="w-[2px] shrink-0 bg-[#C9A84C]" style={{ height: 137 - 20 }} />}
            </li>
          );
        })}
      </ol>

      {/* Desktop: alternating two-column timeline (unchanged) */}
      <ol className="relative hidden md:block">
        {/* lead-in stub: from above section top down to the first circle's center */}
        <span aria-hidden className="absolute right-1/2 top-[-48px] h-[226px] w-[2px] translate-x-1/2 bg-[#C9A84C]" />
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const onRight = index % 2 === 0;
          return (
            <li key={item.year} className="relative grid min-h-[308px] grid-cols-2 items-center gap-16">
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
                <h3 className={`text-[24px] leading-8 ${isLast ? "text-white" : "text-text-secondary"}`}>
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
    </>
  );
}
