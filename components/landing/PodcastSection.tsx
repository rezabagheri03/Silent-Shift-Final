import Link from "next/link";
import type { Podcast } from "@/lib/types";
import { PodCard } from "@/components/ui/PodCard";
import { PlatformBadges } from "@/components/sections/PlatformBadges";
import { ArrowLeftCircleIcon } from "@/components/ui/Icons";

type Props = {
  latest: Podcast | null;
};

export default function PodcastSection({ latest }: Props) {
  return (
    <section className="w-full flex flex-col gap-8">
      <h2 className="text-d-h2 text-text-primary text-center">
        مسیرت رو از اینجا شروع کن
      </h2>

      {latest && (
        <div
          dir="ltr"
          className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-4 md:gap-[112px]"
        >
          <div className="relative h-16 w-full shrink-0 md:w-[141px]">
            <Link
              href="/podcasts"
              className="group box-border inline-flex h-16 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#A1A1AA] bg-[#171717] p-4 text-center text-[20px] font-normal leading-8 text-[#A1A1AA] transition-all duration-200 hover:border-[#F5F5F5] hover:text-[#F5F5F5] hover:shadow-[0_0_20px_rgba(245,245,245,0.25)] md:absolute md:right-0 md:top-0 md:w-[141px] md:hover:w-[173px]"
            >
              <span
                aria-hidden
                className="-mr-2 flex w-0 items-center overflow-hidden opacity-0 transition-all duration-200 group-hover:mr-0 group-hover:w-6 group-hover:opacity-100"
              >
                <ArrowLeftCircleIcon size={24} className="shrink-0 text-[#F5F5F5]" />
              </span>
              تمام اپیزودها
            </Link>
          </div>

          <div className="min-w-0 w-full md:w-[947px] md:max-w-[947px] md:flex-1">
            <PodCard podcast={latest} />
          </div>
        </div>
      )}

      <PlatformBadges />
    </section>
  );
}