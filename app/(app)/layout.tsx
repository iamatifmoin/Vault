import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="pb-20 md:pl-[220px] md:pb-0">{children}</div>
    </div>
  );
}
