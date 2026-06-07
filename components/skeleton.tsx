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
    <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
      <Skeleton className="w-[3px] flex-shrink-0 self-stretch rounded-none" />
      <div className="flex flex-1 flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start gap-2.5">
            <Skeleton className="h-3 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for a company card (used in Companies page)
export function CompanyCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-vault-surface p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center sm:w-36">
          <Skeleton className="h-14 w-24" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
        <div className="flex-1 space-y-2.5">
          <Skeleton className="mb-1 h-3 w-24" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-2 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
