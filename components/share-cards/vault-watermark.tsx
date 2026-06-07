import { Binary } from "lucide-react";
import { SHARE_BASE_URL } from "@/lib/share-cards";

export function VaultWatermark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-zinc-400">
      <Binary className="text-emerald-500" size={compact ? 16 : 20} strokeWidth={1.8} />
      <div className="flex flex-col">
        <span
          className="font-semibold text-white"
          style={{ fontSize: compact ? 12 : 14 }}
        >
          Vault
        </span>
        <span
          className="font-mono text-zinc-500"
          style={{ fontSize: compact ? 10 : 11 }}
        >
          {SHARE_BASE_URL}
        </span>
      </div>
    </div>
  );
}
