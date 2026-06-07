import type { OnboardingData } from "@/types";

export const ONBOARDING_COMPLETED_KEY = "vault_onboarding_completed";
export const ONBOARDING_DATA_KEY = "vault_onboarding_data";
export const TARGET_COMPANIES_KEY = "vault_target_companies";

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

export function readOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ONBOARDING_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingData;
  } catch {
    return null;
  }
}

export function saveOnboardingData(data: OnboardingData): void {
  localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  localStorage.setItem(TARGET_COMPANIES_KEY, JSON.stringify(data.targetCompanies));
}

export const SHEET_OPTIONS = [
  {
    id: "neetcode-150",
    label: "NeetCode 150",
    description: "Curated 150 problems covering all core interview patterns.",
  },
  {
    id: "neetcode-roadmap",
    label: "NeetCode Roadmap",
    description: "Structured path from fundamentals to advanced topics.",
  },
  {
    id: "blind-75",
    label: "Blind 75",
    description: "Essential 75 problems trusted by the community.",
  },
  {
    id: "strivers-sde",
    label: "Striver's SDE Sheet",
    description: "191 problems tailored for product company interviews.",
  },
  {
    id: "strivers-a2z",
    label: "Striver's A2Z DSA Sheet",
    description: "Complete beginner-to-advanced DSA journey.",
  },
  {
    id: "strivers-cp",
    label: "Striver's CP Sheet",
    description: "Competitive programming focused problem set.",
  },
  {
    id: "none",
    label: "None / Custom",
    description: "Follow your own plan or mix multiple sheets.",
  },
] as const;
