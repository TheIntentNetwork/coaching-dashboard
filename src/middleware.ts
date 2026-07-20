import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Guest-only auth screens (redirect away if already signed in). */
const GUEST_ONLY_ROUTES = new Set(["/sign-in", "/create-account", "/forgot-password"]);

/** Accessible without a prior session (confirm creates the session). */
const PUBLIC_AUTH_ROUTES = new Set([
  "/sign-in",
  "/create-account",
  "/forgot-password",
  "/update-password",
]);

const PUBLIC_PREFIXES = ["/imgs", "/images", "/_next", "/favicon.ico", "/auth"];

function isPublicPath(pathname: string) {
  if (PUBLIC_AUTH_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (!user && !isPublicPath(pathname) && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Password setup must stay reachable after /auth/confirm establishes a session.
  if (user && (GUEST_ONLY_ROUTES.has(pathname) || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
