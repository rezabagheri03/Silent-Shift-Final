import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header />
      <div className="mx-auto max-w-page px-page-x-m md:px-12 xl:px-page-x-d">
        <div className="flex flex-col gap-section-m md:gap-8 xl:gap-section-d py-8 xl:py-12">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
