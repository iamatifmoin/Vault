"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isOnboardingCompleted } from "@/lib/onboarding";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isOnboardingCompleted()) {
      router.replace("/onboarding");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return children;
}
