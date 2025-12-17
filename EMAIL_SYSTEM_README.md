# Email System Documentation

## Overview

A production-ready email system for KBSK Trading e-commerce application using Resend and React Email. Handles all transactional emails including authentication flows and order notifications.

## Features

✅ **Resend Integration** - Professional email delivery service  
✅ **React Email Templates** - Type-safe, component-based emails  
✅ **Better Auth Integration** - Seamless authentication emails  
✅ **Multiple Sender Addresses** - Domain-based sender routing  
✅ **Error Handling** - Graceful fallbacks and logging  
✅ **Type Safety** - Full TypeScript support  
✅ **Mobile Responsive** - Templates work across all email clients

## File Structure

```
src/lib/email/
├── client.ts                    # Resend client initialization
├── sender.ts                    # Email sending utility functions
└── templates/
    ├── auth/
    │   ├── verification-email.tsx       # Email verification
    │   ├── password-reset-email.tsx     # Password reset
    │   └── welcome-email.tsx            # Welcome after signup
    └── orders/
        ├── order-confirmation-email.tsx # Order confirmed
        ├── shipping-notification-email.tsx # Order shipped
        └── order-cancelled-email.tsx    # Order cancelled

src/lib/auth/
└── email-config.ts              # Better Auth email integration
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
# Required for email functionality
RESEND_API_KEY=re_xxxxxxxxxxxx

# Required for email links to work correctly
NEXT_PUBLIC_APP_URL=https://kbsktrading.net
```

### 2. Resend Account Setup

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (`kbsktrading.net`)
3. Add DNS records as instructed by Resend
4. Create an API key
5. Add API key to `.env.local`

### 3. Domain Verification

Resend requires domain verification. Add these DNS records:

- **SPF Record**: Allows Resend to send emails from your domain
- **DKIM Record**: Authenticates your emails
- **Custom Domain**: Configure `kbsktrading.net` in Resend dashboard

## Sender Addresses

Different email types use specific sender addresses:

| Email Type | Sender Address | Usage |
|------------|----------------|-------|
| Authentication | `no-reply@kbsktrading.net` | Verification, password reset, welcome |
| Orders | `orders@kbsktrading.net` | Order confirmations, shipping, cancellations |
| Support | `support@kbsktrading.net` | Future use for customer support |

## Usage Examples

### Authentication Emails

```typescript
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/email/sender';

// Send email verification
await sendVerificationEmail(
  'user@example.com',
  'verification-token-here',
  'John Doe'
);

// Send password reset
await sendPasswordResetEmail(
  'user@example.com',
  'https://kbsktrading.net/reset-password?token=xyz',
  'John Doe'
);

// Send welcome email
await sendWelcomeEmail('user@example.com', 'John Doe');
```

### Order Emails

```typescript
import {
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendOrderCancelledEmail,
} from '@/lib/email/sender';

// Order confirmation
await sendOrderConfirmationEmail('customer@example.com', {
  userName: 'John Doe',
  orderNumber: 'ORD-12345',
  orderId: 'uuid-here',
  orderDate: 'December 17, 2025',
  items: [
    {
      productName: 'Safety Boots',
      variantName: 'Size 10 - Black',
      quantity: 2,
      priceAtPurchase: '89.99',
    },
  ],
  subtotal: '179.98',
  taxTotal: '14.40',
  shippingCost: '15.00',
  totalAmount: '209.38',
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'USA',
  },
  paymentMethod: 'Credit Card ending in 4242',
});

// Shipping notification
await sendShippingNotificationEmail('customer@example.com', {
  userName: 'John Doe',
  orderNumber: 'ORD-12345',
  orderId: 'uuid-here',
  trackingNumber: '1Z999AA10123456784',
  carrier: 'UPS',
  trackingUrl: 'https://ups.com/track?num=1Z999AA10123456784',
  estimatedDelivery: 'December 20, 2025',
  shippingAddress: { /* ... */ },
});

// Order cancellation
await sendOrderCancelledEmail('customer@example.com', {
  userName: 'John Doe',
  orderNumber: 'ORD-12345',
  orderId: 'uuid-here',
  cancellationDate: 'December 17, 2025',
  refundAmount: '209.38',
  refundMethod: 'Original payment method',
  cancellationReason: 'Customer request',
});
```

