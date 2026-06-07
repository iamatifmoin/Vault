"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, PartyPopper, X } from "lucide-react";
import { ShareableMilestone } from "@/components/share-cards/shareable-milestone";
import { Button } from "@/components/ui/button";
import {
  downloadElementAsPng,
  getUnseenMilestone,
  markMilestoneSeen,
} from "@/lib/share-cards";
import type { ShareableCardData } from "@/types";

interface MilestoneModalProps {
  totalSolved: number;
  cardData: ShareableCardData;
}

export function MilestoneModal({ totalSolved, cardData }: MilestoneModalProps) {
  const [milestone, setMilestone] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unseen = getUnseenMilestone(totalSolved);
    if (unseen !== null) {
      setMilestone(unseen);
      markMilestoneSeen(unseen);
    }
  }, [totalSolved]);

  if (milestone === null) {
    return null;
  }

  const milestoneData: ShareableCardData = {
    ...cardData,
    type: "milestone",
    milestoneCount: milestone,
  };

  const handleDownload = async () => {
    if (!captureRef.current || downloading) {
      return;
    }

    setDownloading(true);
    try {
      await downloadElementAsPng(
        captureRef.current,
        `vault-milestone-${milestone}.png`,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-emerald-500" />
            <h2 className="text-card-title">Milestone reached!</h2>
          </div>
          <button
            type="button"
            onClick={() => setMilestone(null)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-vault-raised hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            You hit {milestone} problems solved. Share your progress!
          </p>

          <div className="mx-auto h-[336px] w-[336px] overflow-hidden rounded-xl border border-zinc-700">
            <div
              style={{
                transform: "scale(0.42)",
                transformOrigin: "top left",
                width: "fit-content",
              }}
            >
              <ShareableMilestone data={milestoneData} />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}
              Download card
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={captureRef}
        aria-hidden
        className="pointer-events-none fixed"
        style={{ left: -9999, top: 0 }}
      >
        <ShareableMilestone data={milestoneData} />
      </div>
    </div>
  );
}
