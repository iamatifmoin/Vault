import { cn } from "@/lib/utils";

// Base skeleton element
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "animate-pulse rounded-md bg-zinc-800/60",
      className
    )} />
  );
}

// Skeleton for a stat card (used on Dashboard)
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton for a problem card row (used in Library)
export function ProblemCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// Skeleton for a company card (used in Companies page)
export function CompanyCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4" />
        <Skeleton className="h-2 w-5/6" />
      </div>
    </div>
  );
}

export { Skeleton };
