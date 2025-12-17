# Email System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies ✅
Already installed! The following packages are configured:
- `resend` - Email delivery service
- `react-email` - Email template framework
- `@react-email/components` - UI components for emails

### Step 2: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain `kbsktrading.net`:
   - Add DNS records as shown in Resend dashboard
   - Wait for verification (usually 5-30 minutes)
3. Create an API key in the Resend dashboard
4. Copy the API key (starts with `re_`)

### Step 3: Configure Environment

Add to `.env.local`:

```bash
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
```bash
NEXT_PUBLIC_APP_URL=https://kbsktrading.net
```

### Step 4: Test the System

Start your development server:
```bash
npm run dev
```

Test the email system (replace with your email):
```bash
# Test verification email
curl "http://localhost:3000/api/email/test?type=verification&email=your@email.com"

# Test welcome email
curl "http://localhost:3000/api/email/test?type=welcome&email=your@email.com"

# Test password reset
curl "http://localhost:3000/api/email/test?type=password-reset&email=your@email.com"

# Test order confirmation
curl "http://localhost:3000/api/email/test?type=order-confirmation&email=your@email.com"
```

Check your inbox! 📧

### Step 5: Test Authentication Flow

1. Navigate to: `http://localhost:3000/register`
2. Create a new account with your email
3. Check your email for verification link
4. Click the verification link
5. You should receive a welcome email
6. You're now logged in! ✅

## 📋 What's Included

### Email Templates

✅ **Authentication Emails**
- Email verification (`verification-email.tsx`)
- Password reset (`password-reset-email.tsx`)
- Welcome email (`welcome-email.tsx`)

✅ **Order Emails**
- Order confirmation (`order-confirmation-email.tsx`)
- Shipping notification (`shipping-notification-email.tsx`)
- Order cancellation (`order-cancelled-email.tsx`)

### Integration

✅ **Better Auth** - Automatically sends emails for:
- User registration → Verification email
- Email verification → Welcome email
- Password reset request → Reset link email

### Sender Addresses

All emails use proper domain-based addresses:
- Authentication: `no-reply@kbsktrading.net`
- Orders: `orders@kbsktrading.net`

## 🔧 Common Issues

### Emails not sending?

**Check:**
1. Is `RESEND_API_KEY` set in `.env.local`?
2. Is the domain verified in Resend dashboard?
3. Check server console for error messages

**Solution:**
```bash
# Verify environment variable is loaded
echo $RESEND_API_KEY  # Should show your key
```

### Emails going to spam?

**Cause:** Domain not fully verified or missing DNS records

**Solution:**
1. Check Resend dashboard for DNS record status
2. Ensure SPF and DKIM records are added
3. Wait for DNS propagation (up to 48 hours)

### Links not working in emails?

**Cause:** `NEXT_PUBLIC_APP_URL` not set correctly

**Solution:**
```bash
# In .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Development
NEXT_PUBLIC_APP_URL=https://kbsktrading.net  # Production
```

## 📝 Usage Examples

### Send Verification Email

```typescript
import { sendVerificationEmail } from '@/lib/email';

await sendVerificationEmail(
  'user@example.com',
  'verification-token-123',
  'John Doe'
);
```

### Send Order Confirmation

```typescript
import { sendOrderConfirmationEmail } from '@/lib/email';

await sendOrderConfirmationEmail('customer@example.com', {
  userName: 'John Doe',
  orderNumber: 'ORD-12345',
  orderId: 'uuid-here',
  orderDate: new Date().toLocaleDateString(),
  items: [
    {
      productName: 'Safety Boots',
      variantName: 'Size 10',
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
});
```

## 🎯 Next Steps

1. ✅ Verify your domain in Resend
2. ✅ Test all email templates
3. ✅ Customize email branding (update templates)
4. ✅ Set up production environment variables
5. ✅ Monitor email delivery in Resend dashboard

## 📖 Full Documentation

For detailed documentation, see [EMAIL_SYSTEM_README.md](./EMAIL_SYSTEM_README.md)

## ✅ Success Criteria

- [ ] `RESEND_API_KEY` added to `.env.local`
- [ ] Domain verified in Resend dashboard
- [ ] Test emails received successfully
- [ ] User can register and receive verification email
- [ ] User receives welcome email after verification
- [ ] Password reset emails working
- [ ] All email templates render correctly

## 🆘 Need Help?

- Check logs: Look for `✅` or `❌` messages in server console
- Resend dashboard: View sent emails and delivery status
- Documentation: [EMAIL_SYSTEM_README.md](./EMAIL_SYSTEM_README.md)

---

**🎉 You're ready to send emails!**
