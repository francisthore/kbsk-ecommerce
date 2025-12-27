"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { toast } from "sonner";
import { useState } from "react";

interface SignOutButtonProps {
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "dropdown";
}

export default function SignOutButton({ 
  className = "", 
  showIcon = true,
  variant = "default" 
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await signOut();
      
      if (result.ok) {
        toast.success("Signed out successfully");
        // Redirect to home page
        router.push("/");
        router.refresh();
      } else {
        toast.error("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred during sign out");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "dropdown") {
    return (
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
