"use client";

import type { ShareableCardData } from "@/types";
import { MilestoneModal } from "@/components/milestone-modal";

export function MilestoneTrigger({
  totalSolved,
  cardData,
}: {
  totalSolved: number;
  cardData: ShareableCardData;
}) {
  return <MilestoneModal totalSolved={totalSolved} cardData={cardData} />;
}
