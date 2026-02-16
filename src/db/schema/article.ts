import { pgTable, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'
import {user} from '@/db/schema/auth-schema.ts'

export const article = pgTable('atricle', {
  id: text('id').primaryKey().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  authorId: text('author_id').notNull(),
  body: text('body'),
  isPublic: boolean('is_public').default(true).notNull(),
  heading: varchar('heading', {length: 64}).notNull(),
  description: varchar('description', {length: 256})
})

export const articleRelations = relations(article, ({one}) => ({
    author: one(user, {
        fields: [article.authorId],
        references: [user.id]
    })
}))