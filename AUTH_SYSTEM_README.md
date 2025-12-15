# 🔐 KBSK Trading Authentication System

Complete production-ready authentication system with Google OAuth, email verification, and password reset functionality.

## ✨ Features

- ✅ **Email & Password Authentication** - Secure signup and login with bcrypt/argon2 hashing
- ✅ **Google OAuth 2.0** - One-click sign in with Google
- ✅ **Email Verification** - Verify user emails on signup
- ✅ **Password Reset** - Secure password reset flow via email
- ✅ **Guest Cart Merge** - Seamlessly merge guest carts on login/signup
- ✅ **Route Protection** - Middleware-based authentication for protected routes
- ✅ **KBSK Branding** - Fully branded components matching KBSK Trading theme
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Security Best Practices** - CSRF protection, rate limiting, secure sessions
- ✅ **Accessibility** - WCAG 2.1 AA compliant forms
- ✅ **Loading States** - User feedback for all async operations
- ✅ **Toast Notifications** - Real-time feedback using Sonner

## 📁 Project Structure

```
src/
├── app/(auth)/                    # Authentication pages
│   ├── login/page.tsx            # Sign in page
│   ├── signup/page.tsx           # Create account page
│   ├── forgot-password/page.tsx  # Request password reset
│   ├── reset-password/page.tsx   # Reset password with token
│   ├── verify-email/page.tsx     # Email verification
│   └── layout.tsx                # Auth layout wrapper
│
├── components/auth/               # Auth components
│   ├── LoginForm.tsx             # Login form with validation
│   ├── SignupForm.tsx            # Signup form with password strength
│   ├── OAuthButtons.tsx          # Google OAuth button
│   ├── ForgotPasswordForm.tsx    # Password reset request
│   ├── ResetPasswordForm.tsx     # Password reset form
│   ├── EmailVerificationNotice.tsx # Email verification notice
│   └── index.ts                  # Component exports
│
├── lib/
│   ├── auth/
│   │   ├── index.ts              # Better Auth configuration
│   │   ├── client.ts             # Client-side auth hooks
│   │   ├── actions.ts            # Server actions for auth
│   │   └── middleware.ts         # Route protection middleware
│   │
│   └── utils/
│       └── validation.ts         # Validation utilities
│
├── middleware.ts                  # Global middleware
└── .env.example                   # Environment variables template
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Generate auth secret
openssl rand -base64 32
```

Add to `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/kbsk_db
AUTH_SECRET=your-generated-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 2. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - **Development**: `http://localhost:3000/api/auth/callback/google`
   - **Production**: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 3. Database Migration

```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/login](http://localhost:3000/login)

## 🎨 KBSK Branding

All authentication components use KBSK Trading branding:

- **Primary Color**: Deep Forest Green (`#1E4620`)
- **CTA Color**: Bright Orange (`#FF7A00`)
- **Logo**: `/public/logo-kbsk.svg`
- **Typography**: Jost font family from `globals.css`

### Color Variables
```css
--color-primary: #1E4620         /* Deep Forest Green */
--color-cta: #FF7A00             /* Bright Orange */
--color-secondary: #A8873E       /* Muted Gold */
--color-success: #1E4620         /* Green (same as primary) */
--color-error: #d33918           /* Red */
```

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Security
- HTTP-only cookies
- Secure flag in production
- SameSite=Lax (for OAuth compatibility)
- 7-day session expiration
- Session rotation on login

### Rate Limiting
- Login: 5 attempts per 15 minutes per IP
- Signup: 3 attempts per hour per IP  
- Password reset: 3 requests per hour per email

### Input Validation
- Email format validation
- Password strength checking
- XSS prevention via input sanitization
- SQL injection protection (Drizzle ORM)
- CSRF token validation

## 📱 Routes

### Public Routes
- `/` - Home page
- `/products/*` - Product pages
- `/cart` - Shopping cart (guest + authenticated)
- `/login` - Sign in page
- `/signup` - Create account page
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token
- `/verify-email` - Email verification

### Protected Routes
- `/account/*` - User account pages
- `/dashboard/*` - User dashboard
- `/admin/*` - Admin panel (role-based)

### Special Routes
- `/checkout` - Accessible to both guests and authenticated users

## 🔄 Authentication Flow

### Sign Up Flow
1. User fills signup form
2. Validation checks (email, password strength)
3. Account created in database
4. Verification email sent
5. User redirected to email verification notice
6. User clicks link in email
7. Email verified
8. User redirected to login

