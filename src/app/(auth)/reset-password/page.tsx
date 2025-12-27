import { ResetPasswordForm } from "@/components/auth";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | KBSK Trading",
  description: "Create a new password for your KBSK Trading account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
