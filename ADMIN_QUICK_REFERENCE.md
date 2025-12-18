# 🎯 Admin Dashboard Quick Reference

## 🚀 Quick Start

### 1. Run Migrations
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 2. Create Admin User
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Access Admin Panel
```
http://localhost:3000/admin
```

---

## 📋 Key Files Reference

### **Authentication & Authorization**

| File | Purpose | Key Feature |
|------|---------|-------------|
| `src/lib/db/schema/user.ts` | User schema | Added `role` field |
| `src/lib/auth/index.ts` | Better Auth config | Exposes role in session |
| `src/middleware.ts` | Route protection | Checks admin role from cookie |

### **Product Management**

| File | Purpose |
|------|---------|
| `src/lib/db/schema/variantOptions.ts` | Variant option schemas |
| `src/lib/validations/product.ts` | Zod validation schemas |
| `src/lib/actions/product.ts` | Server actions (create, fetch) |
| `src/lib/utils/product.ts` | Slug, SKU, permutation utilities |

### **UI Components**

| File | Purpose |
|------|---------|
| `src/app/(admin)/admin/layout.tsx` | Admin layout wrapper |
| `src/components/admin/AdminSidebar.tsx` | Navigation sidebar |
| `src/components/admin/ProductForm.tsx` | Product creation form |
| `src/components/admin/ProductsTable.tsx` | Product listing table |

---

## 🔑 Core Concepts

### **RBAC Flow**
```
User Login → Better Auth creates session
           → Session includes role field
           → Middleware reads cookie
           → Checks role === 'admin'
           → Allows/Denies access
```

### **Product Creation Flow**
```
1. Fill Product Form
   ├── Name, Description, Category
   ├── Add Images
   ├── Add Variant Options (Color, Size)
   └── Auto-generates Variants (permutations)

2. Submit Form
   ├── Client validation (Zod)
   ├── Server action verifies admin
   ├── Database transaction:
   │   ├── Insert product
   │   ├── Insert images
   │   ├── Insert option groups/values
   │   ├── Insert variants
   │   └── Link option assignments
   └── Revalidate cache

3. Result
   └── Product appears in /admin/products
```

### **Variant Permutation Example**

**Input:**
```javascript
Options: [
  { name: "Color", values: ["Red", "Blue"] },
  { name: "Size", values: ["S", "M", "L"] }
]
```

**Output:**
```javascript
Variants: [
  { sku: "PRO-RE-S-abc", options: { Color: "Red", Size: "S" } },
  { sku: "PRO-RE-M-abc", options: { Color: "Red", Size: "M" } },
  { sku: "PRO-RE-L-abc", options: { Color: "Red", Size: "L" } },
  { sku: "PRO-BL-S-def", options: { Color: "Blue", Size: "S" } },
  { sku: "PRO-BL-M-def", options: { Color: "Blue", Size: "M" } },
  { sku: "PRO-BL-L-def", options: { Color: "Blue", Size: "L" } },
]
// 6 variants auto-generated from 2×3 combinations
```

---

## 🛠️ Common Tasks

### **Add a New Admin User**
```typescript
// In Drizzle Studio or SQL
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### **Check User Role in Code**
```typescript
// Server Component
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const session = await auth.api.getSession({ headers: await headers() });
console.log(session.user.role); // 'user' or 'admin'
```

### **Protect a Server Action**
```typescript
'use server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function myAdminAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  // ... your logic
}
```

### **Generate Unique Slug**
```typescript
import { generateUniqueSlug } from '@/lib/actions/product';

const slug = await generateUniqueSlug("My Product Name");
// Result: "my-product-name" or "my-product-name-1" if exists
```

### **Create Variant Permutations**
```typescript
import { generateVariantPermutations } from '@/lib/utils/product';

const permutations = generateVariantPermutations("T-Shirt", [
  {
    groupId: "1",
    groupName: "Color",
    values: [
      { valueId: "a", value: "Red" },
      { valueId: "b", value: "Blue" }
    ]
  },
  {
    groupId: "2",
    groupName: "Size",
    values: [
      { valueId: "c", value: "S" },
      { valueId: "d", value: "M" }
    ]
  }
]);

// Returns: 4 permutations (Red-S, Red-M, Blue-S, Blue-M)
```

---

## 🔒 Security Checklist

- [x] Role stored in database (users.role)
- [x] Role exposed in session cookie (Better Auth config)
- [x] Middleware protects /admin routes
- [x] Server-side auth check in admin layout
- [x] Server actions verify admin role
- [x] All inputs validated with Zod
- [x] Database operations use transactions
- [x] SQL injection protected (Drizzle ORM)
- [x] Role cannot be set from client input

---

## 📊 Database Schema Overview

### **New Tables**

```sql
-- User role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role to users
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user';

-- Variant option groups (e.g., "Color", "Size")
CREATE TABLE variant_option_groups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Variant option values (e.g., "Red", "Blue")
CREATE TABLE variant_option_values (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES variant_option_groups(id),
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product-option group junction
CREATE TABLE product_variant_options (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  group_id UUID REFERENCES variant_option_groups(id),
  required BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- Variant-option value junction
CREATE TABLE variant_option_assignments (
  id UUID PRIMARY KEY,
  variant_id UUID REFERENCES product_variants(id),
  option_value_id UUID REFERENCES variant_option_values(id)
);
```

---

## 🎨 UI Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/admin` | Dashboard | Admin only |
| `/admin/products` | Product list | Admin only |
| `/admin/products/new` | Add product | Admin only |
| `/admin/products/[id]/edit` | Edit product | Admin only (not yet implemented) |
| `/admin/categories` | Manage categories | Admin only (stub) |
| `/admin/brands` | Manage brands | Admin only (stub) |
| `/admin/orders` | Order management | Admin only (stub) |

---

## 🐛 Common Errors & Solutions

### **"Unauthorized: Admin access required"**
```typescript
// Solution: Ensure user role is 'admin'
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### **"Slug already exists"**
```typescript
// Solution: Use generateUniqueSlug instead of generateSlug
const slug = await generateUniqueSlug(productName);
```

### **"Session is undefined in middleware"**
```typescript
// Solution: Check Better Auth config
// Ensure session cookie is being set correctly
// Verify NEXT_PUBLIC_APP_URL is correct
```

### **"Variants array is empty"**
```typescript
// Solution: Ensure at least one variant or option group exists
// If using options, check that values array is not empty
```

### **Transaction fails**
```typescript
// Solution: Check foreign keys
// Ensure categoryId, brandId exist in respective tables
// Verify all required fields are provided
```

---

## 📦 Dependencies Used

```json
{
  "better-auth": "Session management with role support",
  "drizzle-orm": "Type-safe database ORM",
  "zod": "Schema validation",
  "react-hook-form": "Form state management",
  "@hookform/resolvers": "Zod + React Hook Form integration",
  "lucide-react": "Icon library",
  "tailwindcss": "Styling",
  "next": "Framework (v15)"
}
```

---

## 🎯 Testing Checklist

- [ ] Access /admin without auth → Redirects to /
- [ ] Login as regular user → Can't access /admin
- [ ] Update role to admin → Can access /admin
- [ ] Create product without images → Validation error
- [ ] Create product with duplicate slug → Error shown
- [ ] Create product with variant options → Permutations generate
- [ ] Submit valid product → Appears in product list
- [ ] Logout → Can't access /admin anymore
- [ ] Middleware runs on route change → No unauthorized access

---

## 📚 Learn More

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [React Hook Form Docs](https://react-hook-form.com)
- [Zod Docs](https://zod.dev)

---

**Last Updated:** Implementation Complete ✅
