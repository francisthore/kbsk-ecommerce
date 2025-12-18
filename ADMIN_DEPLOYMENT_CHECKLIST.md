# 🚀 Admin Dashboard Deployment Checklist

Complete this checklist before deploying to production.

---

## ✅ Pre-Deployment Steps

### 1. **Database Migration**

- [ ] Generate migration files
  ```bash
  npx drizzle-kit generate
  ```

- [ ] Review generated SQL migration
  ```bash
  # Check drizzle/[timestamp]_*.sql
  # Verify it includes:
  # - CREATE TYPE user_role ENUM
  # - ALTER TABLE users ADD COLUMN role
  # - CREATE TABLE variant_option_groups
  # - CREATE TABLE variant_option_values
  # - CREATE TABLE product_variant_options
  # - CREATE TABLE variant_option_assignments
  ```

- [ ] Apply migration to **STAGING** database first
  ```bash
  # Set DATABASE_URL to staging
  npx drizzle-kit migrate
  ```

- [ ] Test admin flow on staging
- [ ] Apply migration to **PRODUCTION** database
  ```bash
  # Set DATABASE_URL to production
  npx drizzle-kit migrate
  ```

---

### 2. **Create Admin Users**

- [ ] Identify admin users (emails)
- [ ] Ensure users have registered accounts
- [ ] Run admin creation script OR manually update:
  ```bash
  node scripts/create-admin.mjs
  ```
  
  **OR in SQL:**
  ```sql
  UPDATE users 
  SET role = 'admin' 
  WHERE email IN (
    'admin1@yourcompany.com',
    'admin2@yourcompany.com'
  );
  ```

- [ ] Verify admin users can access `/admin`

---

### 3. **Environment Variables**

Verify these are set in production:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://yourstore.com)
- [ ] `GOOGLE_CLIENT_ID` - OAuth (if using)
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth (if using)
- [ ] Email service credentials (Resend, SendGrid, etc.)

---

### 4. **Security Audit**

- [ ] Test middleware protection:
  - [ ] Access `/admin` without auth → Redirects
  - [ ] Access `/admin` as regular user → Redirects
  - [ ] Access `/admin` as admin → Works

- [ ] Test server actions:
  - [ ] Try `createProduct()` without admin role → Throws error
  - [ ] Try `createProduct()` with admin role → Works

- [ ] Verify session cookie settings:
  ```typescript
  // In src/lib/auth/index.ts
  secure: process.env.NODE_ENV === "production", // ✅ Should be true
  httpOnly: true,                                // ✅ Must be true
  sameSite: "lax",                               // ✅ Recommended
  ```

- [ ] Check CORS/Trusted Origins:
  ```typescript
  trustedOrigins: [
    "http://localhost:3000",      // Development
    "https://yourstore.com",      // Production
    "https://www.yourstore.com",  // WWW variant
  ]
  ```

---

### 5. **Performance Optimization**

- [ ] Image optimization:
  - [ ] Use CDN for product images (Cloudinary, Vercel Blob, etc.)
  - [ ] Compress images before upload
  - [ ] Use Next.js `<Image>` component

- [ ] Database indexes:
  ```sql
  -- Verify these indexes exist:
  CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
  CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
  CREATE INDEX IF NOT EXISTS product_variants_sku_idx ON product_variants(sku);
  ```

- [ ] Enable Better Auth cache:
  ```typescript
  // Already configured in src/lib/auth/index.ts
  sessions: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  }
  ```

---

### 6. **Error Handling**

- [ ] Add error boundaries to admin pages:
  ```typescript
  // src/app/(admin)/admin/error.tsx
  'use client';
  
  export default function Error({ error, reset }) {
    return (
      <div className="p-6">
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  ```

- [ ] Set up error logging (Sentry, LogRocket, etc.)

- [ ] Add toast notifications for user feedback:
  ```bash
  npm install sonner
  ```

---

### 7. **Testing**

#### **Unit Tests** (Optional but Recommended)

- [ ] Test slug generation:
  ```typescript
  import { generateSlug } from '@/lib/utils/product';
  
  expect(generateSlug('Hello World')).toBe('hello-world');
  expect(generateSlug('Test & Product!')).toBe('test-product');
  ```

- [ ] Test variant permutations:
  ```typescript
  import { generateVariantPermutations } from '@/lib/utils/product';
  
  const result = generateVariantPermutations('Test', [
    {
      groupId: '1',
      groupName: 'Color',
      values: [{ valueId: 'a', value: 'Red' }, { valueId: 'b', value: 'Blue' }]
    }
  ]);
  
  expect(result).toHaveLength(2);
  ```

#### **Integration Tests**

