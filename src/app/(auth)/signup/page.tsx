import { SignupForm } from "@/components/auth";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account | KBSK Trading",
  description: "Create your KBSK Trading account to start shopping.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
