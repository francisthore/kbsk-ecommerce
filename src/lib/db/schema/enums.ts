import { pgEnum } from 'drizzle-orm/pg-core';

// User-related enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

// Account-related enums
export const accountTypeEnum = pgEnum('account_type', ['individual', 'business']);
export const accountStatusEnum = pgEnum('account_status', ['active', 'suspended']);
export const userAccountRoleEnum = pgEnum('user_account_role', ['owner', 'admin', 'buyer', 'viewer']);
export const creditTermsEnum = pgEnum('credit_terms', ['prepaid', '30d', '60d']);

// Address-related enums
export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping']);

// Product-related enums
export const productTypeEnum = pgEnum('product_type', ['tool', 'accessory', 'consumable', 'ppe']);
export const mediaKindEnum = pgEnum('media_kind', ['image', 'video', 'doc']);

// Order-related enums
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);
export const paymentTermEnum = pgEnum('payment_term', ['prepaid', '30d', '60d']);

// Payment-related enums
export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'paypal', 'cod', 'bank_transfer']);
export const paymentStatusEnum = pgEnum('payment_status', ['initiated', 'completed', 'failed', 'refunded']);

// Quote-related enums
export const quoteStatusEnum = pgEnum('quote_status', [
  'draft',
  'submitted',
  'in_review',
  'quoted',
  'accepted',
  'rejected',
  'expired',
  'converted',
]);
export const quoteSourceEnum = pgEnum('quote_source', ['self_service', 'sales_agent', 'import']);
export const quoteEventTypeEnum = pgEnum('quote_event_type', [
  'created',
  'submitted',
  'reviewed',
  'quoted',
  'accepted',
  'rejected',
  'expired',
  'converted',
  'updated',
  'commented',
]);

// Review-related enums
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);
