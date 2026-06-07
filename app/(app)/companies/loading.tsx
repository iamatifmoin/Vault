import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Company Tracker"
        subtitle="Know exactly where you stand"
      />
      <main className="mx-auto max-w-6xl p-container-padding">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="surface-card p-4">
          <Skeleton className="h-8 w-full max-w-md" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-gutter md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="surface-card p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-12 w-24" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 5 }).map((__, row) => (
                  <Skeleton key={row} className="h-3 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
