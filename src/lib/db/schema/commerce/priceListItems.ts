import { pgTable, uuid, numeric, integer, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { priceLists } from './priceLists';
import { productVariants } from '../variants';

export const priceListItems = pgTable('price_list_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  priceListId: uuid('price_list_id').references(() => priceLists.id, { onDelete: 'cascade' }).notNull(),
  productVariantId: uuid('product_variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  minQty: integer('min_qty').notNull().default(1),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
}, (t) => ({
  uniquePriceListItem: unique().on(t.priceListId, t.productVariantId, t.minQty),
}));

export const priceListItemsRelations = relations(priceListItems, ({ one }) => ({
  priceList: one(priceLists, {
    fields: [priceListItems.priceListId],
    references: [priceLists.id],
  }),
  variant: one(productVariants, {
    fields: [priceListItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const insertPriceListItemSchema = z.object({
  priceListId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  minQty: z.number().int().min(1).optional(),
  price: z.string(),
});

export const selectPriceListItemSchema = insertPriceListItemSchema.extend({
  id: z.string().uuid(),
});

export type InsertPriceListItem = z.infer<typeof insertPriceListItemSchema>;
export type SelectPriceListItem = z.infer<typeof selectPriceListItemSchema>;
