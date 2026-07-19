import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
    "/onboarding/:path*",
    "/auth/:path*",
  ],
};
