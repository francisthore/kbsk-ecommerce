# 📧 Email System - Quick Reference Card

## 🚀 Quick Commands

### Send Test Emails
```bash
# Development server must be running (npm run dev)

# Authentication emails
curl "localhost:3000/api/email/test?type=verification&email=YOUR_EMAIL"
curl "localhost:3000/api/email/test?type=password-reset&email=YOUR_EMAIL"
curl "localhost:3000/api/email/test?type=welcome&email=YOUR_EMAIL"

# Order emails
curl "localhost:3000/api/email/test?type=order-confirmation&email=YOUR_EMAIL"
curl "localhost:3000/api/email/test?type=shipping&email=YOUR_EMAIL"
curl "localhost:3000/api/email/test?type=order-cancelled&email=YOUR_EMAIL"
```

## 📦 Import Shortcuts

```typescript
// Import all email functions
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendOrderCancelledEmail,
} from '@/lib/email';

// Import types
import type {
  EmailResponse,
  OrderConfirmationData,
  ShippingNotificationData,
  OrderCancellationData,
} from '@/lib/email';
```

## 🎯 Function Signatures

### Authentication

```typescript
// Email verification
sendVerificationEmail(
  email: string,
  token: string,
  userName: string
): Promise<EmailResponse>

// Password reset
sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName: string
): Promise<EmailResponse>

// Welcome email
sendWelcomeEmail(
  email: string,
  userName: string
): Promise<EmailResponse>
```

### Orders

```typescript
// Order confirmation
sendOrderConfirmationEmail(
  email: string,
  orderData: OrderConfirmationData
): Promise<EmailResponse>

// Shipping notification
sendShippingNotificationEmail(
  email: string,
  shippingData: ShippingNotificationData
): Promise<EmailResponse>

// Order cancellation
sendOrderCancelledEmail(
  email: string,
  cancellationData: OrderCancellationData
): Promise<EmailResponse>
```

## 📁 File Locations

| Component | Location |
|-----------|----------|
| **Client** | `src/lib/email/client.ts` |
| **Sender** | `src/lib/email/sender.ts` |
| **Types** | `src/lib/email/types.ts` |
| **Auth Templates** | `src/lib/email/templates/auth/` |
| **Order Templates** | `src/lib/email/templates/orders/` |
| **Better Auth Config** | `src/lib/auth/email-config.ts` |
| **Test Route** | `src/app/api/email/test/route.ts` |

## 🌐 Sender Addresses

| Type | Address | Usage |
|------|---------|-------|
| Auth | `no-reply@kbsktrading.net` | Verification, reset, welcome |
| Orders | `orders@kbsktrading.net` | Confirmations, shipping |
| Support | `support@kbsktrading.net` | Future use |

## ⚙️ Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxxx...
NEXT_PUBLIC_APP_URL=https://kbsktrading.net

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔍 Debugging

### Check if email is configured
```typescript
import { isResendConfigured } from '@/lib/email';

if (!isResendConfigured()) {
  console.error('Resend not configured!');
}
```

### Handle email responses
```typescript
const result = await sendVerificationEmail(email, token, userName);

if (!result.success) {
  console.error('Email failed:', result.error);
  // Handle error
} else {
  console.log('Email sent:', result.data);
}
```

## 📊 Email Flow

```
User Action          →  Better Auth  →  Email Function  →  Resend  →  User Inbox
─────────────────────────────────────────────────────────────────────────────────
Register account     →  Triggered   →  sendVerificationEmail  →  Sent  →  📧
Click verify link    →  Verified    →  sendWelcomeEmail       →  Sent  →  📧
Request reset        →  Triggered   →  sendPasswordResetEmail →  Sent  →  📧
Order placed         →  Manual call →  sendOrderConfirmation  →  Sent  →  📧
Order shipped        →  Manual call →  sendShippingNotify     →  Sent  →  📧
Order cancelled      →  Manual call →  sendOrderCancelled     →  Sent  →  📧
```

## ✅ Testing Checklist

- [ ] `RESEND_API_KEY` set in `.env.local`
- [ ] Development server running (`npm run dev`)
- [ ] Test verification email received
- [ ] Test welcome email received
- [ ] Test password reset email received
- [ ] Register new account → receive emails
- [ ] Verify email → receive welcome email
- [ ] All email links work correctly
- [ ] Templates look good in Gmail/Outlook

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Emails not sending | Check `RESEND_API_KEY` in `.env.local` |
| Links broken | Set `NEXT_PUBLIC_APP_URL` correctly |
| Domain not verified | Complete DNS setup in Resend dashboard |
| Going to spam | Add SPF/DKIM records to DNS |
| TypeScript errors | Run `npm run build` to check |

## 📖 Documentation Files

- **Full Docs**: `EMAIL_SYSTEM_README.md`
- **Quick Start**: `EMAIL_QUICK_START.md`
- **Summary**: `EMAIL_IMPLEMENTATION_SUMMARY.md`
- **This Card**: `EMAIL_QUICK_REFERENCE.md`

## 🎨 Customization

### Change email styles
Edit template files in `src/lib/email/templates/`

### Change sender name
Update in `src/lib/email/sender.ts`:
```typescript
const SENDER_ADDRESSES = {
  auth: 'Your Company <no-reply@domain.com>',
  // ...
};
```

### Add new email template
1. Create template in `templates/` folder
2. Add sender function in `sender.ts`
3. Export in `index.ts`
4. Add test case in `api/email/test/route.ts`

---

**💡 Pro Tip**: Bookmark this file for quick reference during development!
