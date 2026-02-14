import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'
import {user} from '@/db/schema/auth-schema.ts'

export const article = pgTable('atricle', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  authorId: text('author_id'),
  body: text('body'),
})

export const articleRelations = relations(article, ({one}) => ({
    author: one(user, {
        fields: [article.authorId],
        references: [user.id]
    })
}))