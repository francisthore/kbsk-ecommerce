/**
 * Email System - Public API
 * 
 * Centralized exports for the email system
 */

// Client
export { getResendClient, isResendConfigured, validateResendConfig } from './client';

// Sender functions
export {
  sendEmail,
  sendAuthEmail,
  sendOrderEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendOrderCancelledEmail,
  logEmailAttempt,
} from './sender';

// Types
export type {
  EmailResponse,
  OrderItem,
  Address,
  OrderConfirmationData,
  ShippingNotificationData,
  OrderCancellationData,
} from './types';

// Templates (if needed for custom rendering)
export { default as VerificationEmail } from './templates/auth/verification-email';
export { default as PasswordResetEmail } from './templates/auth/password-reset-email';
export { default as WelcomeEmail } from './templates/auth/welcome-email';
export { default as OrderConfirmationEmail } from './templates/orders/order-confirmation-email';
export { default as ShippingNotificationEmail } from './templates/orders/shipping-notification-email';
export { default as OrderCancelledEmail } from './templates/orders/order-cancelled-email';
