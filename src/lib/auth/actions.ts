"use server";

import {cookies, headers} from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema/index";
import { and, eq, lt } from "drizzle-orm";
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
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    console.log('🔹 signUp called for email:', rawData.email);

    const data = signUpSchema.parse(rawData);

    console.log('🔹 Calling Better Auth signUpEmail...');
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    console.log('🔹 Better Auth signUpEmail response:', {
      userId: res.user?.id,
      email: res.user?.email,
      emailVerified: res.user?.emailVerified
    });

    await migrateGuestToUser();
    return { ok: true, userId: res.user?.id };
  } catch (error) {
    console.error('❌ signUp error:', error);
    throw error;
  }
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
  return { ok: true, user: res.user };
}

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    return session?.user ?? null;
  } catch (error) {
    // Log auth errors for debugging without exposing details
    console.error('Failed to get current user session:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { ok: false, error: 'Failed to sign out' };
  }
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
