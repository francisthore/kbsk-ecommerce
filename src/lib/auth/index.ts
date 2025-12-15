import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/index";
import { v4 as uuidv4 } from "uuid";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.authAccounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      // TODO: Implement email sending service (e.g., Resend, SendGrid)
      console.log(`Verification email for ${user.email}: ${token}`);
      // In production, send actual email here
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  sessions: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  cookies: {
    sessionToken: {
      name: "auth_session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Changed from 'strict' to 'lax' for OAuth compatibility
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: () => uuidv4(),
  },
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 10, // 10 requests per window
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
  plugins: [nextCookies()],
});
