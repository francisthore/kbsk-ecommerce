import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { priceListItems } from './priceListItems';

export const priceLists = pgTable('price_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const priceListsRelations = relations(priceLists, ({ many }) => ({
  items: many(priceListItems),
}));

export const insertPriceListSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional().nullable(),
  currency: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectPriceListSchema = insertPriceListSchema.extend({
  id: z.string().uuid(),
});

export type InsertPriceList = z.infer<typeof insertPriceListSchema>;
export type SelectPriceList = z.infer<typeof selectPriceListSchema>;
