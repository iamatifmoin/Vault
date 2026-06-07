import type { StudyPlan } from "@/types";

export const STUDY_PLAN_KEY = "vault_study_plan";

export function readStudyPlan(): StudyPlan | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STUDY_PLAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudyPlan;
  } catch {
    return null;
  }
}

export function saveStudyPlan(plan: StudyPlan): void {
  localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(plan));
}

export function clearStudyPlan(): void {
  localStorage.removeItem(STUDY_PLAN_KEY);
}
