export function MarkdownHint() {
  return (
    <details className="text-d-body-sm text-text-tertiary bg-surface border border-border rounded-md p-3">
      <summary className="cursor-pointer text-text-secondary hover:text-brand transition-colors">
        راهنمای نگارش (Markdown)
      </summary>
      <div className="mt-3 space-y-1 text-right" dir="rtl">
        <p>
          <code dir="ltr" className="text-brand">## عنوان</code> — تیتر بزرگ
        </p>
        <p>
          <code dir="ltr" className="text-brand">### زیرعنوان</code> — تیتر کوچک
        </p>
        <p>
          <code dir="ltr" className="text-brand">**پررنگ**</code> — متن پررنگ
        </p>
        <p>
          <code dir="ltr" className="text-brand">*مورب*</code> — متن مورب
        </p>
        <p>
          <code dir="ltr" className="text-brand">- مورد</code> — لیست
        </p>
        <p>
          <code dir="ltr" className="text-brand">1. مورد</code> — لیست شماره‌دار
        </p>
        <p>
          <code dir="ltr" className="text-brand">&gt; نقل قول</code> — نقل قول
        </p>
        <p>
          <code dir="ltr" className="text-brand">[متن](URL)</code> — لینک
        </p>
        <p>
          <code dir="ltr" className="text-brand">![توضیح تصویر](/uploads/covers/image.webp)</code> — تصویر
        </p>
        <p>
          <code dir="ltr" className="text-brand">---</code> — خط جدا کننده
        </p>
      </div>
    </details>
  );
}
