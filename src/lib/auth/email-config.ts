import {
  sendVerificationEmail,
  sendVerificationEmailWithUrl,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/email/sender';

/**
 * Email configuration for Better Auth
 * Integrates Resend email service with Better Auth authentication flows
 */

/**
 * Send verification email when user signs up
 * 
 * @param user - User object from Better Auth
 * @param url - Full verification URL with token
 */
export async function sendBetterAuthVerificationEmail(
  user: { email: string; name?: string },
  url: string
): Promise<void> {
  console.log('📧 sendBetterAuthVerificationEmail called:', {
    email: user.email,
    name: user.name,
    url
  });
  
  const userName = user.name || user.email.split('@')[0];
  
  // Better Auth provides the full URL, so we can send directly
  console.log('📧 Sending verification email with URL from Better Auth...');
  const result = await sendVerificationEmailWithUrl(user.email, url, userName);
  
  console.log('📧 sendVerificationEmail result:', result);
  
  if (!result.success) {
    console.error('❌ Failed to send verification email:', result.error);
    // Don't throw error to prevent blocking user registration
    // Email will be logged, can be retried manually if needed
  } else {
    console.log('✅ Verification email sent successfully to:', user.email);
  }
}

/**
 * Send password reset email
 * 
 * @param user - User object from Better Auth
 * @param url - Password reset URL with token
 */
export async function sendBetterAuthPasswordResetEmail(
  user: { email: string; name?: string },
  url: string
): Promise<void> {
  const userName = user.name || user.email.split('@')[0];
  
  const result = await sendPasswordResetEmail(user.email, url, userName);
  
  if (!result.success) {
    console.error('Failed to send password reset email:', result.error);
    // Don't throw error to prevent blocking password reset flow
  }
}

/**
 * Send welcome email after email verification
 * Called after user successfully verifies their email
 * 
 * @param user - User object from Better Auth
 */
export async function sendBetterAuthWelcomeEmail(
  user: { email: string; name?: string }
): Promise<void> {
  const userName = user.name || user.email.split('@')[0];
  
  const result = await sendWelcomeEmail(user.email, userName);
  
  if (!result.success) {
    console.error('Failed to send welcome email:', result.error);
    // Don't throw error, this is a nice-to-have email
  }
}

/**
 * Email configuration object for Better Auth
 */
export const betterAuthEmailConfig = {
  sendVerificationEmail: sendBetterAuthVerificationEmail,
  sendPasswordResetEmail: sendBetterAuthPasswordResetEmail,
  sendWelcomeEmail: sendBetterAuthWelcomeEmail,
};