- [ ] Create product with variants
- [ ] Edit existing product
- [ ] Delete product (soft delete)
- [ ] Check slug uniqueness
- [ ] Verify transaction rollback on error

#### **E2E Tests** (Playwright/Cypress)

- [ ] Admin login flow
- [ ] Navigate to `/admin/products/new`
- [ ] Fill complete product form
- [ ] Submit and verify success
- [ ] Check product appears in list

---

### 8. **UI/UX Polish**

- [ ] Add loading states to all async operations
- [ ] Add success/error toast notifications
- [ ] Implement proper error messages
- [ ] Add confirmation dialogs for destructive actions (delete)
- [ ] Ensure mobile responsiveness
- [ ] Add keyboard shortcuts (optional)

---

### 9. **Documentation**

- [ ] Document admin user creation process
- [ ] Create internal admin guide
- [ ] Document product creation workflow
- [ ] Add API documentation for server actions
- [ ] Create troubleshooting guide

---

### 10. **Monitoring & Analytics**

- [ ] Set up application monitoring (Vercel Analytics, etc.)
- [ ] Track admin dashboard usage
- [ ] Monitor error rates
- [ ] Set up alerts for critical failures
- [ ] Log all admin actions for audit trail

---

## 🔄 Post-Deployment Verification

### **Immediately After Deployment:**

- [ ] **Test admin access** - Can admin users login and access `/admin`?
- [ ] **Create test product** - Walk through full product creation flow
- [ ] **Verify on shop** - Does product appear correctly on shop page?
- [ ] **Test cart** - Add product variants to cart
- [ ] **Check analytics** - Are page views being tracked?

### **Within 24 Hours:**

- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify email notifications work
- [ ] Test on multiple devices/browsers
- [ ] Gather initial admin user feedback

### **Within 1 Week:**

- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Fix any reported bugs
- [ ] Gather feature requests
- [ ] Plan next iteration

---

## 🚨 Rollback Plan

If critical issues occur:

### **Option 1: Quick Fix**
```bash
# Fix bug in code
git commit -m "fix: critical admin bug"
git push origin main
# Vercel auto-deploys
```

### **Option 2: Rollback Deployment**
```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"
```

### **Option 3: Rollback Database**
```sql
-- Only if migration caused issues
-- Restore from backup
-- Or manually remove new tables/columns
DROP TABLE IF EXISTS variant_option_assignments;
DROP TABLE IF EXISTS product_variant_options;
DROP TABLE IF EXISTS variant_option_values;
DROP TABLE IF EXISTS variant_option_groups;
ALTER TABLE users DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS user_role;
```

---

## 📊 Success Metrics

Track these KPIs after launch:

- **Admin Adoption**
  - Number of admin users
  - Daily active admins
  - Products created per week

- **Performance**
  - Page load time for `/admin`
  - Product creation success rate
  - Average time to create product

- **Errors**
  - Error rate (< 1% target)
  - Failed product creations
  - Session timeout issues

- **Usage**
  - Most used features
  - Bottlenecks in workflow
  - Feature requests

---

## 🎯 Post-Launch Roadmap

### **Phase 2: Enhanced Features**
- [ ] Bulk product import (CSV)
- [ ] Image upload integration (S3/Cloudinary)
- [ ] Product duplication feature
- [ ] Draft auto-save
- [ ] Product analytics dashboard

### **Phase 3: Advanced Management**
- [ ] Inventory alerts (low stock)
- [ ] Price history tracking
- [ ] Competitor price comparison
- [ ] SEO score for products
- [ ] A/B testing for product pages

### **Phase 4: Team Collaboration**
- [ ] Activity log (who changed what)
- [ ] Comment system for products
- [ ] Approval workflow (editor → admin)
- [ ] Role-based permissions (editor, viewer, admin)
- [ ] Team notifications

---

## ✅ Final Sign-Off

Before marking as production-ready:

- [ ] **Technical Lead Review** - Code quality approved
- [ ] **Security Audit Complete** - No critical vulnerabilities
- [ ] **Performance Tests Pass** - Meets speed requirements
- [ ] **Admin User Training** - Team knows how to use system
- [ ] **Backup Strategy** - Database backups configured
- [ ] **Monitoring Active** - Alerts configured
- [ ] **Documentation Complete** - All guides written
- [ ] **Stakeholder Approval** - Business team approves

---

**Deployment Date:** ______________

**Deployed By:** ______________

**Production URL:** https://________________

**Status:** 🟢 Live | 🟡 Staging | 🔴 Issues

---

## 📞 Support Contacts

**Technical Issues:**
- Lead Developer: ________________
- DevOps: ________________

**Business Issues:**
- Product Manager: ________________
- Admin Users: ________________

**Emergency:**
- On-Call: ________________

---

**Good luck with your deployment! 🚀**
