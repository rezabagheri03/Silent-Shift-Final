import Link from "next/link";
import type { Podcast } from "@/lib/types";
import { PodCard } from "@/components/ui/PodCard";
import { PlatformBadges } from "@/components/sections/PlatformBadges";

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
          <Link
            href="/podcasts"
            className="box-border inline-flex h-16 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#A1A1AA] bg-[#171717] p-4 text-center text-[20px] font-normal leading-8 text-[#A1A1AA] transition-colors hover:border-brand hover:text-text-primary md:w-[141px]"
          >
            تمام اپیزودها
          </Link>

          <div className="min-w-0 w-full md:w-[947px] md:max-w-[947px] md:flex-1">
            <PodCard podcast={latest} />
          </div>
        </div>
      )}

      <PlatformBadges />
    </section>
  );
}