## Better Auth Integration

The email system is automatically integrated with Better Auth for authentication flows:

- **Registration**: Sends verification email
- **Email Verification**: Sends welcome email after successful verification
- **Password Reset**: Sends password reset link
- **Auto Sign-in**: Enabled after email verification

## Testing

### Development Testing

Use the test API endpoint (development only):

```bash
# Test verification email
curl "http://localhost:3000/api/email/test?type=verification&email=thorefrancis@gmail.com"

# Test password reset
curl "http://localhost:3000/api/email/test?type=password-reset&email=your@email.com"

# Test welcome email
curl "http://localhost:3000/api/email/test?type=welcome&email=your@email.com"

# Test order confirmation
curl "http://localhost:3000/api/email/test?type=order-confirmation&email=your@email.com"

# Test shipping notification
curl "http://localhost:3000/api/email/test?type=shipping&email=your@email.com"

# Test order cancellation
curl "http://localhost:3000/api/email/test?type=order-cancelled&email=your@email.com"
```

### Manual Testing

1. Start the development server: `npm run dev`
2. Register a new account
3. Check your email for verification link
4. Click verification link
5. Check for welcome email

## Error Handling

All email functions return an `EmailResponse` object:

```typescript
interface EmailResponse {
  success: boolean;
  error?: string;
  data?: any;
}
```

Example with error handling:

```typescript
const result = await sendVerificationEmail(email, token, userName);

if (!result.success) {
  console.error('Failed to send email:', result.error);
  // Handle error (log, retry, notify admin, etc.)
}
```

## Logging

All email attempts are logged automatically:

```
✅ Email sent successfully to user@example.com
❌ Email send failed to user@example.com: Invalid API key
```

## Email Template Customization

### Styling

Templates use inline styles for maximum email client compatibility. Modify the style objects in each template file:

```typescript
const button = {
  backgroundColor: '#000000', // Change brand color
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};
```

### Content

Update text content directly in the template JSX:

```typescript
<Text style={text}>
  Thanks for signing up! // Customize messaging
</Text>
```

### Branding

- **Logo**: Add logo image in templates (currently text-based "KBSK Trading")
- **Colors**: Black header (#000000) - customize in header style
- **Typography**: Uses system fonts for reliability

## Production Checklist

- [ ] RESEND_API_KEY added to production environment
- [ ] Domain verified in Resend dashboard
- [ ] DNS records configured (SPF, DKIM)
- [ ] NEXT_PUBLIC_APP_URL set to production URL
- [ ] Test endpoint disabled in production (automatic)
- [ ] Email templates reviewed and approved
- [ ] Test all email flows in staging environment
- [ ] Monitor email delivery logs
- [ ] Set up email delivery alerts

## Rate Limiting

Resend has rate limits based on your plan:

- **Free**: 100 emails/day
- **Paid**: Higher limits based on plan

Consider implementing application-level rate limiting for high-traffic scenarios.

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain in Resend dashboard
3. Check server logs for error messages
4. Verify DNS records are propagated

### Emails going to spam

1. Ensure SPF and DKIM records are set
2. Use verified domain sender addresses
3. Avoid spam trigger words
4. Include unsubscribe links (for marketing emails)

### Links not working

1. Check `NEXT_PUBLIC_APP_URL` is set
2. Ensure URL includes protocol (https://)
3. Test links in different email clients

## Future Enhancements

- [ ] Email templates preview server (React Email dev server)
- [ ] Email tracking (opens, clicks)
- [ ] Unsubscribe management
- [ ] Email preferences center
- [ ] Marketing email campaigns
- [ ] Email queuing system
- [ ] Retry logic for failed sends
- [ ] Email analytics dashboard

## Support

For issues or questions:
- Check Resend status: [status.resend.com](https://status.resend.com)
- Review logs in Resend dashboard
- Contact: support@kbsktrading.net

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- [Better Auth Email Configuration](https://www.better-auth.com/docs/email)
