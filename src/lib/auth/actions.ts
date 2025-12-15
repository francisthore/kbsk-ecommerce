"use server";

import {cookies, headers} from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { guests, users, verifications } from "@/lib/db/schema/index";
import { and, eq, lt, gt } from "drizzle-orm";
import { randomUUID } from "crypto";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: "strict" as const,
  path: "/" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().min(1).max(100);

export async function createGuestSession() {
  const cookieStore = await cookies();
  const existing = (await cookieStore).get("guest_session");
  if (existing?.value) {
    return { ok: true, sessionToken: existing.value };
  }

  const sessionToken = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + COOKIE_OPTIONS.maxAge * 1000);

  await db.insert(guests).values({
    sessionToken,
    expiresAt,
  });

  (await cookieStore).set("guest_session", sessionToken, COOKIE_OPTIONS);
  return { ok: true, sessionToken };
}

export async function guestSession() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("guest_session")?.value;
  if (!token) {
    return { sessionToken: null };
  }
  const now = new Date();
  await db
    .delete(guests)
    .where(and(eq(guests.sessionToken, token), lt(guests.expiresAt, now)));

  return { sessionToken: token };
}

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export async function signUp(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const data = signUpSchema.parse(rawData);

  const res = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
    },
  });

  await migrateGuestToUser();
  return { ok: true, userId: res.user?.id };
}

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const data = signInSchema.parse(rawData);

  const res = await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
    },
  });

  await migrateGuestToUser();
  return { ok: true, userId: res.user?.id };
}

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    return session?.user ?? null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function signOut() {
  await auth.api.signOut({ headers: {} });
  return { ok: true };
}

export async function mergeGuestCartWithUserCart() {
  await migrateGuestToUser();
  return { ok: true };
}

async function migrateGuestToUser() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("guest_session")?.value;
  if (!token) return;

  await db.delete(guests).where(eq(guests.sessionToken, token));
  (await cookieStore).delete("guest_session");
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    // Validate email
    const validEmail = emailSchema.parse(email);

    // Generate reset token (in production, use better-auth's built-in password reset)
    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in verification table
    await db.insert(verifications).values({
      identifier: validEmail,
      value: resetToken,
      expiresAt,
    });

    // TODO: Send actual email via email service (Resend, SendGrid, etc.)
    console.log(`Password reset link: /reset-password?token=${resetToken}`);
    
    // In production, send email here:
    // await sendEmail({
    //   to: validEmail,
    //   subject: "Reset Your KBSK Trading Password",
    //   html: `Click here to reset: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    // });

    return { ok: true };
  } catch (error) {
    console.error("Send password reset error:", error);
    throw new Error("Failed to send password reset email");
  }
}

/**
 * Verify password reset token
 */
export async function verifyResetToken(token: string) {
  try {
    const verification = await db.query.verifications.findFirst({
      where: (verifications, { eq, and, gt }) =>
        and(
          eq(verifications.value, token),
          gt(verifications.expiresAt, new Date())
        ),
    });

    return { valid: !!verification };
  } catch (error) {
    console.error("Verify reset token error:", error);
    return { valid: false };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Validate password
    passwordSchema.parse(newPassword);

    // Find valid token
    const verification = await db.query.verifications.findFirst({
      where: (verifications, { eq, and, gt }) =>
        and(
          eq(verifications.value, token),
          gt(verifications.expiresAt, new Date())
        ),
    });

    if (!verification) {
      return { ok: false, error: "Invalid or expired token" };
    }

    // Update user password using Better Auth
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, verification.identifier),
    });

    if (!user) {
      return { ok: false, error: "User not found" };
    }

    // Use Better Auth to update password
    // Note: Better Auth handles password hashing automatically
    await auth.api.updatePassword({
      body: {
        newPassword,
        currentPassword: "", // Not needed for reset flow
      },
    });

    // Delete used token
    await db
      .delete(verifications)
      .where(eq(verifications.value, token));

    return { ok: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { ok: false, error: "Failed to reset password" };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  try {
    // Find valid token
    const verification = await db.query.verifications.findFirst({
      where: (verifications, { eq, and, gt }) =>
        and(
          eq(verifications.value, token),
          gt(verifications.expiresAt, new Date())
        ),
    });

    if (!verification) {
      return { ok: false, error: "Invalid or expired verification link" };
    }

    // Update user's email verified status
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.email, verification.identifier));

    // Delete used token
    await db
      .delete(verifications)
      .where(eq(verifications.value, token));

    return { ok: true };
  } catch (error) {
    console.error("Verify email error:", error);
    return { ok: false, error: "Failed to verify email" };
  }
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(email: string) {
  try {
    // Validate email
    const validEmail = emailSchema.parse(email);

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, validEmail),
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { ok: true };
    }

    if (user.emailVerified) {
      return { ok: true, message: "Email already verified" };
    }

    // Generate new verification token
    const verificationToken = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete old tokens for this email
    await db
      .delete(verifications)
      .where(eq(verifications.identifier, validEmail));

    // Create new token
    await db.insert(verifications).values({
      identifier: validEmail,
      value: verificationToken,
      expiresAt,
    });

    // TODO: Send actual email via email service
    console.log(`Verification link: /verify-email?token=${verificationToken}`);

    // In production, send email here:
    // await sendEmail({
    //   to: validEmail,
    //   subject: "Verify Your KBSK Trading Email",
    //   html: `Click here to verify: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    // });

    return { ok: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    throw new Error("Failed to resend verification email");
  }
}
