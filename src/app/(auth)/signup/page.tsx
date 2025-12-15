import { SignupForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | KBSK Trading",
  description: "Create your KBSK Trading account to start shopping.",
};

export default function SignupPage() {
  return <SignupForm />;
}
