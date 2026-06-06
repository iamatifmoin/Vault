import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Dashboard" />
      <main className="mx-auto max-w-6xl p-container-padding">
        <div className="grid gap-gutter md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="surface-card p-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-4 h-9 w-16" />
            </div>
          ))}
        </div>
        <div className="surface-card mt-6 p-4">
          <Skeleton className="h-3 w-24" />
          <div className="mt-3 grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-[2px]" />
            ))}
          </div>
        </div>
        <div className="surface-card mt-6 overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <Skeleton className="h-5 w-36" />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border-t border-border px-6 py-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
