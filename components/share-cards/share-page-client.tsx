"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Download, Loader2, Share2 } from "lucide-react";
import { ShareableMilestone } from "@/components/share-cards/shareable-milestone";
import { ShareableReadiness } from "@/components/share-cards/shareable-readiness";
import { ShareableYearReview } from "@/components/share-cards/shareable-year-review";
import { ShareCardCapture } from "@/components/share-cards/share-card-capture";
import { Button } from "@/components/ui/button";
import { getProfileShareUrl } from "@/lib/share-cards";
import type { CompanyTierTarget, ShareableCardData } from "@/types";

interface SharePageClientProps {
  cardData: ShareableCardData;
  monthlyCounts: { month: string; count: number }[];
  targetTier: CompanyTierTarget;
  username: string;
}

export function SharePageClient({
  cardData,
  monthlyCounts,
  targetTier,
  username,
}: SharePageClientProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getProfileShareUrl(username);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const year = new Date().getFullYear();
  const milestoneData: ShareableCardData = {
    ...cardData,
    type: "milestone",
    milestoneCount: cardData.totalSolved,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Download shareable stat cards or copy your public profile link.
        </p>
        <Button variant="outline" onClick={handleCopyLink}>
          {copied ? <Check className="text-emerald-500" /> : <Copy />}
          Copy link
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-emerald-500" />
          <h2 className="text-section-title">Year in Review</h2>
        </div>
        <ShareCardCapture
          filename={`vault-year-review-${year}.png`}
          previewScale={0.28}
          previewClassName="h-[176px]"
        >
          <ShareableYearReview
            data={cardData}
            monthlyCounts={monthlyCounts}
            year={year}
          />
        </ShareCardCapture>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-emerald-500" />
          <h2 className="text-section-title">Interview Readiness</h2>
        </div>
        <ShareCardCapture
          filename="vault-readiness.png"
          previewScale={0.42}
          previewClassName="mx-auto h-[336px] w-[336px]"
        >
          <ShareableReadiness data={cardData} targetTier={targetTier} />
        </ShareCardCapture>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-emerald-500" />
          <h2 className="text-section-title">Milestone</h2>
        </div>
        <ShareCardCapture
          filename={`vault-milestone-${cardData.totalSolved}.png`}
          previewScale={0.42}
          previewClassName="mx-auto h-[336px] w-[336px]"
        >
          <ShareableMilestone data={milestoneData} />
        </ShareCardCapture>
      </section>
    </div>
  );
}