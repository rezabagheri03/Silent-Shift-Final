export function CarouselDots({ count, active, onSelect, label }: { count: number; active: number; onSelect: (index: number) => void; label: string }) {
  if (count < 2) return null;
  return (
    <div className="flex justify-center gap-2" role="tablist" aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <button key={index} type="button" role="tab" aria-selected={index === active} aria-label={`${label} ${index + 1}`} onClick={() => onSelect(index)} className="w-11 h-11 flex items-center justify-center">
          <span className={`block w-4 h-4 rounded-full transition-all ${index === active ? "bg-brand scale-100" : "bg-text-tertiary scale-75"}`} />
        </button>
      ))}
    </div>
  );
}
