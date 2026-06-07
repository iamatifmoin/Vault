import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
