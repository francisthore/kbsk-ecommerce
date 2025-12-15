import { NextRequest, NextResponse } from "next/server";


/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = [
  "/account",
  "/dashboard",
  "/admin",
];

/**
 * Routes that should redirect to home if already authenticated
 */
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/register",
];

/**
 * Check if a path matches any of the route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

/**
 * Authentication middleware
 * Protects routes and handles redirects for authenticated/unauthenticated users
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  try {
    // Check for session cookie (Better Auth uses 'better-auth.session_token' by default)
    const sessionToken = request.cookies.get('better-auth.session_token');
    const isAuthenticated = !!sessionToken?.value;

    // Check if route requires authentication
    if (matchesRoute(pathname, PROTECTED_ROUTES)) {
      if (!isAuthenticated) {
        // Redirect to login with return URL
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      // Admin routes - you'll need to add role to the cookie or handle this differently
      if (pathname.startsWith("/admin")) {
        // TODO: Add role-based access control
        // For role checking, you'd need to either:
        // 1. Encode role in a separate cookie
        // 2. Use a lightweight JWT decode in edge runtime
        // 3. Move admin check to the page/layout component
      }
    }

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && matchesRoute(pathname, AUTH_ROUTES)) {
      const redirectTo = searchParams.get("redirect") || "/";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Allow checkout for both authenticated and guest users
    if (pathname.startsWith("/checkout")) {
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.next();
  }
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/register",
  ],
  runtime: 'edge',
};
