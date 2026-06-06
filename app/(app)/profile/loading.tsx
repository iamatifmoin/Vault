import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Profile" />
      <main className="flex justify-center p-container-padding">
        <div className="w-full max-w-[680px] space-y-stack-lg">
          <div className="flex flex-col items-center pt-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="mt-4 h-7 w-40" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="surface-card p-4">
                <Skeleton className="mx-auto h-3 w-20" />
                <Skeleton className="mx-auto mt-3 h-8 w-10" />
              </div>
            ))}
          </div>
          <div className="surface-card p-container-padding">
            <Skeleton className="h-5 w-40" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-full" />
              ))}
            </div>
          </div>
          <div className="surface-card p-container-padding">
            <Skeleton className="h-5 w-20" />
            <div className="mt-6 flex gap-1 overflow-hidden">
              {Array.from({ length: 52 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((__, row) => (
                    <Skeleton key={row} className="h-3 w-3 rounded-[2px]" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
