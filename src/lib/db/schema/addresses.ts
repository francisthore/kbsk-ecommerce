import { pgTable, text, uuid, boolean } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { relations } from 'drizzle-orm';
import { users } from './user';
import { accounts } from './accounts/accounts';
import { addressTypeEnum } from './enums';

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Primary reference is now account_id for B2B/B2C unified addressing
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),
  // Keep user_id nullable for backward compatibility with legacy data
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: addressTypeEnum('type').notNull(),
  contactName: text('contact_name'),
  phone: text('phone'),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  account: one(accounts, {
    fields: [addresses.accountId],
    references: [accounts.id],
  }),
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const insertAddressSchema = z.object({
  accountId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  type: z.enum(['billing', 'shipping']),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const selectAddressSchema = insertAddressSchema.extend({
  id: z.string().uuid(),
});

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type SelectAddress = z.infer<typeof selectAddressSchema>;
