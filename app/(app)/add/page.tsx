import { redirect } from "next/navigation";
import { AddProblemPage } from "@/components/add-problem-page";
import { auth } from "@/lib/auth";
import { getIndex } from "@/lib/github";
import { computeCurrentStreak } from "@/lib/stats";

export default async function AddPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);

  return <AddProblemPage streak={computeCurrentStreak(index)} />;
}
