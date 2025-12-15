import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { accountTypeEnum, accountStatusEnum } from '../enums';
import { addresses } from '../addresses';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: accountTypeEnum('type').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  defaultBillingAddressId: uuid('default_billing_address_id'),
  defaultShippingAddressId: uuid('default_shipping_address_id'),
  status: accountStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  typeIdx: index('accounts_type_idx').on(t.type),
  emailIdx: index('accounts_email_idx').on(t.email),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  defaultBillingAddress: one(addresses, {
    fields: [accounts.defaultBillingAddressId],
    references: [addresses.id],
    relationName: 'defaultBillingAddress',
  }),
  defaultShippingAddress: one(addresses, {
    fields: [accounts.defaultShippingAddressId],
    references: [addresses.id],
    relationName: 'defaultShippingAddress',
  }),
  addresses: many(addresses),
}));

export const insertAccountSchema = z.object({
  type: z.enum(['individual', 'business']),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  defaultBillingAddressId: z.string().uuid().optional().nullable(),
  defaultShippingAddressId: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'suspended']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectAccountSchema = insertAccountSchema.extend({
  id: z.string().uuid(),
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type SelectAccount = z.infer<typeof selectAccountSchema>;
