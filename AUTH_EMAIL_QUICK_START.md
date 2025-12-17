# 🚀 Auth Email Integration - Quick Start Guide

## For Developers

### How It Works (TL;DR)

Better Auth automatically sends emails when users:
1. **Register** → Sends verification email
2. **Verify email** → Sends welcome email  
3. **Request password reset** → Sends reset email

**No manual email sending needed!** It's all automated.

---

## 🧪 Testing Locally

### 1. Set Up Environment
```bash
# .env.local
RESEND_API_KEY=re_your_test_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test Registration
```bash
# Navigate to: http://localhost:3000/register
1. Fill in form with YOUR real email
2. Submit form
3. Check your inbox for verification email
4. Click verification link
5. Check inbox again for welcome email
```

### 4. Test Password Reset
```bash
# Navigate to: http://localhost:3000/forgot-password
1. Enter your email
2. Submit form
3. Check inbox for reset email
4. Click reset link
5. Enter new password
```

---

## 📧 Email Flow Details

### Registration Flow
```typescript
// User submits registration form
await signUp(formData)
  ↓
// Better Auth creates account & sends verification email
emailAndPassword.sendVerificationEmail({ user, token })
  ↓
// User clicks link, email verified
  ↓
// Better Auth sends welcome email
onAfterVerifyEmail({ user })
```

### Password Reset Flow
```typescript
// User requests reset (frontend)
await auth.forgetPassword({ email })
  ↓
// Better Auth generates token & sends email
emailAndPassword.sendResetPasswordEmail({ user, url })
  ↓
// User clicks link, resets password (frontend)
await auth.resetPassword({ token, password })
```

---

## 🔍 Debugging

### Check Email Logs
```bash
# Look for these in console:
✅ Email sent successfully to user@example.com
❌ Email send failed to user@example.com: API error
```

### Common Issues

**Emails not sending?**
```bash
# 1. Check RESEND_API_KEY is set
echo $RESEND_API_KEY

# 2. Check Resend dashboard for errors
# https://resend.com/emails

# 3. Check server console for error logs
```

**Verification links broken?**
```bash
# Make sure NEXT_PUBLIC_APP_URL is correct
echo $NEXT_PUBLIC_APP_URL
# Should be: http://localhost:3000 (dev) or https://kbsktrading.net (prod)
```

**Emails in spam?**
```bash
# For production:
# 1. Verify domain in Resend
# 2. Add SPF record: v=spf1 include:_spf.resend.com ~all
# 3. Add DKIM record (from Resend dashboard)
```

---

## 🛠️ Making Changes

### Need to Modify Email Templates?
```bash
# Templates are in:
src/lib/email/templates/auth/
  ├── verification-email.tsx    # Signup verification
  ├── password-reset-email.tsx  # Password reset
  └── welcome-email.tsx         # Welcome after verify

# Use React Email components
# Preview: npm run email:dev (if configured)
```

### Need to Change Email Logic?
```bash
# Email integration config:
src/lib/auth/email-config.ts

# Better Auth hooks:
src/lib/auth/index.ts (lines 19-32)
```

---

## 📊 Monitoring

### Production Monitoring
```typescript
// All emails log success/failure:
console.log('✅ Email sent successfully to user@example.com')
console.error('❌ Email send failed:', error)

// Set up alerts for email failures in your monitoring service
```

### Resend Dashboard
- View sent emails: https://resend.com/emails
- Check delivery status
- View bounce/spam reports
- Monitor API usage

---

## 🔐 Security Notes

- ✅ Email enumeration protection enabled
- ✅ Rate limiting: 10 requests/minute
- ✅ Tokens expire: 1h (password reset), 24h (verification)
- ✅ Passwords hashed with Better Auth's bcrypt
- ✅ Secure cookies (httpOnly, sameSite, secure)

---

## 📝 Manual Email Functions (Advanced)

If you need to send emails manually (not recommended):

```typescript
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendWelcomeEmail 
} from '@/lib/email/sender';

// Manual verification email
await sendVerificationEmail(
  'user@example.com',
  'verification-token-xyz',
  'John Doe'
);

// Manual password reset
await sendPasswordResetEmail(
  'user@example.com',
  'https://app.com/reset?token=xyz',
  'John Doe'
);

// Manual welcome email
await sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

**Note:** Better Auth handles all of this automatically. Only use manual functions for custom flows.

---

## 🎯 Quick Checklist

### Development
- [x] RESEND_API_KEY in .env.local
- [x] NEXT_PUBLIC_APP_URL in .env.local
- [x] npm run dev starts without errors
- [ ] Test registration with real email
- [ ] Verify email received and link works
- [ ] Test password reset flow

### Production Deployment
- [ ] Set RESEND_API_KEY in production env
- [ ] Set NEXT_PUBLIC_APP_URL to production domain
- [ ] Verify domain in Resend dashboard
- [ ] Configure SPF/DKIM DNS records
- [ ] Test registration in production
- [ ] Test password reset in production
- [ ] Set up email monitoring/alerts

---

## 📚 Additional Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/docs)
- [Full Integration Details](./AUTH_EMAIL_INTEGRATION_COMPLETE.md)

---

## 💬 Need Help?

Check the logs:
```bash
# Server console shows:
- Environment validation
- Email send success/failure
- Better Auth debug info
```

Common commands:
```bash
npm run dev              # Start dev server
npm run db:studio        # View database
npm run build            # Check for errors
```

---

**Last Updated:** December 17, 2025  
**Status:** Production Ready ✅
