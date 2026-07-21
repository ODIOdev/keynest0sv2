import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { resetDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function canClearPlatformData(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kn_memberships")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["platform_admin", "owner"])
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await canClearPlatformData(user.id))) {
    return NextResponse.json(
      { error: "Only platform admins or owners can clear platform data." },
      { status: 403 },
    );
  }

  const db = resetDb();
  return NextResponse.json({
    ok: true,
    message: "Platform data cleared and restored to the demo seed.",
    counts: {
      properties: db.properties.length,
      leads: db.leads.length,
      agents: db.agents.length,
      categories: db.categories.length,
      media: db.media.length,
    },
  });
}
