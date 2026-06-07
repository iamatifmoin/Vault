"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Chrome, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const VAULT_EXTENSION_INSTALLED_KEY = "vault_extension_installed";

type ExtensionStatus = "checking" | "installed" | "not-installed";

function useExtensionDetection(): ExtensionStatus {
  const [status, setStatus] = useState<ExtensionStatus>("checking");

  useEffect(() => {
    const stored = localStorage.getItem(VAULT_EXTENSION_INSTALLED_KEY);
    if (stored === "true") {
      setStatus("installed");
      return;
    }

    const timer = window.setTimeout(() => setStatus("not-installed"), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return status;
}

interface ExtensionStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function ExtensionStep({ onNext, onSkip }: ExtensionStepProps) {
  const status = useExtensionDetection();
  const extensionId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
  const storeUrl = extensionId
    ? `https://chrome.google.com/webstore/detail/vault/${extensionId}`
    : undefined;

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
      </div>
    );
  }

  if (status === "installed") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950 ring-2 ring-emerald-700">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Extension installed ✓</h2>
        <p className="max-w-xs text-sm text-zinc-400">
          Vault will automatically capture your solutions from LeetCode,
          Codeforces, CodeChef, and GFG.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="min-w-[140px] bg-emerald-500 text-white hover:bg-emerald-600"
        >
          Continue →
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-700">
        <Chrome className="h-8 w-8 text-zinc-400" />
      </div>
      <div>
        <h2 className="mb-2 text-xl font-bold text-white">
          Install the Vault Extension
        </h2>
        <p className="max-w-sm text-sm text-zinc-400">
          The extension automatically captures your accepted submissions from
          LeetCode, Codeforces, CodeChef, and GFG — no manual copy-paste needed.
        </p>
      </div>

      {storeUrl ? (
        <Button
          type="button"
          size="lg"
          asChild
          className={cn(
            "gap-2 bg-emerald-500 text-white hover:bg-emerald-600",
          )}
        >
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const poll = window.setInterval(() => {
                const stored = localStorage.getItem(VAULT_EXTENSION_INSTALLED_KEY);
                if (stored === "true") {
                  window.clearInterval(poll);
                  window.location.reload();
                }
              }, 1500);
              window.setTimeout(() => window.clearInterval(poll), 30_000);
            }}
          >
            <Download className="h-4 w-4" />
            Install Chrome Extension
          </a>
        </Button>
      ) : (
        <p className="text-sm text-zinc-500">
          Chrome Web Store link unavailable — install the unpacked extension locally.
        </p>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        Skip for now — I&apos;ll add problems manually
      </button>
    </div>
  );
}
