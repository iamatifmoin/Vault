import { cn } from "@/lib/utils";

export function WindowChrome({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("surface-card flex flex-col overflow-hidden", className)}>
      <div className="flex items-center gap-3 border-b border-border bg-vault-inset px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        {title ? (
          <span className="text-micro-label truncate normal-case tracking-normal">
            {title}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
