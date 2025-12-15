import { ResetPasswordForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | KBSK Trading",
  description: "Create a new password for your KBSK Trading account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
