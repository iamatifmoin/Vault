import { redirect } from "next/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  return (
    <OnboardingGuard>
      <div className="vault-app-bg text-foreground">
        <Sidebar
          profileHref={
            session.user?.login ? `/u/${session.user.login}` : "/profile"
          }
        />
        <div className="pb-20 md:pl-[220px] md:pb-0">{children}</div>
      </div>
    </OnboardingGuard>
  );
}
