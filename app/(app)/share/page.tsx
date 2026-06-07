import { redirect } from "next/navigation";
import { AnimatedMain } from "@/components/animated-main";
import { PageHeader } from "@/components/page-header";
import { SharePageClient } from "@/components/share-cards/share-page-client";
import { auth } from "@/lib/auth";
import { getIndex } from "@/lib/github";
import {
  buildShareableCardData,
  computeMonthlyCounts,
} from "@/lib/share-cards";
import { computeCurrentStreak } from "@/lib/stats";
import type { CompanyTierTarget } from "@/types";

export default async function SharePage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);
  const username = session.user?.login ?? "user";
  const avatarUrl = session.user?.image ?? "";
  const targetTier: CompanyTierTarget = "FAANG";
  const cardData = buildShareableCardData(
    index,
    { username, avatarUrl },
    targetTier,
  );
  const monthlyCounts = computeMonthlyCounts(index);
  const streak = computeCurrentStreak(index);

  return (
    <div className="min-h-screen">
      <PageHeader title="Share" subtitle="Share your DSA progress" streak={streak} />

      <AnimatedMain className="mx-auto max-w-3xl p-container-padding pb-12">
        <SharePageClient
          cardData={cardData}
          monthlyCounts={monthlyCounts}
          targetTier={targetTier}
          username={username}
        />
      </AnimatedMain>
    </div>
  );
}