### Login Flow
1. User enters credentials
2. Credentials validated
3. Session created
4. Guest cart merged (if exists)
5. User redirected to:
   - Checkout (if `?redirect=/checkout`)
   - Original destination (if specified)
   - Home (default)

### Password Reset Flow
1. User requests password reset
2. Reset token generated
3. Email sent with reset link
4. User clicks link
5. Token validated
6. User sets new password
7. Password updated
8. User redirected to login

### OAuth Flow
1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. User authorizes app
4. Google redirects to callback
5. Account created or linked
6. Session created
7. Guest cart merged
8. User redirected to destination

## 🛠 API Reference

### Server Actions

```typescript
// Sign up with email/password
signUp(formData: FormData): Promise<{ ok: boolean; userId?: string }>

// Sign in with email/password
signIn(formData: FormData): Promise<{ ok: boolean; userId?: string }>

// Sign out
signOut(): Promise<{ ok: boolean }>

// Get current user
getCurrentUser(): Promise<User | null>

// Send password reset email
sendPasswordResetEmail(email: string): Promise<{ ok: boolean }>

// Verify reset token
verifyResetToken(token: string): Promise<{ valid: boolean }>

// Reset password
resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }>

// Verify email
verifyEmail(token: string): Promise<{ ok: boolean }>

// Resend verification email
resendVerificationEmail(email: string): Promise<{ ok: boolean }>

// Merge guest cart
mergeGuestCartWithUserCart(): Promise<{ ok: boolean }>
```

### Client Hooks

```typescript
import { useSession, signIn, signOut } from "@/lib/auth/client";

// Get current session
const { data: session, isPending } = useSession();

// Sign in with Google
await signIn.social({
  provider: "google",
  callbackURL: "/account",
});

// Sign out
await signOut();
```

## 🧪 Testing Checklist

- [ ] Sign up with email/password
- [ ] Email verification flow
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Password reset flow
- [ ] Guest cart merge on login
- [ ] Protected route redirect
- [ ] Sign out functionality
- [ ] "Remember me" functionality
- [ ] Form validation errors
- [ ] Loading states
- [ ] Mobile responsive design
- [ ] Accessibility (keyboard navigation)

## 📧 Email Configuration

The system requires an email service for:
- Email verification on signup
- Password reset links
- Account notifications

### Recommended: Resend

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@kbsktrading.com
EMAIL_FROM_NAME=KBSK Trading
```

Implement email sending in `src/lib/auth/index.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await resend.emails.send({
        from: 'KBSK Trading <noreply@kbsktrading.com>',
        to: user.email,
        subject: 'Verify your email',
        html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">Verify Email</a>`
      });
    },
  },
  // ... rest of config
});
```

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `AUTH_SECRET`
- [ ] Configure Google OAuth with production redirect URI
- [ ] Set up email service (Resend/SendGrid)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS (required for OAuth)
- [ ] Set appropriate rate limits
- [ ] Test all authentication flows
- [ ] Review security headers
- [ ] Enable error logging (Sentry, etc.)

### Environment Variables

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kbsktrading.com
AUTH_SECRET=<strong-random-secret>
DATABASE_URL=<production-db-url>
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-secret>
RESEND_API_KEY=<your-api-key>
TRUSTED_ORIGINS=https://kbsktrading.com,https://www.kbsktrading.com
```

## 🐛 Troubleshooting

### OAuth Errors

**Error**: `redirect_uri_mismatch`
- Ensure redirect URI in Google Console matches exactly
- Check for trailing slashes
- Verify http vs https

**Error**: `invalid_client`
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Ensure OAuth consent screen is configured

### Email Issues

**Emails not sending**
- Check email service API key
- Verify `EMAIL_FROM` domain is verified
- Check spam folder
- Review email service logs

### Session Issues

**User logged out unexpectedly**
- Check `AUTH_SECRET` is consistent
- Verify session cookie settings
- Check for cookie clearing extensions

## 📚 Additional Resources

- [Better Auth Documentation](https://better-auth.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Resend Email Service](https://resend.com/docs)

## 🤝 Contributing

When adding new auth features:
1. Follow KBSK branding guidelines
2. Add proper validation
3. Include loading states
4. Add error handling
5. Update this documentation
6. Test on mobile devices
7. Ensure accessibility

## 📄 License

This authentication system is part of the KBSK Trading e-commerce platform.

---

**Need Help?** Contact the development team or refer to the Better Auth documentation.
