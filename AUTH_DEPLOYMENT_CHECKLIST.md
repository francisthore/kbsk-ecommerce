# ✅ KBSK Trading Authentication - Deployment Checklist

Use this checklist to ensure your authentication system is properly configured before going to production.

## 🔧 Pre-Deployment Checklist

### Environment Configuration

- [ ] **Copy .env.example to .env.local**
  ```bash
  cp .env.example .env.local
  ```

- [ ] **Set DATABASE_URL**
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/kbsk_db
  ```

- [ ] **Generate AUTH_SECRET**
  ```bash
  openssl rand -base64 32
  ```
  Add to `.env.local`:
  ```env
  AUTH_SECRET=<your-generated-secret>
  ```

- [ ] **Set NEXT_PUBLIC_APP_URL**
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

### Database Setup

- [ ] **Run database migrations**
  ```bash
  npm run db:push
  ```

- [ ] **Verify tables exist**
  - users
  - sessions
  - accounts
  - verifications
  - guests

### Email Service (Choose One)

#### Option 1: Resend (Recommended)

- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Get API key
- [ ] Verify sender domain
- [ ] Add to `.env.local`:
  ```env
  RESEND_API_KEY=re_xxxxxxxxxxxxx
  EMAIL_FROM=noreply@kbsktrading.com
  EMAIL_FROM_NAME=KBSK Trading
  ```
- [ ] Update `/src/lib/auth/index.ts` with Resend integration
- [ ] Test sending verification email

#### Option 2: SendGrid

- [ ] Sign up at [sendgrid.com](https://sendgrid.com)
- [ ] Get API key
- [ ] Verify sender domain
- [ ] Add to `.env.local`:
  ```env
  SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
  EMAIL_FROM=noreply@kbsktrading.com
  ```
- [ ] Update `/src/lib/auth/index.ts` with SendGrid integration
- [ ] Test sending verification email

### Google OAuth Setup

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing
- [ ] Enable Google+ API
- [ ] Go to Credentials → Create Credentials → OAuth 2.0 Client ID
- [ ] Configure OAuth consent screen
  - [ ] App name: "KBSK Trading"
  - [ ] User support email
  - [ ] Developer contact
  - [ ] Scopes: email, profile, openid
- [ ] Create OAuth 2.0 Client ID
  - [ ] Application type: Web application
  - [ ] Authorized JavaScript origins:
    - Development: `http://localhost:3000`
    - Production: `https://yourdomain.com`
  - [ ] Authorized redirect URIs:
    - Development: `http://localhost:3000/api/auth/callback/google`
    - Production: `https://yourdomain.com/api/auth/callback/google`
- [ ] Copy Client ID and Secret
- [ ] Add to `.env.local`:
  ```env
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```
- [ ] Test Google OAuth flow

### Testing (Development)

- [ ] **Test Email/Password Signup**
  1. Visit `/signup`
  2. Create account
  3. Check for verification email/console log
  4. Verify email
  5. Sign in

- [ ] **Test Email/Password Login**
  1. Visit `/login`
  2. Enter credentials
  3. Verify successful login
  4. Check session persistence

- [ ] **Test Google OAuth**
  1. Visit `/login`
  2. Click "Continue with Google"
  3. Complete Google consent
  4. Verify successful login
  5. Check account linking

- [ ] **Test Password Reset**
  1. Visit `/forgot-password`
  2. Enter email
  3. Check for reset email/console log
  4. Click reset link
  5. Set new password
  6. Sign in with new password

- [ ] **Test Route Protection**
  1. Visit `/account` (logged out)
  2. Should redirect to `/login?redirect=/account`
  3. Sign in
  4. Should redirect to `/account`

- [ ] **Test Guest Cart Merge**
  1. Add items to cart (logged out)
  2. Sign in or sign up
  3. Verify cart items preserved

- [ ] **Test Sign Out**
  1. Sign in
  2. Click sign out
  3. Verify redirect to home
  4. Verify cannot access protected routes

- [ ] **Test Mobile Responsiveness**
  - [ ] Login page
  - [ ] Signup page
  - [ ] Password reset pages
  - [ ] Account panel

- [ ] **Test Accessibility**
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast
  - [ ] ARIA labels

## 🚀 Production Deployment Checklist

### Environment Variables (Production)

- [ ] Set `NODE_ENV=production`
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Generate new `AUTH_SECRET` for production
  ```bash
  openssl rand -base64 32
  ```
- [ ] Update `DATABASE_URL` to production database
- [ ] Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with production credentials
- [ ] Set email service API keys
- [ ] Add production domains to `TRUSTED_ORIGINS`
  ```env
  TRUSTED_ORIGINS=https://kbsktrading.com,https://www.kbsktrading.com
  ```

### Security Configuration

- [ ] **Enable HTTPS**
  - Required for Google OAuth
  - Required for secure cookies

- [ ] **Configure Security Headers**
  - [ ] Strict-Transport-Security
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Referrer-Policy

