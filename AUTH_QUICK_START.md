# 🚀 Authentication System Quick Start

Get the KBSK Trading authentication system up and running in 5 minutes!

## ⚡ Quick Setup (Development)

### Step 1: Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local
```

Add to `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kbsk_db

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-32-character-secret-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (optional for now)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Database Setup

```bash
# Push schema to database
npm run db:push
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Test the Auth System

Visit these pages:
- **Sign Up**: http://localhost:3000/signup
- **Login**: http://localhost:3000/login
- **Forgot Password**: http://localhost:3000/forgot-password

## 🎨 What You Get

### ✅ Pages Ready to Use
- `/login` - Sign in with email/password or Google
- `/signup` - Create new account
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token
- `/verify-email` - Email verification handler

### ✅ Protected Routes
- `/account/*` - Requires authentication
- `/dashboard/*` - Requires authentication  
- `/admin/*` - Requires authentication

### ✅ Guest Access
- `/` - Home page
- `/products/*` - Product browsing
- `/cart` - Shopping cart (guest + authenticated)
- `/checkout` - Checkout (guest + authenticated)

## 🔐 Features Available Now

✅ Email & Password signup/login  
✅ Password strength validation  
✅ Guest cart preservation  
✅ Route protection  
✅ KBSK branded UI  
✅ Mobile responsive  
✅ Toast notifications  

⏳ **Requires Configuration:**
- Google OAuth (need Client ID/Secret)
- Email verification (need email service)
- Password reset emails (need email service)

## 📧 Email Configuration (Optional)

For email verification and password reset, set up an email service:

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@kbsktrading.com
```

4. Update `/src/lib/auth/index.ts`:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In Better Auth config:
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, token }) => {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: user.email,
      subject: 'Verify your KBSK Trading email',
      html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">Verify Email</a>`
    });
  },
},
```

## 🌐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 🧪 Test the System

### Test Email/Password Signup
1. Visit http://localhost:3000/signup
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@#
3. Check console for verification link (if email not configured)
4. Sign in at http://localhost:3000/login

### Test Google OAuth
1. Visit http://localhost:3000/login
2. Click "Continue with Google"
3. Complete Google consent
4. Should redirect back logged in

### Test Password Reset
1. Visit http://localhost:3000/forgot-password
2. Enter email
3. Check console for reset link
4. Click link to reset password

### Test Route Protection
1. Try visiting http://localhost:3000/account
2. Should redirect to login
3. After login, should access account page

## 🎯 Quick Reference

### Check Current User (Server Component)
```typescript
import { getCurrentUser } from "@/lib/auth/actions";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Check Current User (Client Component)
```typescript
"use client";
import { useSession } from "@/lib/auth/client";

export default function Component() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Please sign in</div>;
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

### Sign Out
```typescript
import { signOut } from "@/lib/auth/actions";

async function handleSignOut() {
  await signOut();
  // User is now signed out
}
```

## 📂 File Structure

```
src/
├── app/(auth)/
│   ├── login/page.tsx           ← Login page
│   ├── signup/page.tsx          ← Signup page
│   ├── forgot-password/page.tsx ← Password reset request
│   ├── reset-password/page.tsx  ← Password reset form
│   └── verify-email/page.tsx    ← Email verification
│
├── components/auth/
│   ├── LoginForm.tsx            ← Login form component
│   ├── SignupForm.tsx           ← Signup form component
│   ├── OAuthButtons.tsx         ← Google OAuth button
│   ├── ForgotPasswordForm.tsx   ← Password reset form
│   ├── ResetPasswordForm.tsx    ← Reset password form
│   └── EmailVerificationNotice.tsx
│
├── lib/
│   ├── auth/
│   │   ├── index.ts             ← Better Auth config
│   │   ├── client.ts            ← Client hooks
│   │   ├── actions.ts           ← Server actions
│   │   └── middleware.ts        ← Route protection
│   │
│   └── utils/
│       └── validation.ts        ← Validation functions
│
└── middleware.ts                 ← Global middleware
```

## 🔧 Customization

### Change Brand Colors
Edit `/src/app/globals.css`:
```css
--color-primary: #1E4620;    /* Your primary color */
--color-cta: #FF7A00;        /* Your CTA color */
```

### Add More OAuth Providers
Update `/src/lib/auth/index.ts`:
```typescript
socialProviders: {
  google: { ... },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  },
},
```

### Customize Email Templates
Update the `sendVerificationEmail` function in `/src/lib/auth/index.ts`

## ❓ Troubleshooting

### Issue: "Cannot connect to database"
**Solution**: Check your `DATABASE_URL` in `.env.local`

### Issue: "AUTH_SECRET is required"
**Solution**: Generate a secret with `openssl rand -base64 32` and add to `.env.local`

### Issue: Google OAuth not working
**Solution**: 
1. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Verify redirect URI in Google Console matches: `http://localhost:3000/api/auth/callback/google`

### Issue: Emails not sending
**Solution**: 
1. Email service is not configured by default
2. Check console for verification/reset links during development
3. For production, configure Resend/SendGrid

### Issue: TypeScript errors
**Solution**: 
```bash
npm run build
```
Check for any type errors and fix them

## 📚 Next Steps

1. ✅ Test all authentication flows
2. ✅ Configure email service (Resend recommended)
3. ✅ Set up Google OAuth
4. ✅ Customize branding if needed
5. ✅ Add user profile pages
6. ✅ Implement role-based access control
7. ✅ Deploy to production

## 🎉 You're Ready!

The authentication system is fully functional and ready to use. Start building your KBSK Trading application!

For detailed documentation, see:
- **Full Documentation**: `/AUTH_SYSTEM_README.md`
- **Implementation Summary**: `/AUTH_IMPLEMENTATION_SUMMARY.md`

Need help? Check the troubleshooting section above or review the full documentation.

**Happy coding! 🚀**
