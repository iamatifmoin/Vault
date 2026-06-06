import { cn } from "@/lib/utils";
import type { Platform } from "@/types";

const icons: Record<Platform, React.ReactNode> = {
  leetcode: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.414 2.086a2 2 0 0 0-2.828 0L2.086 10.586a2 2 0 0 0 0 2.828l8.5 8.5a2 2 0 0 0 2.828 0l8.5-8.5a2 2 0 0 0 0-2.828l-8.5-8.5zM12 6.343L17.657 12 12 17.657 6.343 12 12 6.343z" />
    </svg>
  ),
  codeforces: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M4.5 3h15a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-15A1.5 1.5 0 0 1 4.5 3zm2 4.5v9h3v-3.75L12 16.5V7.5l-2.5 2.25V7.5H6.5zm9 0v9H19v-3.75L16.5 16.5V7.5 14 9.75V7.5h1.5z" />
    </svg>
  ),
  codechef: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-7v4h3l-4 7z" />
    </svg>
  ),
};

export function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 text-muted-foreground", className)}>
      {icons[platform]}
    </span>
  );
}
