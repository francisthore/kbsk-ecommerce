import { pgTable, text, uuid, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { accounts } from './accounts';

export const individualProfiles = pgTable('individual_profiles', {
  accountId: uuid('account_id').primaryKey().references(() => accounts.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: date('date_of_birth'),
});

export const individualProfilesRelations = relations(individualProfiles, ({ one }) => ({
  account: one(accounts, {
    fields: [individualProfiles.accountId],
    references: [accounts.id],
  }),
}));

export const insertIndividualProfileSchema = z.object({
  accountId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.date().optional().nullable(),
});

export const selectIndividualProfileSchema = insertIndividualProfileSchema.extend({});

export type InsertIndividualProfile = z.infer<typeof insertIndividualProfileSchema>;
export type SelectIndividualProfile = z.infer<typeof selectIndividualProfileSchema>;
