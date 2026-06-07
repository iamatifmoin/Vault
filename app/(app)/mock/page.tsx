import { redirect } from "next/navigation";
import { MockInterviewPage } from "@/components/mock-interview-page";
import { auth } from "@/lib/auth";
import { getIndex } from "@/lib/github";
import { computeCurrentStreak } from "@/lib/stats";

export default async function MockPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);

  return (
    <MockInterviewPage
      initialIndex={index}
      streak={computeCurrentStreak(index)}
    />
  );
}
