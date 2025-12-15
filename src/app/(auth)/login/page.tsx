import { LoginForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | KBSK Trading",
  description: "Sign in to your KBSK Trading account to continue shopping.",
};

export default function LoginPage() {
  return <LoginForm />;
}
