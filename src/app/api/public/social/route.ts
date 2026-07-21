import { NextResponse } from "next/server";
import { getPublicSocialLinks } from "@/lib/public-social";

export const dynamic = "force-dynamic";

/** Public site footer social links (no auth). */
export async function GET() {
  const socialLinks = await getPublicSocialLinks();
  return NextResponse.json(
    { socialLinks },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    },
  );
}
