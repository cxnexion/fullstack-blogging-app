import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { BlockNoteView } from '@blocknote/shadcn'
import { Spinner } from '@/components/ui/spinner.tsx'
import '@blocknote/shadcn/style.css'
import { useCreateBlockNote } from '@blocknote/react'
import { useDebouncedCallback } from 'use-debounce'
import { authMiddleware } from '@/middleware/auth.ts'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth.ts'
import { db } from '@/db'
import z from 'zod'
import { article } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge.tsx'
import { Check, CircleAlert } from 'lucide-react'
import { uploadFiles } from '@/server/uploadthing.ts'

const getArticleSchema = z.object({
  id: z.string(),
})

const setArticleBodySchema = z.object({
  id: z.string(),
  body: z.any(),
})

const getArticle = createServerFn()
  .inputValidator(getArticleSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session?.user.id) {
      throw new Error('Access restricted')
    }

    const article = await db.query.article.findFirst({
      where: (article, { eq, and }) =>
        and(eq(article.authorId, session.user.id), eq(article.id, data.id)),
    })

    if (!article) {
      throw new Error('Access restricted')
    }

    return article
  })

const setArticleBody = createServerFn()
  .inputValidator(setArticleBodySchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session?.user.id) {
      throw new Error('Access restricted')
    }

    const image =
      data.body.find((block: any) => block.type === 'image')?.props
        ?.url ?? null

    try {
      await db
        .update(article)
        .set({ body: data.body, image })
        .where(
          and(eq(article.authorId, session.user.id), eq(article.id, data.id)),
        )
      return { success: true }
    } catch (e) {
      return { success: false }
    }
  })

export const Route = createFileRoute('/article/edit/$articleId')({
  server: {
    middleware: [authMiddleware],
  },
  component: RouteComponent,
  loader: async ({ params }) => {
    const article = await getArticle({ data: { id: params.articleId } })
    return { body: article.body, id: params.articleId }
  },
})

function RouteComponent() {
  const { body, id } = Route.useLoaderData()
  const setArticleBodyFn = useServerFn(setArticleBody)
  const [saveStatus, setSaveStatus] = useState<
    'typing' | 'saving' | 'done' | 'error'
  >('done')
  const debouncedSetArticleBody = useDebouncedCallback(async (body) => {
    setSaveStatus('saving')
    try {
      await setArticleBodyFn({ data: { body, id } })
      setSaveStatus('done')
    } catch (e) {
      setSaveStatus('error')
    }
  }, 1000)

  function articleBodyHandler(body: any) {
    setSaveStatus('typing')
    debouncedSetArticleBody(body)
  }

  return (
    <ClientOnly
      fallback={
        <div className="flex justify-center h-dvh items-center">
          <Spinner />
        </div>
      }
    >
      <BlockNoteEditor initialContent={body} onChange={articleBodyHandler} />
      <Badge className="fixed right-4 top-1/12" variant={saveStatus === 'typing' ? 'secondary' : saveStatus === 'saving' ? 'outline' : saveStatus === 'error' ? 'destructive' : 'default'}>
        {saveStatus === 'typing' ? (
          <>
            <Spinner /> Typing
          </>
        ) : saveStatus === 'saving' ? (
          <>
            <Spinner /> Saving
          </>
        ) : saveStatus === 'error' ? (
          <>
            <CircleAlert /> Error
          </>
        ) : (
          <>
            <Check /> Saved
          </>
        )}
      </Badge>
    </ClientOnly>
  )
}

const BlockNoteEditor = ({
  onChange,
  initialContent,
}: {
  onChange: Function
  initialContent: any
}) => {
  const editor = useCreateBlockNote({
    initialContent:
      Array.isArray(initialContent) && initialContent.length > 0
        ? initialContent
        : undefined,
    uploadFile:async (img) => {
     return (await uploadFiles('imageUploader', { files: [img] }))[0].ufsUrl
    },
  })

  return (
    <BlockNoteView
      className="w-full"
      editor={editor}
      onChange={() => onChange(editor.document)}
    />
  )
}
