"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { toast } from "sonner";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

interface GlobalSignOutButtonProps {
  children?: React.ReactNode;
  className?: string;
  redirectTo?: string;
  onSignOutStart?: () => void;
  onSignOutComplete?: () => void;
}

/**
 * Global sign-out button component that can be used anywhere in the app
 * Works with Better-Auth to properly sign out users
 */
export default function GlobalSignOutButton({ 
  children,
  className = "", 
  redirectTo = "/",
  onSignOutStart,
  onSignOutComplete
}: GlobalSignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    onSignOutStart?.();
    
    try {
      const result = await signOut();
      
      if (result.ok) {
        toast.success("Signed out successfully");
        onSignOutComplete?.();
        
        // Manually refresh session to update useSession hook immediately
        await authClient.$fetch("/api/auth/get-session");
        
        // Redirect to specified page
        router.push(redirectTo);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred during sign out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
      type="button"
    >
      {children || (isLoading ? "Signing out..." : "Sign Out")}
    </button>
  );
}
