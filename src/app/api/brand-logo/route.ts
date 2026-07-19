import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateSettings } from "@/lib/db";

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { brandLogo?: string | null };
  const brandLogo =
    typeof body.brandLogo === "string" ? body.brandLogo.trim() : "";

  const settings = updateSettings({ brandLogo });
  return NextResponse.json(settings);
}
