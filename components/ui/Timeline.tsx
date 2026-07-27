export type TimelineItem = { year: string; title: string; description?: string };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative py-10 before:content-[''] before:absolute before:top-0 before:bottom-0 before:right-1/2 before:translate-x-1/2 before:w-px before:bg-gradient-to-b before:from-transparent before:via-brand before:to-brand">
      {items.map((item, index) => {
        const right = index % 2 === 0;
        return (
          <li key={item.year} className="relative grid grid-cols-2 gap-10 md:gap-16 items-center min-h-[210px] md:min-h-[250px]">
            <span className={`absolute z-10 right-1/2 translate-x-1/2 w-5 h-5 rounded-full border border-brand bg-bg ring-8 ring-bg ${index === items.length - 1 ? "bg-brand shadow-[0_0_18px_rgba(212,175,55,.6)]" : ""}`} aria-hidden />
            <div className={`${right ? "col-start-2 text-right" : "col-start-1 row-start-1 text-left"}`}>
              <span className="inline-block mb-2 rounded-sm bg-surface border border-border px-2 py-1 text-[12px] text-brand">{item.year}</span>
              <h3 className="text-d-body-md md:text-d-h5 text-white">{item.title}</h3>
              {item.description && <p className="mt-2 text-d-body-sm text-text-secondary leading-relaxed">{item.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
