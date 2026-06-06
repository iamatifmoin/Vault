import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Library" />
      <main className="mx-auto max-w-7xl p-container-padding">
        <Skeleton className="h-10 w-full" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-32" />
          ))}
        </div>
        <Skeleton className="mt-4 h-3 w-40" />
        <div className="mt-6 grid gap-gutter md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="surface-card p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-4 h-5 w-full" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
