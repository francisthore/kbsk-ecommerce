/**
 * Payfast Redirect Form Component
 * Auto-submits a hidden form to redirect user to Payfast payment page
 * Must be a client component for form auto-submission
 */

"use client";

import { useEffect, useRef } from 'react';
import { PayfastPayloadArray } from '@/lib/actions/payfast';
import { payfastConfig } from '@/lib/payfast/config';

interface PayfastRedirectFormProps {
  payload: PayfastPayloadArray;
  onSubmit?: () => void;
}

export default function PayfastRedirectForm({ payload, onSubmit }: PayfastRedirectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    // Auto-submit form once mounted (prevent double submission)
    if (formRef.current && !hasSubmitted.current) {
      hasSubmitted.current = true;
      
      // Small delay to ensure form is fully rendered
      setTimeout(() => {
        onSubmit?.();
        formRef.current?.submit();
      }, 100);
    }
  }, [onSubmit]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      {/* Loading indicator */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <h2 className="mb-2 text-xl font-semibold">Redirecting to Payment...</h2>
        <p className="text-gray-600">
          Please wait while we redirect you to the secure payment page.
        </p>
      </div>

      {/* Hidden form that auto-submits */}
      <form
        ref={formRef}
        action={payfastConfig.processUrl}
        method="POST"
        className="hidden"
      >
        {/* Render payload fields in order (order matters for signature!) */}
        {payload.map(([key, value]) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={value || ''}
          />
        ))}
      </form>

      {/* Fallback manual submit button (in case auto-submit fails) */}
      <noscript>
        <form action={payfastConfig.processUrl} method="POST">
          {payload.map(([key, value]) => (
            <input
              key={key}
              type="hidden"
              name={key}
              value={value || ''}
            />
          ))}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Continue to Payment
          </button>
        </form>
      </noscript>
    </div>
  );
}
