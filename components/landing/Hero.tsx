import Link from "next/link";

type Props = {
  title: string;
  highlight?: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  helper?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export default function Hero({
  title,
  highlight = "مکث",
  subtitle,
  ctaLabel,
  ctaHref,
  helper,
  imageSrc = "/images/hero.webp",
  imageAlt = "",
}: Props) {
  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) return title;
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="text-brand">{highlight}</span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  return (
    <section className="w-full" dir="ltr">
      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-0">
        {/* LEFT — image */}
        <div className="relative aspect-[600/327] w-full overflow-hidden rounded">
          <img
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={655}
            fetchPriority="high"
            className="h-full w-full object-cover object-center scale-[1.02]"
          />
        </div>

        {/* RIGHT — copy (RTL, right-aligned like the mock) */}
        <div
          dir="rtl"
          className="flex w-full max-w-[550px] flex-col items-center text-center lg:items-start lg:text-right lg:ml-auto"
        >
          <h1 className="text-m-h1 md:text-d-h1 text-text-primary leading-[1.35]">
            {renderTitle()}
          </h1>

          <p className="mt-5 max-w-[34rem] text-d-body-lg leading-8 text-text-tertiary md:mt-6">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 md:mt-10 lg:items-start">
            <Link
              href={ctaHref}
              className="inline-flex h-[56px] items-center justify-center rounded-sm bg-[#C9A84C] px-[16px] text-[16px] font-medium leading-[24px] text-black transition-colors hover:bg-[#b49541]"
            >
              {ctaLabel}
            </Link>

            {helper ? (
              <p className="text-d-body-sm leading-6 text-text-tertiary">
                {helper}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}