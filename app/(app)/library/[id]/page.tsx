import { notFound, redirect } from "next/navigation";
import { ProblemViewClient } from "@/components/problem-view-client";
import { auth } from "@/lib/auth";
import { getIndex, getProblemFile } from "@/lib/github";

export default async function ProblemViewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const index = await getIndex(session.accessToken);
  const entry = index.find((item) => item.id === params.id);

  if (!entry) {
    notFound();
  }

  const file = await getProblemFile(session.accessToken, entry.file_path);

  if (!file) {
    notFound();
  }

  return (
    <ProblemViewClient
      initialProblem={file.problem}
      problemStatement={file.problemStatement}
    />
  );
}
