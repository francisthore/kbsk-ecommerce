import { Resend } from 'resend';

/**
 * Resend client instance for sending emails
 * Requires RESEND_API_KEY environment variable
 */
let resendClient: Resend | null = null;

/**
 * Get or create Resend client instance
 * @returns Resend client instance
 * @throws Error if RESEND_API_KEY is not set
 */
export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.'
      );
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

/**
 * Check if Resend is properly configured
 * @returns true if RESEND_API_KEY is set, false otherwise
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Validate Resend configuration on startup
 * Logs a warning if not configured properly
 */
export function validateResendConfig(): void {
  if (!isResendConfigured()) {
    console.warn(
      '⚠️  RESEND_API_KEY is not set. Email functionality will not work. ' +
      'Please add RESEND_API_KEY to your .env.local file.'
    );
  } else {
    console.log('✅ Resend email service configured');
  }
}
