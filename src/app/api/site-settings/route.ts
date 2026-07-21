import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/db";
import type { SiteSettings } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getSettings());
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SiteSettings>;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Never wipe social links via this editor unless explicitly sent.
  const patch = { ...body };
  if (patch.socialLinks === undefined) {
    delete patch.socialLinks;
  }

  const settings = updateSettings(patch);
  return NextResponse.json(settings);
}
