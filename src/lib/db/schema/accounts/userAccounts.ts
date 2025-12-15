import { pgTable, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { users } from '../user';
import { accounts } from './accounts';
import { userAccountRoleEnum } from '../enums';

export const userAccounts = pgTable('user_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  role: userAccountRoleEnum('role').notNull().default('buyer'),
}, (t) => ({
  uniqueUserAccount: unique().on(t.userId, t.accountId),
}));

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userAccounts.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [userAccounts.accountId],
    references: [accounts.id],
  }),
}));

export const insertUserAccountSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'buyer', 'viewer']).optional(),
});

export const selectUserAccountSchema = insertUserAccountSchema.extend({
  id: z.string().uuid(),
});

export type InsertUserAccount = z.infer<typeof insertUserAccountSchema>;
export type SelectUserAccount = z.infer<typeof selectUserAccountSchema>;
