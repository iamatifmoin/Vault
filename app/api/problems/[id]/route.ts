import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIndex, getProblemFile } from "@/lib/github";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const index = await getIndex(session.accessToken);
  const match = index.find((item) => item.id === context.params.id);

  if (!match) {
    return NextResponse.json({ error: "Problem not found." }, { status: 404 });
  }

  const file = await getProblemFile(session.accessToken, match.file_path);

  if (!file) {
    return NextResponse.json({ error: "Problem file not found." }, { status: 404 });
  }

  return NextResponse.json(file);
}
