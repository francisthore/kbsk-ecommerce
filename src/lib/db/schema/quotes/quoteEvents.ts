import { pgTable, uuid, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { quotes } from './quotes';
import { users } from '../user';
import { quoteEventTypeEnum } from '../enums';

export const quoteEvents = pgTable('quote_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id, { onDelete: 'cascade' }).notNull(),
  eventType: quoteEventTypeEnum('event_type').notNull(),
  byUserId: uuid('by_user_id').references(() => users.id, { onDelete: 'set null' }),
  at: timestamp('at').defaultNow().notNull(),
  payload: jsonb('payload'), // Additional event-specific data
});

export const quoteEventsRelations = relations(quoteEvents, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteEvents.quoteId],
    references: [quotes.id],
  }),
  byUser: one(users, {
    fields: [quoteEvents.byUserId],
    references: [users.id],
  }),
}));

export const insertQuoteEventSchema = z.object({
  quoteId: z.string().uuid(),
  eventType: z.enum(['created', 'submitted', 'reviewed', 'quoted', 'accepted', 'rejected', 'expired', 'converted', 'updated', 'commented']),
  byUserId: z.string().uuid().optional().nullable(),
  at: z.date().optional(),
  payload: z.record(z.string(), z.any()).optional().nullable(),
});

export const selectQuoteEventSchema = insertQuoteEventSchema.extend({
  id: z.string().uuid(),
});

export type InsertQuoteEvent = z.infer<typeof insertQuoteEventSchema>;
export type SelectQuoteEvent = z.infer<typeof selectQuoteEventSchema>;
