import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  actionHref,
  actionLabel,
  className,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center",
        className,
      )}
    >
      <AppLogo size="lg" showWordmark={false} className="opacity-50" />
      {title ? (
        <h3 className="text-section-title mt-6">{title}</h3>
      ) : null}
      <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ??
        (actionHref && actionLabel ? (
          <Button
            nativeButton={false}
            render={<Link href={actionHref} />}
            className="mt-6"
          >
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
