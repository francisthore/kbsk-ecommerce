# Migration Guide - Tools/PPE E-commerce Schema

## Quick Start

### 1. Generate Migration

```bash
npx drizzle-kit generate
```

This will create migration files in `drizzle/` directory.

### 2. Review Generated SQL

Before running migrations, review the SQL files to ensure:
- All new enums are created
- Tables are created in the correct order (respecting foreign keys)
- Indexes are properly added
- Existing data won't be lost

### 3. Run Migrations

```bash
npx drizzle-kit migrate
```

Or if using a custom migration script:

```bash
npm run db:migrate
```

## Manual Migration Steps (If Needed)

If you need more control, follow these steps in order:

### Step 1: Create Enums

```sql
-- Account enums
CREATE TYPE account_type AS ENUM ('individual', 'business');
CREATE TYPE account_status AS ENUM ('active', 'suspended');
CREATE TYPE user_account_role AS ENUM ('owner', 'admin', 'buyer', 'viewer');
CREATE TYPE credit_terms AS ENUM ('prepaid', '30d', '60d');

-- Product enums
CREATE TYPE product_type AS ENUM ('tool', 'accessory', 'consumable', 'ppe');
CREATE TYPE media_kind AS ENUM ('image', 'video', 'doc');

-- Order enums (update existing)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending';
CREATE TYPE payment_term AS ENUM ('prepaid', '30d', '60d');

-- Payment enums (update existing)
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded';

-- Quote enums
CREATE TYPE quote_status AS ENUM ('draft', 'submitted', 'in_review', 'quoted', 'accepted', 'rejected', 'expired', 'converted');
CREATE TYPE quote_source AS ENUM ('self_service', 'sales_agent', 'import');
CREATE TYPE quote_event_type AS ENUM ('created', 'submitted', 'reviewed', 'quoted', 'accepted', 'rejected', 'expired', 'converted', 'updated', 'commented');

-- Review enum
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
```

### Step 2: Create Accounts Domain Tables

```sql
-- Main accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type account_type NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  default_billing_address_id UUID,
  default_shipping_address_id UUID,
  status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX accounts_type_idx ON accounts(type);
CREATE INDEX accounts_email_idx ON accounts(email);

-- User-Account junction
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role user_account_role NOT NULL DEFAULT 'buyer',
  UNIQUE(user_id, account_id)
);

-- Business profiles
CREATE TABLE business_profiles (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  vat_number TEXT,
  company_reg_number TEXT,
  website TEXT,
  credit_terms credit_terms NOT NULL DEFAULT 'prepaid',
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_list_id UUID,
  vat_exempt BOOLEAN NOT NULL DEFAULT false,
  purchase_order_required BOOLEAN NOT NULL DEFAULT false
);

-- Individual profiles
CREATE TABLE individual_profiles (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE
);
```

### Step 3: Update Existing Tables

```sql
-- Update addresses
ALTER TABLE addresses 
  ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  ADD COLUMN contact_name TEXT,
  ADD COLUMN phone TEXT,
  ALTER COLUMN user_id DROP NOT NULL;

-- Update products
ALTER TABLE products
  ADD COLUMN slug TEXT UNIQUE NOT NULL,
  ADD COLUMN product_type product_type NOT NULL DEFAULT 'tool',
  ADD COLUMN specs JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN is_bundle BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN hazmat BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN un_number TEXT,
  ADD COLUMN seo_meta_title TEXT,
  ADD COLUMN seo_meta_description TEXT,
  ADD COLUMN deleted_at TIMESTAMP,
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN gender_id DROP NOT NULL; -- Make gender optional

CREATE INDEX products_slug_idx ON products(slug);

-- Update product_variants
ALTER TABLE product_variants
  ADD COLUMN gender_id UUID REFERENCES genders(id) ON DELETE SET NULL,
  ADD COLUMN backorderable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN restock_date TIMESTAMP,
  ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN specs JSONB,
  ADD COLUMN deleted_at TIMESTAMP,
  ALTER COLUMN color_id DROP NOT NULL,
  ALTER COLUMN size_id DROP NOT NULL,
  ALTER COLUMN weight TYPE NUMERIC(10,3);

-- Update product_images
ALTER TABLE product_images
  ADD COLUMN kind media_kind NOT NULL DEFAULT 'image';

CREATE INDEX product_images_product_sort_idx ON product_images(product_id, sort_order);

-- Update brands
ALTER TABLE brands
  ADD COLUMN website TEXT,
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Update categories
ALTER TABLE categories
  ADD COLUMN description TEXT,
  ADD COLUMN image_url TEXT,
  ADD COLUMN seo_meta_title TEXT,
  ADD COLUMN seo_meta_description TEXT;

-- Update genders (add indexes)
CREATE INDEX genders_slug_idx ON genders(slug);
CREATE INDEX genders_label_idx ON genders(label);

-- Update reviews
ALTER TABLE reviews
  ADD COLUMN title TEXT,
  ADD COLUMN pros TEXT,
  ADD COLUMN cons TEXT,
  ADD COLUMN status review_status NOT NULL DEFAULT 'pending';

-- Update carts
ALTER TABLE carts
  ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- Update orders
ALTER TABLE orders
  ADD COLUMN account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE SET NULL,
  ADD COLUMN po_number TEXT,
  ADD COLUMN payment_term payment_term,
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN subtotal NUMERIC(12,2) NOT NULL,
  ADD COLUMN discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN shipping_method_id UUID,
  ADD COLUMN quote_id UUID,
  ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX orders_account_status_idx ON orders(account_id, status);

-- Update order_items
ALTER TABLE order_items
  ADD COLUMN tax_rate NUMERIC(5,4),
  ADD COLUMN tax_amount NUMERIC(10,2);

-- Update payments
ALTER TABLE payments
  ADD COLUMN meta JSONB;
```

