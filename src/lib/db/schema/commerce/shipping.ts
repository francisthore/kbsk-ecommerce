import { pgTable, text, uuid, numeric, boolean } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const shippingMethods = pgTable('shipping_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  flatRate: numeric('flat_rate', { precision: 10, scale: 2 }),
  active: boolean('active').notNull().default(true),
});

export const insertShippingMethodSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  flatRate: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export const selectShippingMethodSchema = insertShippingMethodSchema.extend({
  id: z.string().uuid(),
});

export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;
export type SelectShippingMethod = z.infer<typeof selectShippingMethodSchema>;
