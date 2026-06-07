import { redirect } from "next/navigation";
import { Brain, Target, Zap } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { LoginButton } from "@/components/login-button";
import { auth } from "@/lib/auth";

const features = [
  {
    icon: Zap,
    title: "Auto-capture",
    description:
      "Install the extension once. Every accepted submission saves automatically — no copy-paste, no manual entry.",
  },
  {
    icon: Brain,
    title: "AI-powered analysis",
    description:
      "Get time/space complexity, approach classification, and specific feedback on your code. Not generic advice.",
  },
  {
    icon: Target,
    title: "Interview readiness score",
    description:
      "A single 0–100 score that reflects your topic coverage, difficulty mix, and code quality. Know where you stand.",
  },
];

export default async function LoginPage() {
  const session = await auth();

  if (session?.accessToken) {
    redirect("/dashboard");
  }

  return (
    <main className="page-enter min-h-screen bg-background text-foreground md:flex">
      <section className="relative flex w-full flex-col justify-between overflow-hidden border-b border-border bg-vault-surface px-8 py-8 md:w-[55%] md:border-b-0 md:border-r md:px-16 md:py-16">
        <div aria-hidden className="vault-brand-bleed" />
        <div className="relative">
          <AppLogo size="md" />
        </div>

        <div className="relative my-auto max-w-lg space-y-10 py-16 md:py-0">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-vault-raised px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-vault-brand" />
              Your code stays in your GitHub repo
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-[40px]">
              Your placement prep,
              <br />
              <span className="text-vault-brand">finally in one place.</span>
            </h1>
          </div>

          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group flex items-start gap-4">
                  <div className="rounded-md border border-border bg-vault-raised p-2.5 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-px">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h2 className="text-card-title">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-micro-label">
          Built for Indian CS students grinding for placements.
        </p>
      </section>

      <section className="flex w-full items-center justify-center px-8 py-16 md:w-[45%] md:px-16">
        <div className="surface-card relative w-full max-w-md overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-vault-brand/60" />
          <div className="mb-8">
            <p className="text-micro-label">GitHub OAuth</p>
            <h2 className="text-page-title mt-3">Log into Vault</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Vault captures your solutions from LeetCode, Codeforces, and CodeChef
              automatically. Track your progress, identify weak spots, and know
              exactly where you stand.
            </p>
          </div>

          <div className="rounded-md border border-border bg-vault-bg p-4">
            <LoginButton />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No email required · Free to start
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
