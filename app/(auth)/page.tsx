import { redirect } from "next/navigation";
import { BrainCircuit, Repeat2, Vault } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { LoginButton } from "@/components/login-button";
import { auth } from "@/lib/auth";

const features = [
  {
    icon: Vault,
    title: "GitHub Auto-Sync",
    description:
      "Automatically push your solutions and keep every attempt inside your own repository.",
  },
  {
    icon: BrainCircuit,
    title: "AI Complexity Analysis",
    description:
      "Get precise feedback on time complexity, bottlenecks, and better patterns.",
  },
  {
    icon: Repeat2,
    title: "Attempt History",
    description:
      "Track every revision from brute force to optimal without losing your thinking trail.",
  },
];

export default async function LoginPage() {
  const session = await auth();

  if (session?.accessToken) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background text-foreground md:flex">
      <section className="flex w-full flex-col justify-between border-b border-border bg-vault-surface px-8 py-8 md:w-[55%] md:border-b-0 md:border-r md:px-16 md:py-16">
        <AppLogo size="md" />

        <div className="my-auto max-w-lg space-y-12 py-16 md:py-0">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-[40px]">
            Your DSA practice,
            <br />
            properly organised.
          </h1>

          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="rounded-md border border-border bg-vault-raised p-2 text-muted-foreground">
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

        <p className="text-micro-label">Own the repo. Own the history.</p>
      </section>

      <section className="flex w-full items-center justify-center px-8 py-16 md:w-[45%] md:px-16">
        <div className="surface-card relative w-full max-w-md overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-vault-brand/60" />
          <div className="mb-8">
            <p className="text-micro-label">GitHub OAuth</p>
            <h2 className="text-page-title mt-3">Log into Vault</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in with GitHub to fetch problems, analyze attempts, and save
              everything directly into your own
              {" "}
              <span className="text-foreground">Data Structures &amp; Algorithms</span>
              {" "}
              repository.
            </p>
          </div>

          <div className="rounded-md border border-border bg-vault-bg p-4">
            <LoginButton />
            <p className="text-micro-label mt-4 text-center">
              Requires
              {" "}
              <span className="text-foreground">repo</span>
              {" "}
              scope
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
