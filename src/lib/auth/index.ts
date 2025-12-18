import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/index";
import { v4 as uuidv4 } from "uuid";
import { nextCookies } from "better-auth/next-js";
import { sendBetterAuthVerificationEmail, sendBetterAuthWelcomeEmail } from "./email-config";
import "@/lib/env-validation";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
    resetPasswordEnabled: true,
    // Add password reset configuration here
    async sendResetPassword({ user, url }) {
      console.log('🚨 Password reset requested for:', user.email);
      console.log('🔹 Reset URL:', url);
      
      const { sendBetterAuthPasswordResetEmail } = await import("./email-config");
      await sendBetterAuthPasswordResetEmail(user, url);
      
      console.log('✅ Password reset email sent successfully');
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log('🚨 Better Auth sendVerificationEmail hook triggered!', { 
        email: user.email, 
        url 
      });
      await sendBetterAuthVerificationEmail(user, url);
    },
    async onSuccess({ user }) {
      console.log('🚨 Email verification successful, sending welcome email to:', user.email);
      await sendBetterAuthWelcomeEmail(user);
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
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  cookies: {
    sessionToken: {
      name: "auth_session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
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
    window: 60,
    max: 10,
  },
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS?.split(",").filter(Boolean) || []),
  ],
  plugins: [nextCookies()],
});
