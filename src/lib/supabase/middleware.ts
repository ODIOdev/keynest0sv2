import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH } from "@/lib/auth-routes";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Legacy auth URLs → /auth/*
  const legacy: Record<string, string> = {
    "/sign-in": AUTH.signIn,
    "/sign-up": AUTH.signUp,
    "/forgot-password": AUTH.forgotPassword,
    "/reset-password": AUTH.resetPassword,
  };
  if (legacy[path]) {
    const url = request.nextUrl.clone();
    url.pathname = legacy[path];
    return NextResponse.redirect(url);
  }

  const isAuthPage =
    path.startsWith("/auth/sign-in") ||
    path.startsWith("/auth/sign-up") ||
    path.startsWith("/auth/forgot-password") ||
    path.startsWith("/auth/reset-password") ||
    path.startsWith("/auth/verify-email") ||
    path.startsWith("/auth/invitation") ||
    path.startsWith("/auth/two-factor") ||
    path.startsWith("/auth/error");
  const isDashboard = path.startsWith("/dashboard");
  const isLoginAlias = path === "/dashboard/login";

  if (isLoginAlias) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH.signIn;
    return NextResponse.redirect(url);
  }

  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH.signIn;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const stayWhenAuthed =
    path.startsWith("/auth/reset-password") ||
    path.startsWith("/auth/two-factor") ||
    path.startsWith("/auth/verify-email") ||
    path.startsWith("/auth/invitation") ||
    path.startsWith("/auth/error");

  if (isAuthPage && user && !stayWhenAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
