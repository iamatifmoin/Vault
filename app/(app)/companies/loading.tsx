import { AnimatedMain } from "@/components/animated-main";
import { CompanyCardSkeleton } from "@/components/skeleton";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Company Tracker"
        subtitle="Know exactly where you stand"
      />

      <AnimatedMain className="mx-auto max-w-6xl p-container-padding">
        <div className="mb-8">
          <div className="flex gap-6 border-b border-zinc-800/80 pb-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-24" />
            ))}
          </div>
          <Skeleton className="mt-5 h-3 w-28" />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </div>

        <section>
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <CompanyCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </AnimatedMain>
    </div>
  );
}
