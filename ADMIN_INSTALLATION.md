# 📦 Installation & Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies

The following dependencies are required for the admin dashboard:

```bash
npm install react-hook-form @hookform/resolvers zod
```

**What these do:**
- `react-hook-form` - Form state management with excellent performance
- `@hookform/resolvers` - Integrates Zod validation with React Hook Form
- `zod` - Schema validation library (may already be installed)

---

### Step 2: Verify Existing Dependencies

These should already be installed (check `package.json`):

```json
{
  "dependencies": {
    "better-auth": "^1.3.7",
    "drizzle-orm": "^0.44.4",
    "lucide-react": "^0.475.0",
    "next": "^15.5.9",
    "tailwind-merge": "^3.4.0",
    "clsx": "^2.1.1",
    "uuid": "^11.1.0"
  }
}
```

✅ If all are present, you're good to go!

---

### Step 3: Generate Database Migration

```bash
# Generate migration files from schema
npx drizzle-kit generate
```

**Expected output:**
```
✔ Generating migration...
Created: drizzle/0001_add_user_roles_and_variant_options.sql
```

**Review the migration file** to ensure it includes:
- `CREATE TYPE user_role AS ENUM ('user', 'admin')`
- `ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user'`
- `CREATE TABLE variant_option_groups (...)`
- `CREATE TABLE variant_option_values (...)`
- `CREATE TABLE product_variant_options (...)`
- `CREATE TABLE variant_option_assignments (...)`

---

### Step 4: Apply Migration

```bash
# Apply migration to database
npx drizzle-kit migrate
```

**Expected output:**
```
✔ Applying migration...
✔ Migration successful!
```

**Verify in database:**
```sql
-- Check that new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'variant_option_groups', 
  'variant_option_values',
  'product_variant_options',
  'variant_option_assignments'
);

-- Check that users table has role column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'role';
```

---

### Step 5: Create Your First Admin User

**Option A: Using the Script (Recommended)**

```bash
node scripts/create-admin.mjs
```

You'll be prompted:
```
🔐 Admin User Creation Script

Enter email address of user to make admin: your@email.com

✅ SUCCESS! User "your@email.com" is now an admin.

🚀 You can now access the admin panel at: /admin
```

**Option B: Manual SQL**

```sql
-- First, ensure the user exists (register through normal signup)
-- Then update their role
UPDATE users 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

**Option C: Using Drizzle Studio**

```bash
npx drizzle-kit studio
```

1. Navigate to `http://localhost:4983`
2. Open the `users` table
3. Find your user by email
4. Change `role` from `'user'` to `'admin'`
5. Save changes

---

### Step 6: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.5.9
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

---

### Step 7: Test Admin Access

1. **Open browser:** `http://localhost:3000`
2. **Login** with your admin email
3. **Navigate to:** `http://localhost:3000/admin`

**Expected result:**
- ✅ You should see the admin dashboard
- ✅ Sidebar shows navigation menu
- ✅ Dashboard displays stats

**If redirected:**
- ❌ User is not logged in → Login first
- ❌ User role is not 'admin' → Run create-admin script again

---

## 🔧 Troubleshooting

### Issue 1: "Module not found: react-hook-form"

**Solution:**
```bash
npm install react-hook-form @hookform/resolvers
```

### Issue 2: "Migration fails with foreign key error"

**Cause:** Trying to add variant options to products that don't exist yet.

**Solution:**
```bash
# Ensure products, variants tables exist first
# Check migration order in drizzle/meta/_journal.json
# May need to generate migration again
npx drizzle-kit generate
```

### Issue 3: "Can't access /admin after setting role"

**Debug steps:**
```typescript
// Add to middleware.ts temporarily
console.log('Session:', session);
console.log('User role:', session?.user?.role);
```

**Common causes:**
- Session cookie not being set correctly
- Better Auth config missing `user.additionalFields`
- Role field not in database

**Solution:**
```bash
# Verify Better Auth config
# Check src/lib/auth/index.ts has:
user: {
  additionalFields: {
    role: {
      type: "string",
      defaultValue: "user",
      required: true,
      input: false,
    },
  },
}

# Then restart server
npm run dev
```

### Issue 4: "Transaction rollback error"

**Cause:** Foreign key constraint violation or missing required fields.

**Solution:**
```typescript
// Check server console for specific error
// Common issues:
// - categoryId doesn't exist in categories table
// - brandId doesn't exist in brands table
// - Missing required fields in variants array

// Ensure you have categories and brands:
SELECT * FROM categories;
SELECT * FROM brands;
```

### Issue 5: "Variant permutations not generating"

