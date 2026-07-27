type Props = { className?: string };

export function Skeleton({ className = "" }: Props) {
  return (
    <div className={`bg-surface animate-pulse rounded-md ${className}`} aria-hidden />
  );
}

export function PodcastCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-5 flex flex-col gap-4 border border-border">
      <div className="flex items-start gap-4">
        <Skeleton className="w-24 h-24 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border">
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
