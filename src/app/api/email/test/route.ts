import { NextRequest, NextResponse } from 'next/server';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendOrderCancelledEmail,
} from '@/lib/email/sender';
import { isResendConfigured } from '@/lib/email/client';

/**
 * Test API route for email functionality
 * GET /api/email/test?type=verification&email=test@example.com
 * 
 * Query parameters:
 * - type: verification | password-reset | welcome | order-confirmation | shipping | order-cancelled
 * - email: recipient email address
 * 
 * Note: This should be disabled in production or protected with authentication
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint disabled in production' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      {
        error: 'RESEND_API_KEY is not configured',
        message: 'Please add RESEND_API_KEY to your .env.local file',
      },
      { status: 500 }
    );
  }

  try {
    let result;

    switch (type) {
      case 'verification':
        result = await sendVerificationEmail(
          email,
          'test-token-12345',
          'Test User'
        );
        break;

      case 'password-reset':
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=test-reset-token`;
        result = await sendPasswordResetEmail(email, resetUrl, 'Test User');
        break;

      case 'welcome':
        result = await sendWelcomeEmail(email, 'Test User');
        break;

      case 'order-confirmation':
        result = await sendOrderConfirmationEmail(email, {
          userName: 'Test User',
          orderNumber: 'TEST-001',
          orderId: 'test-order-id',
          orderDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          items: [
            {
              productName: 'Premium Safety Boots',
              variantName: 'Size 10 - Black',
              quantity: 2,
              priceAtPurchase: '89.99',
            },
            {
              productName: 'Work Gloves',
              variantName: 'Large',
              quantity: 5,
              priceAtPurchase: '12.50',
            },
          ],
          subtotal: '242.48',
          taxTotal: '19.40',
          shippingCost: '15.00',
          totalAmount: '276.88',
          shippingAddress: {
            name: 'Test User',
            street: '123 Main Street',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'USA',
          },
          paymentMethod: 'Credit Card ending in 4242',
        });
        break;

      case 'shipping':
        result = await sendShippingNotificationEmail(email, {
          userName: 'Test User',
          orderNumber: 'TEST-001',
          orderId: 'test-order-id',
          trackingNumber: '1Z999AA10123456784',
          carrier: 'UPS',
          trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
          estimatedDelivery: 'December 20, 2025',
          shippingAddress: {
            name: 'Test User',
            street: '123 Main Street',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'USA',
          },
        });
        break;

      case 'order-cancelled':
        result = await sendOrderCancelledEmail(email, {
          userName: 'Test User',
          orderNumber: 'TEST-001',
          orderId: 'test-order-id',
          cancellationDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          refundAmount: '276.88',
          refundMethod: 'Original payment method',
          cancellationReason: 'Customer request',
        });
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid email type',
            available: [
              'verification',
              'password-reset',
              'welcome',
              'order-confirmation',
              'shipping',
              'order-cancelled',
            ],
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully to ${email}`,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
