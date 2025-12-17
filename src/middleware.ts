import { middleware as authMiddleware } from "./lib/auth/middleware";

export default authMiddleware;

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/register",
    // Note: /verify-email is intentionally excluded to allow users to see success message after verification
  ],
};