### Step 4: Create New Tables

```sql
-- Product standards
CREATE TABLE product_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT,
  UNIQUE(product_id, code)
);

-- Product bundles
CREATE TABLE product_bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  child_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(parent_product_id, child_product_id)
);

-- Product compatibility
CREATE TABLE product_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  UNIQUE(product_id, platform)
);

-- Shipping methods
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  flat_rate NUMERIC(10,2),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Price lists
CREATE TABLE price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Price list items
CREATE TABLE price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  UNIQUE(price_list_id, product_variant_id, min_qty)
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes_from_customer TEXT,
  internal_notes TEXT,
  valid_until TIMESTAMP,
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  billing_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  cart_id UUID REFERENCES carts(id) ON DELETE SET NULL,
  source quote_source NOT NULL DEFAULT 'self_service',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX quotes_account_status_idx ON quotes(account_id, status);

-- Quote items
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  target_price NUMERIC(10,2),
  quoted_unit_price NUMERIC(10,2),
  line_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  line_notes TEXT
);

-- Quote events
CREATE TABLE quote_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  event_type quote_event_type NOT NULL,
  by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  at TIMESTAMP NOT NULL DEFAULT NOW(),
  payload JSONB
);
```

### Step 5: Add Foreign Key Constraints

```sql
-- Link business profiles to price lists
ALTER TABLE business_profiles
  ADD CONSTRAINT fk_business_profiles_price_list
  FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE SET NULL;

-- Link orders to shipping methods
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_shipping_method
  FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id) ON DELETE SET NULL;

-- Link orders to quotes
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_quote
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;

-- Link accounts to addresses (circular reference, handle carefully)
ALTER TABLE accounts
  ADD CONSTRAINT fk_accounts_default_billing_address
  FOREIGN KEY (default_billing_address_id) REFERENCES addresses(id) ON DELETE SET NULL;

ALTER TABLE accounts
  ADD CONSTRAINT fk_accounts_default_shipping_address
  FOREIGN KEY (default_shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL;
```

## Data Migration

### Migrate Existing Users to Accounts

```sql
-- Create individual accounts for existing users
INSERT INTO accounts (id, type, email, phone, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'individual',
  u.email,
  NULL, -- Add phone if available
  'active',
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a WHERE a.email = u.email
);

-- Link users to their accounts
INSERT INTO user_accounts (user_id, account_id, role)
SELECT 
  u.id,
  a.id,
  'owner'
FROM users u
JOIN accounts a ON a.email = u.email
WHERE a.type = 'individual';

-- Create individual profiles
INSERT INTO individual_profiles (account_id, first_name, last_name)
SELECT 
  a.id,
  COALESCE(u.name, 'User'),
  '',
FROM users u
JOIN accounts a ON a.email = u.email
WHERE a.type = 'individual';

-- Migrate addresses to new structure
UPDATE addresses addr
SET account_id = ua.account_id
FROM user_accounts ua
WHERE addr.user_id = ua.user_id;

-- Migrate carts to new structure
UPDATE carts c
SET account_id = ua.account_id
FROM user_accounts ua
WHERE c.user_id = ua.user_id;

-- Migrate orders to new structure
UPDATE orders o
SET account_id = ua.account_id
FROM user_accounts ua
WHERE o.user_id = ua.user_id;
```

## Rollback Plan

If you need to rollback:

1. **Backup First**: Always backup your database before migrations
2. **Drizzle Kit**: `npx drizzle-kit drop` (careful - this drops everything!)
3. **Manual**: Drop tables in reverse order of creation

```sql
-- Drop in reverse order
DROP TABLE IF EXISTS quote_events CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS price_list_items CASCADE;
DROP TABLE IF EXISTS price_lists CASCADE;
DROP TABLE IF EXISTS shipping_methods CASCADE;
DROP TABLE IF EXISTS product_compatibility CASCADE;
DROP TABLE IF EXISTS product_bundle_items CASCADE;
DROP TABLE IF EXISTS product_standards CASCADE;
DROP TABLE IF EXISTS individual_profiles CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Drop new enums
DROP TYPE IF EXISTS quote_event_type;
DROP TYPE IF EXISTS quote_source;
DROP TYPE IF EXISTS quote_status;
DROP TYPE IF EXISTS review_status;
DROP TYPE IF EXISTS media_kind;
DROP TYPE IF EXISTS product_type;
DROP TYPE IF EXISTS payment_term;
DROP TYPE IF EXISTS credit_terms;
DROP TYPE IF EXISTS user_account_role;
DROP TYPE IF EXISTS account_status;
DROP TYPE IF EXISTS account_type;
```

## Verification

After migration, verify:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Check indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Troubleshooting

### Common Issues

1. **Enum value already exists**: Safe to ignore if using `IF NOT EXISTS`
2. **Foreign key constraint violation**: Ensure parent tables are created first
3. **Column already exists**: Check if partial migration was run
4. **Unique constraint violation**: Check for duplicate data before adding unique constraints

### Getting Help

- Check Drizzle ORM docs: https://orm.drizzle.team/
- Review generated SQL in `drizzle/` directory
- Test on a copy of production data first
