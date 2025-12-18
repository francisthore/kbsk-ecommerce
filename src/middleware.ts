import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check session cookie directly (Edge Runtime compatible)
    const sessionCookie = request.cookies.get('better-auth.session_token');
    
    if (!sessionCookie) {
      // No session, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Note: Full role verification happens in the admin layout server component
    // This is just a first-layer check to redirect unauthenticated users
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
