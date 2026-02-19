import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'
import {user} from '@/db/schema/auth-schema.ts'

export const article = pgTable('article', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
  authorId: text('author_id').notNull(),
  body: jsonb('body').$type<Array<Record<string, any>>>(),
  isPublic: boolean('is_public').default(true).notNull(),
  heading: varchar('heading', { length: 64 }).notNull(),
  description: varchar('description', { length: 256 }),
})

export const articleRelations = relations(article, ({one}) => ({
    author: one(user, {
        fields: [article.authorId],
        references: [user.id]
    })
}))