import { Binary } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: {
    icon: "h-5 w-5",
    text: "text-base",
    gap: "gap-2",
  },
  md: {
    icon: "h-8 w-8",
    text: "text-2xl",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-10 w-10",
    text: "text-3xl",
    gap: "gap-3",
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
      <Binary className={cn(config.icon, "shrink-0 text-vault-brand")} strokeWidth={1.8} />
      {showWordmark ? (
        <span className={cn(config.text, "font-semibold text-lg text-foreground")}>Vault</span>
      ) : null}
    </div>
  );
}
