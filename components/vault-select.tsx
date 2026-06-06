"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function VaultSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-sm border border-vault-border bg-background py-2 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-50 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        strokeWidth={1.75}
      />
    </div>
  );
}
