import { Binary } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: {
    icon: "h-4 w-4",
    text: "text-sm",
    gap: "gap-2",
  },
  md: {
    icon: "h-6 w-6",
    text: "text-xl",
    gap: "gap-2",
  },
  lg: {
    icon: "h-7 w-7",
    text: "text-2xl",
    gap: "gap-2.5",
  },
} as const;

export function AppLogo({
  size = "md",
  showWordmark = true,
  className,
}: {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  className?: string;
}) {
  const config = sizes[size];

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <Binary className={cn(config.icon, "shrink-0 text-emerald-400")} strokeWidth={1.8} />
      {showWordmark ? (
        <span className={cn(config.text, "font-semibold text-zinc-50")}>Vault</span>
      ) : null}
    </div>
  );
}
