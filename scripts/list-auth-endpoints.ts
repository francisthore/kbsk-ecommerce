/**
 * Better Auth Active Endpoints
 * All endpoints are prefixed with /api/auth/
 */

const BETTER_AUTH_ENDPOINTS = {
  // Health & Status
  "GET /api/auth/ok": "Health check endpoint",
  
  // Session Management
  "GET /api/auth/get-session": "Get current session",
  "POST /api/auth/sign-out": "Sign out user",
  
  // Email & Password Authentication
  "POST /api/auth/sign-up/email": "Sign up with email/password",
  "POST /api/auth/sign-in/email": "Sign in with email/password",
  
  // Email Verification
  "POST /api/auth/send-verification-email": "Resend verification email",
  "GET /api/auth/verify-email": "Verify email with token",
  
  // Password Reset (configured in your auth)
  "POST /api/auth/forget-password": "Request password reset",
  "POST /api/auth/reset-password": "Reset password with token",
  
  // Social Providers (if enabled)
  "GET /api/auth/sign-in/google": "Sign in with Google",
  "GET /api/auth/callback/google": "Google OAuth callback",
  
  // CSRF Protection
  "GET /api/auth/csrf": "Get CSRF token",
} as const;

console.log("\n🔐 Better Auth Active Endpoints\n");
console.log("Base URL: http://localhost:3000\n");

Object.entries(BETTER_AUTH_ENDPOINTS).forEach(([endpoint, description]) => {
  console.log(`✅ ${endpoint}`);
  console.log(`   ${description}\n`);
});

console.log("\n💡 Test an endpoint:");
console.log("   curl http://localhost:3000/api/auth/ok");
console.log("\n💡 Test forget-password:");
console.log('   curl -X POST http://localhost:3000/api/auth/forget-password \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        -d \'{"email":"test@example.com","redirectTo":"http://localhost:3000/reset-password"}\'');
