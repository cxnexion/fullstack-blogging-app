import { createFileRoute, notFound } from '@tanstack/react-router'
import z from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import '@blocknote/shadcn/style.css'

const getArticleHTMLSchema = z.object({ id: z.string() })
const getArticleHTML = createServerFn({ method: 'GET' })
  .inputValidator(getArticleHTMLSchema)
  .handler(async ({ data }) => {
    const article = await db.query.article.findFirst({
      where: (article, { eq, and }) =>
        and(eq(article.id, data.id), eq(article.isPublic, true)),
    })
    if (!article) {
      throw notFound()
    }
    return article.bodyHtml
  })

export const Route = createFileRoute('/article/$articleId')({
  component: RouteComponent,
  loader: async ({ params }) => {
   const html =await getArticleHTML({ data: { id: params.articleId } })
    return {html}
  },
})

function RouteComponent() {
  const {html} = Route.useLoaderData()
  if (!html) {
    throw notFound()
  }
  return <div dangerouslySetInnerHTML={{ __html: html }}></div>
}
