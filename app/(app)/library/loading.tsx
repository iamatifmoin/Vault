import { PageHeader } from "@/components/page-header";
import { ProblemCardSkeleton } from "@/components/skeleton";

export default function LibraryLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Library" />
      <main className="mx-auto max-w-7xl p-container-padding">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="h-8 min-w-[200px] max-w-xs flex-1 animate-pulse rounded-lg bg-zinc-800/60" />
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-24 animate-pulse rounded-lg bg-zinc-800/60"
            />
          ))}
        </div>
        <div className="mt-4 space-y-1.5">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProblemCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
