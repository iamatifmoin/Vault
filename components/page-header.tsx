import { ExtensionStatusBadge } from "@/components/extension-status-badge";
import { StreakBadge } from "@/components/streak-badge";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  streak,
  breadcrumb,
  actions,
  className,
}: {
  title?: string;
  subtitle?: string;
  streak?: number;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 overflow-hidden border-b border-border bg-background/90 px-container-padding py-2.5 backdrop-blur",
        className,
      )}
    >
      <div aria-hidden className="vault-brand-bleed vault-brand-bleed--subtle" />
      <div className="relative flex min-w-0 items-center">
        <div className="min-w-0 truncate">
          {breadcrumb ??
            (title ? (
              <div>
                <h1 className="text-page-title truncate">{title}</h1>
                {subtitle ? (
                  <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
                ) : null}
              </div>
            ) : null)}
        </div>
      </div>
      <div className="flex justify-center">
        {streak !== undefined ? <StreakBadge className="shrink-0" streak={streak} /> : null}
      </div>
      <div className="relative flex shrink-0 items-center justify-self-end gap-2">
        <ExtensionStatusBadge />
        {actions ?? null}
      </div>
    </header>
  );
}
