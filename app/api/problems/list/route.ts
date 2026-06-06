import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIndex } from "@/lib/github";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const index = await getIndex(session.accessToken);
  return NextResponse.json({ index });
}