- [ ] **Set Cookie Security**
  - Automatically handled in production via Better Auth
  - `secure: true`
  - `httpOnly: true`
  - `sameSite: 'lax'`

- [ ] **Configure Rate Limiting**
  - Review limits in `/src/lib/auth/index.ts`
  - Adjust based on expected traffic

- [ ] **Review CORS Settings**
  - Ensure only trusted origins allowed

### Database (Production)

- [ ] **Backup Database**
  ```bash
  pg_dump -U user -d kbsk_db > backup.sql
  ```

- [ ] **Run Migrations**
  ```bash
  npm run db:push
  ```

- [ ] **Verify Tables**
  - Check all auth tables exist
  - Verify indexes are created

### Email Service (Production)

- [ ] **Verify Sender Domain**
  - Add DNS records (SPF, DKIM, DMARC)
  - Verify domain in email service

- [ ] **Test Email Delivery**
  - Send test verification email
  - Send test password reset email
  - Check spam score

- [ ] **Configure Email Templates**
  - Professional email design
  - Include company branding
  - Clear call-to-action

### Google OAuth (Production)

- [ ] **Update OAuth Consent Screen**
  - Add production app name
  - Add privacy policy URL
  - Add terms of service URL

- [ ] **Update Redirect URIs**
  - Add production domain
  - Remove development URIs (optional)

- [ ] **Test OAuth Flow**
  - Test from production domain
  - Verify SSL certificate

### Monitoring & Logging

- [ ] **Set up Error Logging**
  - [ ] Sentry, LogRocket, or similar
  - [ ] Log authentication errors
  - [ ] Log OAuth failures

- [ ] **Set up Analytics**
  - [ ] Track signup conversions
  - [ ] Track OAuth usage
  - [ ] Track password resets

- [ ] **Set up Alerts**
  - [ ] Failed login attempts
  - [ ] Unusual activity
  - [ ] Email delivery failures

### Performance

- [ ] **Database Indexes**
  - [ ] Index on users.email
  - [ ] Index on sessions.token
  - [ ] Index on verifications.value

- [ ] **Caching**
  - [ ] Session caching enabled (Better Auth default)
  - [ ] Database query optimization

- [ ] **CDN Configuration**
  - [ ] Serve static assets from CDN
  - [ ] Cache auth pages appropriately

### Final Testing (Production)

- [ ] **Smoke Tests**
  - [ ] Signup flow
  - [ ] Login flow
  - [ ] OAuth flow
  - [ ] Password reset flow
  - [ ] Email verification
  - [ ] Cart merge

- [ ] **Load Testing**
  - [ ] Test concurrent signups
  - [ ] Test concurrent logins
  - [ ] Verify rate limiting works

- [ ] **Security Testing**
  - [ ] SQL injection attempts
  - [ ] XSS attempts
  - [ ] CSRF token validation
  - [ ] Session hijacking prevention

### Documentation

- [ ] **Update README**
  - [ ] Production URLs
  - [ ] Support contact
  - [ ] Known issues

- [ ] **Create Runbook**
  - [ ] Common issues
  - [ ] Troubleshooting steps
  - [ ] Escalation procedures

- [ ] **User Documentation**
  - [ ] How to sign up
  - [ ] How to reset password
  - [ ] Privacy policy
  - [ ] Terms of service

### Legal & Compliance

- [ ] **Privacy Policy**
  - [ ] Data collection disclosure
  - [ ] OAuth data usage
  - [ ] Cookie policy

- [ ] **Terms of Service**
  - [ ] Account usage terms
  - [ ] User responsibilities

- [ ] **GDPR Compliance** (if applicable)
  - [ ] Right to erasure
  - [ ] Data export
  - [ ] Consent tracking

- [ ] **Cookie Consent**
  - [ ] Cookie banner
  - [ ] Consent management

## 📋 Post-Deployment Checklist

### Day 1

- [ ] Monitor error logs
- [ ] Check email delivery
- [ ] Verify OAuth working
- [ ] Monitor signup rate
- [ ] Check database connections

### Week 1

- [ ] Review authentication metrics
- [ ] Check for security issues
- [ ] Optimize slow queries
- [ ] User feedback review
- [ ] Bug fixes as needed

### Month 1

- [ ] Security audit
- [ ] Performance review
- [ ] User experience improvements
- [ ] Feature requests prioritization

## 🆘 Emergency Contacts

```
Development Team: dev@kbsktrading.com
Security Issues: security@kbsktrading.com
Support: support@kbsktrading.com
```

## 📊 Success Metrics

Track these metrics post-deployment:

- Signup conversion rate
- OAuth vs email/password ratio
- Failed login attempts
- Password reset requests
- Email verification rate
- Session duration
- Cart abandonment rate

## ✅ Sign-Off

- [ ] **Development Lead**: _______________
- [ ] **QA Lead**: _______________
- [ ] **Security Review**: _______________
- [ ] **Product Owner**: _______________

**Deployment Date**: _______________

---

**🎉 Congratulations!** You're ready to deploy the KBSK Trading authentication system to production!
