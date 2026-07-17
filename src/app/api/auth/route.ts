import { NextResponse } from "next/server";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!verifyCredentials(String(body.password || ""))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
