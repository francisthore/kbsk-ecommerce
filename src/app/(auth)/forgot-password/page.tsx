import { ForgotPasswordForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | KBSK Trading",
  description: "Reset your KBSK Trading account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
