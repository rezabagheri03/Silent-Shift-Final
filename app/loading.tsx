export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-bg">
      <div
        className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"
        aria-label="در حال بارگذاری"
      />
    </div>
  );
}
