"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getExtensionStoreUrl,
  queryExtensionStatus,
  type ExtensionStatus,
} from "@/lib/extension";
import { cn } from "@/lib/utils";

const REFRESH_MS = 30_000;

export function ExtensionStatusBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState<ExtensionStatus>({ status: "checking" });

  const refresh = useCallback(() => {
    void queryExtensionStatus().then(setStatus);
  }, []);

  useEffect(() => {
    refresh();

    const interval = window.setInterval(refresh, REFRESH_MS);
    const onVisibility = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  if (status.status === "unavailable") {
    return null;
  }

  if (status.status === "checking") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-vault-surface px-3 py-1 text-xs text-muted-foreground",
          className,
        )}
        aria-label="Checking extension status"
      >
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
        <span className="hidden sm:inline">Checking extension…</span>
      </div>
    );
  }

  if (status.status === "connected") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-emerald-800/40 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-400",
          className,
        )}
        title={
          status.username
            ? `Auto-capture on as @${status.username}`
            : "Auto-capture on"
        }
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="hidden sm:inline">Auto-capture on</span>
      </div>
    );
  }

  const storeUrl = getExtensionStoreUrl();
  const href = status.status === "not-installed" ? storeUrl : "/extension-success";
  const label =
    status.status === "not-installed"
      ? "Install to start tracking"
      : "Connect to start tracking";

  if (!href) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-400",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="hidden sm:inline">Not tracking</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      target={status.status === "not-installed" ? "_blank" : undefined}
      rel={status.status === "not-installed" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-400 transition-colors hover:border-amber-700/60 hover:bg-amber-950/60 hover:text-amber-300",
        className,
      )}
      title={label}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
