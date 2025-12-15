import { pgTable, text, uuid, numeric, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { accounts } from './accounts';
import { priceLists } from '../commerce/priceLists';
import { creditTermsEnum } from '../enums';

export const businessProfiles = pgTable('business_profiles', {
  accountId: uuid('account_id').primaryKey().references(() => accounts.id, { onDelete: 'cascade' }),
  legalName: text('legal_name').notNull(),
  tradingName: text('trading_name'),
  vatNumber: text('vat_number'),
  companyRegNumber: text('company_reg_number'),
  website: text('website'),
  creditTerms: creditTermsEnum('credit_terms').notNull().default('prepaid'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).notNull().default('0'),
  priceListId: uuid('price_list_id').references(() => priceLists.id, { onDelete: 'set null' }),
  vatExempt: boolean('vat_exempt').notNull().default(false),
  purchaseOrderRequired: boolean('purchase_order_required').notNull().default(false),
});

export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  account: one(accounts, {
    fields: [businessProfiles.accountId],
    references: [accounts.id],
  }),
  priceList: one(priceLists, {
    fields: [businessProfiles.priceListId],
    references: [priceLists.id],
  }),
}));

export const insertBusinessProfileSchema = z.object({
  accountId: z.string().uuid(),
  legalName: z.string().min(1),
  tradingName: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  companyRegNumber: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  creditTerms: z.enum(['prepaid', '30d', '60d']).optional(),
  creditLimit: z.string().optional(),
  priceListId: z.string().uuid().optional().nullable(),
  vatExempt: z.boolean().optional(),
  purchaseOrderRequired: z.boolean().optional(),
});

export const selectBusinessProfileSchema = insertBusinessProfileSchema.extend({});

export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type SelectBusinessProfile = z.infer<typeof selectBusinessProfileSchema>;
