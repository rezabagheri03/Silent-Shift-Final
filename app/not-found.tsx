import Link from "next/link";
import { designAssets } from "@/lib/design-assets";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg flex items-end justify-center">
      <img src={designAssets.notFound} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      <div className="absolute z-10 top-[66%] left-1/2 -translate-x-1/2 text-[38px] md:text-[56px] leading-none font-bold text-brand whitespace-nowrap">خطا ۴۰۴</div>
      <section className="relative z-10 pb-[7vh] md:pb-[5vh] flex flex-col items-center gap-4 text-center px-6">
        <h1 className="text-m-h2 md:text-d-h2 text-white drop-shadow-lg">مسیر گم شده است</h1>
        <Link href="/" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-brand px-5 text-d-button text-brand-on hover:bg-brand-hover transition-colors">
          <HomeIcon /> بازگشت به خانه
        </Link>
      </section>
    </main>
  );
}

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 12L12 3l9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