**Debug:**
```typescript
// In ProductForm.tsx, add console logs:
useEffect(() => {
  console.log('Selected options:', selectedOptions);
  console.log('Generated permutations:', permutations);
}, [selectedOptions]);
```

**Common causes:**
- Option group has no values
- Values array is empty
- Product name is empty

---

## 🔍 Verification Checklist

After installation, verify everything works:

### ✅ Database
- [ ] Migration applied successfully
- [ ] `users` table has `role` column
- [ ] New variant option tables exist
- [ ] Can view tables in Drizzle Studio

### ✅ Authentication
- [ ] Can register new user
- [ ] Can login
- [ ] Session cookie is set
- [ ] Admin user has `role = 'admin'`

### ✅ Admin Access
- [ ] Can access `/admin` as admin
- [ ] Cannot access `/admin` as regular user
- [ ] Sidebar loads correctly
- [ ] Dashboard displays

### ✅ Product Form
- [ ] Can navigate to `/admin/products/new`
- [ ] Form loads without errors
- [ ] Categories dropdown populates
- [ ] Brands dropdown populates
- [ ] Can add images
- [ ] Can add variant options
- [ ] Variants auto-generate when options added

### ✅ Product Creation
- [ ] Can submit form
- [ ] Success message appears
- [ ] Redirects to product list
- [ ] Product appears in list
- [ ] Product has correct variants

---

## 📊 Database Schema Verification

Run this SQL to verify all tables exist:

```sql
-- Check all admin-related tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN (
  'users',
  'products',
  'product_variants',
  'variant_option_groups',
  'variant_option_values',
  'product_variant_options',
  'variant_option_assignments'
)
ORDER BY table_name;
```

**Expected result:**
```
table_name                    | column_count
------------------------------|-------------
products                      | 18
product_variants              | 15
product_variant_options       | 5
users                         | 8  (should include 'role')
variant_option_assignments    | 3
variant_option_groups         | 4
variant_option_values         | 5
```

---

## 🎨 Optional Enhancements

### 1. Add Toast Notifications

Already installed! (`sonner` in package.json)

**Usage:**
```typescript
// In ProductForm.tsx
import { toast } from 'sonner';

// On success
toast.success('Product created successfully!');

// On error
toast.error('Failed to create product');
```

**Add to layout:**
```typescript
// src/app/(admin)/admin/layout.tsx
import { Toaster } from 'sonner';

export default function AdminLayout({ children }) {
  return (
    <div>
      <Toaster position="top-right" />
      {children}
    </div>
  );
}
```

### 2. Add Loading Skeletons

Create loading states:

```typescript
// src/app/(admin)/admin/products/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}
```

### 3. Add Error Boundaries

```typescript
// src/app/(admin)/admin/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
# Required
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://yourstore.com

# Optional (for OAuth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email service
RESEND_API_KEY=...
```

### Build and Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Or deploy to Vercel
vercel --prod
```

### Post-Deployment

1. **Apply migrations to production database**
   ```bash
   # Set DATABASE_URL to production
   npx drizzle-kit migrate
   ```

2. **Create admin users in production**
   ```bash
   node scripts/create-admin.mjs
   # Or run SQL directly on production DB
   ```

3. **Test admin access**
   - Visit `https://yourstore.com/admin`
   - Verify RBAC works
   - Test product creation

---

## 📚 Next Steps

After successful installation:

1. **Read the documentation:**
   - `ADMIN_DASHBOARD_IMPLEMENTATION.md` - Complete guide
   - `ADMIN_QUICK_REFERENCE.md` - Quick tips
   - `ADMIN_EXAMPLE_PRODUCT.md` - Tutorial
   - `ADMIN_DEPLOYMENT_CHECKLIST.md` - Production prep

2. **Customize the UI:**
   - Update colors in AdminSidebar
   - Add your company logo
   - Customize dashboard stats

3. **Add features:**
   - Image upload integration
   - Product editing
   - Bulk import
   - Analytics

4. **Optimize:**
   - Add database indexes
   - Enable caching
   - Implement pagination
   - Add search functionality

---

## 🆘 Getting Help

If you're stuck:

1. **Check documentation files** - Most answers are there
2. **Review code comments** - All files have inline explanations
3. **Check server logs** - `npm run dev` shows errors
4. **Use Drizzle Studio** - Inspect database state
5. **Test incrementally** - Start with simple product, add complexity

---

## ✅ Installation Complete!

You're ready to start using the admin dashboard. 🎉

**Quick test:**
1. ✅ Access `/admin`
2. ✅ Navigate to `/admin/products/new`
3. ✅ Create a simple product (name, image, 1 variant)
4. ✅ Submit and verify it appears in the list

**If all steps work, you're good to go! 🚀**
