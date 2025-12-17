import { getResendClient } from './client';
import { render } from '@react-email/components';
import VerificationEmail from './templates/auth/verification-email';
import PasswordResetEmail from './templates/auth/password-reset-email';
import WelcomeEmail from './templates/auth/welcome-email';
import OrderConfirmationEmail, {
  type OrderConfirmationEmailProps,
} from './templates/orders/order-confirmation-email';
import ShippingNotificationEmail, {
  type ShippingNotificationEmailProps,
} from './templates/orders/shipping-notification-email';
import OrderCancelledEmail, {
  type OrderCancelledEmailProps,
} from './templates/orders/order-cancelled-email';

/**
 * Sender addresses for different email types
 */
const SENDER_ADDRESSES = {
  auth: 'KBSK Trading Enterprises CC <no-reply@kbsktrading.net>',
  orders: 'KBSK Trading Enterprises CC <orders@kbsktrading.net>',
  support: 'KBSK Trading Enterprises CC <support@kbsktrading.net>',
} as const;

/**
 * Email send response type
 */
export interface EmailResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Generic email sending function
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email content
 * @param from - Sender address (defaults to auth sender)
 * @returns EmailResponse with success status
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from: string = SENDER_ADDRESSES.auth
): Promise<EmailResponse> {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`❌ Email send failed to ${to}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    console.log(`✅ Email sent successfully to ${to}`);
    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Email send error to ${to}:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send authentication-related emails
 * Uses no-reply@kbsktrading.net as sender
 */
export async function sendAuthEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResponse> {
  return sendEmail(to, subject, html, SENDER_ADDRESSES.auth);
}

/**
 * Send order-related emails
 * Uses orders@kbsktrading.net as sender
 */
export async function sendOrderEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResponse> {
  return sendEmail(to, subject, html, SENDER_ADDRESSES.orders);
}

/**
 * Send email verification link to user
 * 
 * @param email - User's email address
 * @param token - Verification token
 * @param userName - User's name
 * @returns EmailResponse
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  userName: string
): Promise<EmailResponse> {
  try {
    console.log('📬 sendVerificationEmail:', { email, userName, tokenLength: token?.length });
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    console.log('📬 Verification URL:', verificationUrl);
    console.log('📬 Rendering email template...');

    const html = await render(
      VerificationEmail({
        userName,
        verificationUrl,
      })
    );

    console.log('📬 Calling sendAuthEmail...');
    const response = await sendAuthEmail(email, 'Verify Your Email Address', html);
    console.log('📬 sendAuthEmail response:', response);
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in sendVerificationEmail:', errorMessage, error);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Send email verification link using full URL from Better Auth
 * 
 * @param email - User's email address
 * @param url - Full verification URL with token
 * @param userName - User's name
 * @returns EmailResponse
 */
export async function sendVerificationEmailWithUrl(
  email: string,
  url: string,
  userName: string
): Promise<EmailResponse> {
  try {
    console.log('📬 sendVerificationEmailWithUrl:', { email, userName, url });
    console.log('📬 Rendering email template...');

    const html = await render(
      VerificationEmail({
        userName,
        verificationUrl: url,
      })
    );

    console.log('📬 Calling sendAuthEmail...');
    const response = await sendAuthEmail(email, 'Verify Your Email Address', html);
    console.log('📬 sendAuthEmail response:', response);
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in sendVerificationEmailWithUrl:', errorMessage, error);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Send password reset link to user
 * 
 * @param email - User's email address
 * @param resetUrl - Password reset URL with token
 * @param userName - User's name
 * @returns EmailResponse
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName: string
): Promise<EmailResponse> {
  try {
    const html = await render(
      PasswordResetEmail({
        userName,
        resetUrl,
      })
    );

    return sendAuthEmail(email, 'Reset Your Password', html);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rendering password reset email:', errorMessage);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Send welcome email to newly verified user
 * 
 * @param email - User's email address
 * @param userName - User's name
 * @returns EmailResponse
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<EmailResponse> {
  try {
    const html = await render(
      WelcomeEmail({
        userName,
      })
    );

    return sendAuthEmail(email, 'Welcome to KBSK Trading!', html);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rendering welcome email:', errorMessage);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Send order confirmation email
 * 
 * @param email - Customer's email address
 * @param orderData - Order confirmation data
 * @returns EmailResponse
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderData: Omit<OrderConfirmationEmailProps, 'userName'> & { userName: string }
): Promise<EmailResponse> {
  try {
    const html = await render(OrderConfirmationEmail(orderData));

    return sendOrderEmail(
      email,
      `Order Confirmation #${orderData.orderNumber}`,
      html
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rendering order confirmation email:', errorMessage);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Send shipping notification email
 * 
 * @param email - Customer's email address
 * @param shippingData - Shipping notification data
 * @returns EmailResponse
 */
export async function sendShippingNotificationEmail(
  email: string,
  shippingData: ShippingNotificationEmailProps
): Promise<EmailResponse> {
  try {
    const html = await render(ShippingNotificationEmail(shippingData));

    return sendOrderEmail(
      email,
      `Your Order #${shippingData.orderNumber} Has Shipped!`,
      html
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rendering shipping notification email:', errorMessage);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Send order cancellation email
 * 
 * @param email - Customer's email address
 * @param cancellationData - Order cancellation data
 * @returns EmailResponse
 */
export async function sendOrderCancelledEmail(
  email: string,
  cancellationData: OrderCancelledEmailProps
): Promise<EmailResponse> {
  try {
    const html = await render(OrderCancelledEmail(cancellationData));

    return sendOrderEmail(
      email,
      `Order #${cancellationData.orderNumber} Cancelled`,
      html
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rendering order cancellation email:', errorMessage);
    return {
      success: false,
      error: `Failed to render email: ${errorMessage}`,
    };
  }
}

/**
 * Utility to log email send attempts for debugging
 */
export function logEmailAttempt(
  type: string,
  recipient: string,
  success: boolean,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  
  console.log(`[${timestamp}] ${status} | ${type} | To: ${recipient}`);
  
  if (error) {
    console.error(`  Error: ${error}`);
  }
}
