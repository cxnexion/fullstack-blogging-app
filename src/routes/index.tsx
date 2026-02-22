import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import z from 'zod'
import { useEffect, useRef, useState } from 'react'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { Check, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'

const getArticlesSchema = z
  .object({
    offset: z.number().optional(),
  })
  .optional()

const getArticles = createServerFn()
  .inputValidator(getArticlesSchema)
  .handler(async ({ data }) => {
    return await db.query.article.findMany({
      where: (article, { eq }) => eq(article.isPublic, true),
      limit: 8,
      offset: data?.offset || 0,
      orderBy: (article, { desc }) => desc(article.createdAt),
      with: {
        author: {
          columns: {
            // Specific selection of columns, to not leak author's email
            name: true,
            image: true,
          },
        },
      },
    })
  })

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await getArticles(),
  pendingComponent: () => {
    return (
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 m-2">
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <ArticleSkeleton key={index} />
          ))}
      </div>
    )
  },
})

function App() {
  const data = Route.useLoaderData()
  const [articles, setArticles] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  const getArticlesFn = useServerFn(getArticles)

  useEffect(() => {

    const observer = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        setIsLoading(true)
        const newArticles = await getArticlesFn({
          data: { offset: articles.length },
        })
        setArticles((a) => [...a, ...newArticles])
        setIsLoading(false)
      }
    })

    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [articles.length])

  return (
    <>
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 m-2">
        {articles.map((article) => (
          <ArticleCard {...article} key={article.id} />
        ))}
      </div>
      {isLoading && <Spinner className="m-2"/>}
      <div ref={bottomRef} />
    </>
  )
}

const ArticleCard = ({
  heading,
  image,
  description,
  id,
  author,
}: {
  heading: string
  image: string | null
  description?: string | null
  id: string
  author: {
    image: string | null
    name: string
  }
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()

  async function handleShare() {
    const url =
      window.location.origin +
      router.buildLocation({
        to: '/article/$articleId',
        params: { articleId: id },
      }).href
    await navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast('Copied!', { position: 'bottom-right' })
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <Card className="w-full pt-0 h-full max-h-84">
      <Link to={`/article/$articleId`} params={{articleId:id}}>
        {image ? (
          <img
            src={image}
            className="relative z-10 aspect-video w-full object-cover"
            alt={heading}
          />
        ) : (
          <div className="relative z-10 aspect-video w-full object-cover flex justify-center items-center bg-muted-foreground">
            No image
          </div>
        )}
      </Link>
      <CardHeader className="grow">
        <CardTitle>{heading}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardFooter className="justify-between">
        <span className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={author.image ?? undefined} />
            <AvatarFallback className="truncate">{author.name}</AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground">{author.name}</p>
        </span>
        <Button onClick={handleShare} size="icon">
          {isCopied ? <Check /> : <Share2 />}
        </Button>
      </CardFooter>
    </Card>
  )
}

const ArticleSkeleton = () => {
  return (
    <Card className="pt-0 w-full h-full">
      <Skeleton className="relative w-full z-10 aspect-video object-cover brightness-60 grayscale dark:brightness-40" />
      <CardHeader className="grow">
        <CardTitle>
          <Skeleton className="h-6 w-64" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-28 w-72" />
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-8" />
      </CardFooter>
    </Card>
  )
}
