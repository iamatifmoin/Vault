import { cn } from "@/lib/utils";

export function AnimatedMain({
  children,
  className,
  grid = false,
}: {
  children: React.ReactNode;
  className?: string;
  grid?: boolean;
}) {
  return (
    <main
      className={cn(
        "page-enter",
        grid && "vault-grid-bg",
        className,
      )}
    >
      {children}
    </main>
  );
}
