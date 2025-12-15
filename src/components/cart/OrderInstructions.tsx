"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { saveOrderInstructions } from "@/lib/actions/cart";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export default function OrderInstructions() {
  const [isOpen, setIsOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const debouncedInstructions = useDebounce(instructions, 300);

  useEffect(() => {
    if (debouncedInstructions) {
      handleSave();
    }
  }, [debouncedInstructions]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const result = await saveOrderInstructions(debouncedInstructions);
      
      if (result.success) {
        // Silent save - no toast for auto-save
      } else {
        toast.error(result.error || "Failed to save instructions");
      }
    } catch (error) {
      toast.error("Failed to save instructions");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-b border-[var(--color-gray-dark)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-body-medium font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta)] focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>Order instructions</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="pb-6">
          <div className="relative">
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add special instructions for your order (e.g., delivery preferences, gift message, etc.)"
              rows={4}
              className="w-full rounded-lg border border-[var(--color-gray-dark)] bg-white px-4 py-3 text-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              maxLength={500}
            />
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-caption text-[var(--color-text-muted)]">
                <FileText className="h-4 w-4" />
                <span>{instructions.length}/500 characters</span>
              </div>
              
              {isSaving && (
                <span className="text-caption text-[var(--color-text-secondary)]">
                  Saving...
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
