import { redirect } from "next/navigation";

// Redirect /register to /signup for consistency
export default function RegisterPage() {
  redirect("/signup");
}
