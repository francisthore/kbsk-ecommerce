# 🚀 Better Auth Integration - Quick Reference

## For Developers

### ✅ What Changed (December 17, 2025)

**All legacy manual auth code removed** → **Replaced with Better Auth native API**

---

## 🔄 Migration Guide

### Old Way (REMOVED ❌)
```typescript
// ❌ DELETED - Don't use these anymore
import { sendPasswordResetEmail, resetPassword, verifyResetToken, verifyEmail, resendVerificationEmail } from "@/lib/auth/actions";
```

### New Way (CURRENT ✅)
```typescript
// ✅ Better Auth handles everything via API endpoints
// Components now call Better Auth API directly
fetch("/api/auth/forget-password", { /* ... */ })
fetch("/api/auth/reset-password", { /* ... */ })
fetch("/api/auth/verify-email", { /* ... */ })
```

---

## 📚 Auth Functions Available

### In `src/lib/auth/actions.ts`

✅ **Still Available (Non-Auth):**
- `createGuestSession()` - Create guest cart session
- `guestSession()` - Get current guest session
- `getCurrentUser()` - Get authenticated user
- `mergeGuestCartWithUserCart()` - Merge guest cart to user

✅ **Still Available (Better Auth Wrappers):**
- `signUp(formData)` - Register new user (calls Better Auth)
- `signIn(formData)` - Login user (calls Better Auth)
- `signOut()` - Logout user (calls Better Auth)

❌ **Removed (Use Better Auth API):**
- ~~`sendPasswordResetEmail()`~~ → Use `/api/auth/forget-password`
- ~~`resetPassword()`~~ → Use `/api/auth/reset-password`
- ~~`verifyResetToken()`~~ → Better Auth handles validation
- ~~`verifyEmail()`~~ → Use `/api/auth/verify-email`
- ~~`resendVerificationEmail()`~~ → Use `/api/auth/send-verification-email`

---

## 🌐 Better Auth API Endpoints

### Password Reset Flow

**Step 1: Request Reset**
```typescript
const response = await fetch("/api/auth/forget-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com" }),
});
```

**Step 2: User clicks email link → Redirected to `/reset-password?token=xxx`**

**Step 3: Submit New Password**
```typescript
const response = await fetch("/api/auth/reset-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    newPassword: "newPass123",
    token: "token-from-url"
  }),
});
```

### Email Verification Flow

**Step 1: User registers → Better Auth auto-sends verification email**

**Step 2: User clicks email link**
```typescript
const response = await fetch("/api/auth/verify-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: "token-from-email" }),
});
```

**Step 3: Resend verification (if needed)**
```typescript
const response = await fetch("/api/auth/send-verification-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    email: "user@example.com",
    callbackURL: "/verify-email"
  }),
});
```

---

## 🎨 Component Examples

### Example: Password Reset Form
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch("/api/auth/forget-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  
  if (response.ok && !data.error) {
    toast.success("Reset email sent!");
  } else {
    toast.error("Failed to send reset email");
  }
};
```

### Example: Email Verification
```tsx
useEffect(() => {
  const verify = async () => {
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    
    if (response.ok && !data.error) {
      setStatus("success");
      router.push("/login");
    } else {
      setStatus("error");
    }
  };
  
  if (token) verify();
}, [token]);
```

---

## 🔐 Security Features (Automatic)

Better Auth provides these security features automatically:

✅ **Rate Limiting:** 10 requests/minute per endpoint  
✅ **CSRF Protection:** Built-in token validation  
✅ **Secure Tokens:** Cryptographically secure generation  
✅ **Auto Cleanup:** Expired tokens removed automatically  
✅ **Password Hashing:** Bcrypt with automatic salting  
✅ **Email Enumeration Protection:** Doesn't reveal if email exists  
✅ **Session Security:** HttpOnly cookies, SameSite protection  

---

## 🧪 Testing

### Test Password Reset
```bash
# In browser or curl:
curl -X POST http://localhost:3000/api/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check email inbox for reset link
# Click link → redirects to /reset-password?token=xxx
# Submit new password via form
```

### Test Email Verification
```bash
# 1. Register new account
# 2. Check email for verification link
# 3. Click link or make API call:

curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"verification-token-from-email"}'
```

---

## 🛠️ Troubleshooting

### Email Not Sending?
```bash
# Check Better Auth email configuration
# File: src/lib/auth/index.ts

emailAndPassword: {
  enabled: true,
  sendVerificationEmail: async ({ user, token }) => {
    // This should call your email service
  },
  sendResetPasswordEmail: async ({ user, url }) => {
    // This should call your email service
  },
}
```

### Rate Limit Hit?
```bash
# Better Auth rate limit: 10 req/min
# Wait 60 seconds and try again
# Or adjust in src/lib/auth/index.ts:

rateLimit: {
  enabled: true,
  window: 60,  // seconds
  max: 10,     // requests
}
```

### Token Invalid?
```bash
# Tokens expire automatically:
# - Password reset: 1 hour
# - Email verification: 24 hours
# Request new token if expired
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── auth/
│   │   ├── actions.ts          ← Cleaned (legacy removed)
│   │   ├── client.ts           ← Auth client exports
│   │   ├── index.ts            ← Better Auth config
│   │   └── email-config.ts     ← Email integration
│   └── email/
│       ├── sender.ts           ← Email functions
│       └── templates/auth/     ← Email templates
├── components/
│   └── auth/
│       ├── ForgotPasswordForm.tsx    ← Uses Better Auth API
│       ├── ResetPasswordForm.tsx     ← Uses Better Auth API
│       └── EmailVerificationNotice.tsx ← Uses Better Auth API
└── app/
    └── (auth)/
        └── verify-email/
            └── page.tsx              ← Uses Better Auth API
```

---

## 📝 Common Patterns

### Pattern 1: Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await fetch("/api/auth/[endpoint]", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (response.ok && !data.error) {
      // Success
      toast.success("Success!");
    } else {
      // Error
      toast.error(data.error?.message || "Failed");
    }
  } catch (error) {
    console.error("Request failed:", error);
    toast.error("Network error");
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Token Validation (Automatic)
```typescript
// No manual validation needed!
// Better Auth validates tokens server-side
// Just call the API endpoint

const response = await fetch("/api/auth/verify-email", {
  method: "POST",
  body: JSON.stringify({ token }),
});

// Better Auth handles:
// ✓ Token exists check
// ✓ Token expiration check
// ✓ Token format validation
// ✓ One-time use enforcement
```

---

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Build (checks for errors)
npm run build

# Check TypeScript errors
npx tsc --noEmit

# View database
npm run db:studio
```

---

## 🔗 Resources

- **Better Auth Docs:** https://www.better-auth.com/docs
- **Email Templates:** `src/lib/email/templates/auth/`
- **Auth Config:** `src/lib/auth/index.ts`
- **Security Guide:** `AUTH_SECURITY_UPGRADE_COMPLETE.md`

---

**Last Updated:** December 17, 2025  
**Migration:** Complete ✅  
**Security:** Production Ready 🔒
