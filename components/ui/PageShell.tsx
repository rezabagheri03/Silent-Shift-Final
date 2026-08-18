import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* T17: banner/contentinfo must be top-level landmarks; #main is the skip-link target */}
      <main id="main" tabIndex={-1} className="outline-none">
        <div className="mx-auto max-w-page px-page-x-m md:px-12 xl:px-page-x-d">
          <div className="flex flex-col gap-section-m md:gap-8 xl:gap-section-d py-8 xl:py-12">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
