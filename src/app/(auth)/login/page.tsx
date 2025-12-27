import { LoginForm } from "@/components/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | KBSK Trading",
  description: "Sign in to your KBSK Trading account to continue shopping.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // Check if user is already logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    // User is already logged in, redirect them
    const params = await searchParams;
    const redirectTo = params.redirect || "/";
    redirect(redirectTo);
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
