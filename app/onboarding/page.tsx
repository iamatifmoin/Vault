"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { ExtensionStep } from "@/components/onboarding/extension-step";
import { Button } from "@/components/ui/button";
import { getCompaniesByTier } from "@/lib/company-data";
import {
  isOnboardingCompleted,
  saveOnboardingData,
  SHEET_OPTIONS,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import type { CompanyTier, OnboardingData } from "@/types";

const TIERS: CompanyTier[] = ["FAANG", "Indian Unicorn", "Service"];
const MAX_COMPANIES = 5;
const TOTAL_STEPS = 4;

function defaultPlacementDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().slice(0, 10);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [sheet, setSheet] = useState("");
  const [placementDate, setPlacementDate] = useState(defaultPlacementDate);
  const [dailyHours, setDailyHours] = useState(2);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [companyError, setCompanyError] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isOnboardingCompleted()) {
      router.replace("/dashboard");
      return;
    }

    setHydrated(true);
  }, [router]);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 2:
        return "Which sheet are you following?";
      case 3:
        return "When is your placement season?";
      case 4:
        return "Which companies are you targeting?";
      default:
        return "";
    }
  }, [step]);

  function goForward() {
    if (step === TOTAL_STEPS) {
      if (targetCompanies.length > MAX_COMPANIES) {
        setCompanyError(true);
        return;
      }

      const data: OnboardingData = {
        completed: true,
        sheet,
        placementDate,
        targetCompanies,
        dailyHours,
      };

      saveOnboardingData(data);
      router.replace("/dashboard");
      return;
    }

    if (step === 2 && !sheet) return;

    setDirection("forward");
    setStep((current) => current + 1);
  }

  function goBack() {
    setDirection("back");
    setStep((current) => Math.max(1, current - 1));
  }

  function goToSheetStep() {
    setDirection("forward");
    setStep(2);
  }

  function toggleCompany(id: string) {
    setTargetCompanies((current) => {
      if (current.includes(id)) {
        setCompanyError(false);
        return current.filter((entry) => entry !== id);
      }

      if (current.length >= MAX_COMPANIES) {
        setCompanyError(true);
        return current;
      }

      setCompanyError(false);
      return [...current, id];
    });
  }

  if (!hydrated) {
    return null;
  }

  const canContinue =
    step === 2 ? Boolean(sheet) : step === 3 ? Boolean(placementDate) : true;

  return (
    <main className="page-enter flex min-h-screen flex-col items-center px-6 py-10 md:py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-10 flex flex-col items-center">
          <AppLogo size="md" />
          <div className="mt-8 flex items-center gap-3">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map(
              (index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs transition-colors",
                      step === index
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : step > index
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                          : "border-border bg-zinc-900 text-zinc-500",
                    )}
                  >
                    {step > index ? <Check className="h-3.5 w-3.5" /> : index}
                  </div>
                  {index < TOTAL_STEPS ? (
                    <div
                      className={cn(
                        "h-px w-8 transition-colors md:w-12",
                        step > index ? "bg-emerald-500/50" : "bg-border",
                      )}
                    />
                  ) : null}
                </div>
              ),
            )}
          </div>
        </div>

        <div
          key={step}
          className={cn(
            "animate-fade-in-up",
            direction === "back" && "[animation-direction:reverse]",
          )}
        >
          {step === 1 ? (
            <ExtensionStep onNext={goToSheetStep} onSkip={goToSheetStep} />
          ) : (
            <>
              <h1 className="text-page-title text-center">{stepTitle}</h1>

              {step === 2 ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {SHEET_OPTIONS.map((option) => {
                    const selected = sheet === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSheet(option.id)}
                        className={cn(
                          "surface-card relative flex flex-col items-start gap-2 p-4 text-left transition-colors hover:bg-vault-raised",
                          selected &&
                            "border-emerald-500 ring-1 ring-emerald-500/30",
                        )}
                      >
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        ) : null}
                        <span className="text-card-title pr-6">
                          {option.label}
                        </span>
                        <span className="text-sm leading-6 text-muted-foreground">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="mt-8 space-y-10">
                  <div>
                    <label
                      htmlFor="placement-date"
                      className="text-sm text-muted-foreground"
                    >
                      My placement date is
                    </label>
                    <input
                      id="placement-date"
                      type="date"
                      value={placementDate}
                      onChange={(event) =>
                        setPlacementDate(event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-border bg-zinc-900 px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="daily-hours"
                      className="text-sm text-muted-foreground"
                    >
                      I can practice{" "}
                      <span className="font-mono text-foreground">
                        {dailyHours}
                      </span>{" "}
                      hours/day
                    </label>
                    <input
                      id="daily-hours"
                      type="range"
                      min={1}
                      max={8}
                      step={0.5}
                      value={dailyHours}
                      onChange={(event) =>
                        setDailyHours(Number(event.target.value))
                      }
                      className="onboarding-range mt-4 w-full"
                    />
                    <div className="mt-2 flex justify-between font-mono text-xs text-zinc-500">
                      <span>1h</span>
                      <span>8h</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="mt-8 space-y-8">
                  <p className="text-center text-sm text-muted-foreground">
                    Select up to {MAX_COMPANIES} companies to track your
                    readiness.
                  </p>

                  {companyError ? (
                    <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
                      You can select at most {MAX_COMPANIES} companies.
                    </p>
                  ) : null}

                  {TIERS.map((tier) => (
                    <section key={tier}>
                      <h2 className="text-micro-label mb-3">{tier}</h2>
                      <div className="flex flex-wrap gap-2">
                        {getCompaniesByTier(tier).map((company) => {
                          const selected = targetCompanies.includes(company.id);

                          return (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => toggleCompany(company.id)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-sm transition-colors",
                                selected
                                  ? "bg-emerald-500 text-white"
                                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                              )}
                            >
                              {company.name}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  <p className="text-center font-mono text-xs text-muted-foreground">
                    {targetCompanies.length} / {MAX_COMPANIES} selected
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {step > 1 ? (
          <div className="mt-10 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={step === 1}
              className="min-w-[100px]"
            >
              Back
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={goForward}
              disabled={!canContinue}
              className="min-w-[140px] bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {step === TOTAL_STEPS ? (
                <>
                  Complete Setup
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
