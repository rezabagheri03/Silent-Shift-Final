type Props = {
  appleUrl?: string | null;
  castboxUrl?: string | null;
  title?: string;
  compact?: boolean;
  reverseMobile?: boolean;
};

export function PlatformBadges({
  appleUrl = process.env.NEXT_PUBLIC_APPLE_PODCASTS_URL || "https://podcasts.apple.com/",
  castboxUrl = process.env.NEXT_PUBLIC_CASTBOX_URL || "https://castbox.fm/",
  title = "در دسترس در پلتفرم‌های معتبر جهانی",
  compact = false,
  reverseMobile = false,
}: Props) {
  return (
    <section className={`flex flex-col items-center ${compact ? "gap-4" : "gap-6 py-4 md:py-8"}`}>
      {title && (
        <h2 className={`${compact ? "text-m-h4 md:text-d-h4" : "text-m-h4 md:text-d-h3"} text-text-primary text-center`}>
          {title}
        </h2>
      )}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5" dir="ltr">
        <a
          href={appleUrl || "https://podcasts.apple.com/"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apple Podcasts"
          className={`group ${reverseMobile ? "order-2 md:order-1" : "order-1"} h-14 md:h-16 min-w-[184px] md:min-w-[200px] rounded-lg border border-border bg-transparent px-5 flex items-center justify-center gap-3 hover:border-brand transition-colors`}
        >
          <img src="/brand/apple-podcasts.svg" alt="" className="w-9 h-9 md:w-10 md:h-10" />
          <span className="text-left leading-tight text-white">
            <small className="block text-[9px] uppercase tracking-wide text-text-secondary">Listen on</small>
            <strong className="block text-[16px] md:text-[18px] font-medium">Podcasts</strong>
          </span>
        </a>
        <a
          href={castboxUrl || "https://castbox.fm/"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Castbox"
          className={`group ${reverseMobile ? "order-1 md:order-2" : "order-2"} h-14 md:h-16 min-w-[184px] md:min-w-[200px] rounded-lg border border-border bg-transparent px-5 flex items-center justify-center gap-3 hover:border-brand transition-colors`}
        >
          <img src="/brand/castbox.svg" alt="" className="w-9 h-9 md:w-10 md:h-10" />
          <strong className="text-white text-[17px] md:text-[19px] font-medium">Castbox</strong>
        </a>
      </div>
    </section>
  );
}
