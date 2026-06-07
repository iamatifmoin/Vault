import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl
                      border border-zinc-700/50 bg-zinc-900">
        <Icon className="h-6 w-6 text-zinc-500" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1.5 text-sm font-medium text-zinc-200">{title}</h3>
      <p className="mb-5 text-sm text-zinc-500 max-w-xs leading-relaxed">{description}</p>
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700
                       border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200
                       transition-colors duration-150"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700
                       border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200
                       transition-colors duration-150"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
