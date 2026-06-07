import { redirect } from "next/navigation";
import { Binary, Brain, Target, Zap } from "lucide-react";
import { LoginButton } from "@/components/login-button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

const features = [
  {
    icon: Zap,
    title: "Auto-capture",
    description:
      "Install the extension once. Every accepted submission saves automatically — no copy-paste, no manual entry.",
    accent: "text-emerald-400",
    bg: "bg-emerald-950/30",
  },
  {
    icon: Brain,
    title: "AI-powered analysis",
    description:
      "Get time/space complexity, approach classification, and specific feedback on your code. Not generic advice.",
    accent: "text-blue-400",
    bg: "bg-blue-950/30",
  },
  {
    icon: Target,
    title: "Interview readiness score",
    description:
      "A single 0–100 score that reflects your topic coverage, difficulty mix, and code quality. Know where you stand.",
    accent: "text-purple-400",
    bg: "bg-purple-950/30",
  },
];

export default async function LoginPage() {
  const session = await auth();

  if (session?.accessToken) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-vault-bg text-foreground">
      <div className="mx-auto max-w-[1100px] px-6">
        <section className="flex flex-col items-center pt-20 pb-16 text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 ring-1 ring-emerald-800/60">
            <Binary className="h-5 w-5 text-emerald-500" strokeWidth={1.75} />
          </div>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
            Your code stays in your GitHub repo
          </div>

          <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your placement prep,
            <br />
            <span className="text-emerald-400">finally in one place.</span>
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-zinc-400">
            Vault captures your solutions from LeetCode, Codeforces, and CodeChef
            automatically. Track your progress, identify weak spots, and know
            exactly where you stand.
          </p>

          <LoginButton variant="landing" />
          <p className="mt-3 text-xs text-zinc-600">No email required · Free to start</p>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description, accent, bg }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors duration-200 hover:border-zinc-700"
            >
              <div
                className={cn(
                  "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
                  bg,
                )}
              >
                <Icon className={cn("h-5 w-5", accent)} strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-100">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
            </div>
          ))}
        </section>

        <section className="mb-16">
          <div className="overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <div className="mx-auto rounded-md bg-zinc-800 px-3 py-1 text-xs text-zinc-500">
                vaultbyatif.vercel.app/dashboard
              </div>
            </div>
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20">
              <p className="text-sm text-zinc-600">Dashboard preview</p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-2 border-t border-zinc-800/60 py-8">
          <p className="text-sm text-zinc-600">
            Built for Indian CS students grinding for placements.
          </p>
          <p className="text-xs text-zinc-700">
            Your data stays in your GitHub repo. Always.
          </p>
        </footer>
      </div>
    </main>
  );
}
