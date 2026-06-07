import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LibraryPageClient } from "@/components/library-page-client";
import { auth } from "@/lib/auth";
import { getIndex } from "@/lib/github";
import { computeCurrentStreak } from "@/lib/stats";

export default async function LibraryPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);

  return (
    <Suspense fallback={null}>
      <LibraryPageClient initialIndex={index} streak={computeCurrentStreak(index)} />
    </Suspense>
  );
}
