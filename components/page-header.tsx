import { StreakBadge } from "@/components/streak-badge";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  streak,
  breadcrumb,
  actions,
  className,
}: {
  title?: string;
  streak?: number;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/90 px-container-padding backdrop-blur",
        className,
      )}
    >
      <div className="min-w-0 truncate">
        {breadcrumb ??
          (title ? <h1 className="text-page-title truncate">{title}</h1> : null)}
      </div>
      <div className="shrink-0">
        {actions ?? (streak !== undefined ? <StreakBadge streak={streak} /> : null)}
      </div>
    </header>
  );
}
