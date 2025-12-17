import { validateResendConfig } from '@/lib/email/client';

/**
 * Environment validation and initialization
 * This file is imported early in the application lifecycle
 * to validate required environment variables
 */

export function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set');
  }

  // Check Resend configuration
  if (!process.env.RESEND_API_KEY) {
    warnings.push(
      'RESEND_API_KEY is not set. Email functionality will not work. ' +
      'Add it to .env.local to enable email sending.'
    );
  }

  // Check app URL
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push(
      'NEXT_PUBLIC_APP_URL is not set. Email links may not work correctly. ' +
      'Add it to .env.local (e.g., https://kbsktrading.net)'
    );
  }

  // Log errors and warnings
  if (errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error('Missing required environment variables');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Validate Resend specifically
  validateResendConfig();

  console.log('✅ Environment validation complete');
}

// Run validation on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnvironment();
}
