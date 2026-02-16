import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx'
import { Check, EllipsisVertical, PencilLine, Trash, X } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { useState } from 'react'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useForm } from '@tanstack/react-form-start'
import z from 'zod'
import { Field, FieldError } from '@/components/ui/field.tsx'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'

const articleSchema = z.object({
  heading: z
    .string()
    .min(6, 'Heading must be at least 5 characters')
    .max(64, 'Heading must be at most 64 characters'),
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters'),
  id: z.string(),
})

const getArticles = createServerFn().handler(async () => {
  return [
    {
      heading: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      id: '1',
    },
    {
      heading: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      id: '2',
    },
    {
      heading: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      id: '3',
    },
    {
      heading: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      id: '4',
    },
  ]
})
const renameArticle = createServerFn({ method: 'POST' })
  .inputValidator(
    async (data: { id: string; heading: string; description: string }) => data,
  )
  .handler(async ({ data }) => true)

export const Route = createFileRoute('/write')({
  component: RouteComponent,
  loader: async () => await getArticles(),
})

function RouteComponent() {
  const getArticlesFn = useServerFn(getArticles)

  const { isPending, data } = useQuery({
    queryKey: ['articles'],
    queryFn: () => getArticlesFn(),
    initialData: useLoaderData({ from: '/write' }),
  })
  if (true)
    return (
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 m-2">
        <ArticleCard
          heading="Observability Plus is replacing Monitoring"
          description="Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025"
          img="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          id="1"
        />
        {Array(10)
          .fill(null)
          .map(() => (
            <ArticleSkeleton />
          ))}
      </div>
    )
  return (
    <>
      {data.length === 0 ? (
        <div className="flex justify-center items-center w-full">
          <Empty className="max-w-sm">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PencilLine />
              </EmptyMedia>
              <EmptyTitle>No Articles</EmptyTitle>
              <EmptyDescription>
                Looks like you just started. Write your first article now!
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="default">Write</Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 m-2">
          {data.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      )}
    </>
  )
}

const ArticleCard = ({
  heading,
  img,
  description,
  id,
}: {
  heading: string
  img: string
  description: string
  id: string
}) => {
  const queryClient = useQueryClient()
  const [isRenaming, setIsRenaming] = useState(false)
  const renameArticleFn = useServerFn(renameArticle)
  const articleMutation = useMutation({
    mutationFn: ({
      id,
      heading,
      description,
    }: {
      id: string
      heading: string
      description: string
    }) => renameArticleFn({ data: { id, heading, description } }),
    onSuccess: (data) => {
      queryClient.setQueryData(['articles'], data)
      setIsRenaming(false)
    },
  })

  const form = useForm({
    defaultValues: {
      heading,
      description,
      id,
    },
    validators: {
      onSubmit: articleSchema,
    },
    onSubmit: async ({ value }) => articleMutation.mutate(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <Card className="w-full pt-0 h-full">
        <img
          src={img}
          className="relative z-10 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
          alt={heading}
        />
        <CardHeader className="grow">
          {isRenaming ? (
            <>
              <form.Field
                name="heading"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        onBlur={field.handleBlur}
                        type="text"
                        minLength={6}
                        maxLength={64}
                        required
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        onBlur={field.handleBlur}
                        maxLength={256}
                        className="resize-none"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </>
          ) : (
            <>
              <CardTitle>{heading}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardFooter className="justify-between">
          <Button variant="outline">
            <PencilLine />
            Edit
          </Button>

          {isRenaming ? (
            <ButtonGroup>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  setIsRenaming(false)
                  form.reset()
                }}
                type="reset"
              >
                <X />
              </Button>
              <Button variant="secondary" size="icon" type="submit">
                <Check />
              </Button>
            </ButtonGroup>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button size="icon" variant="outline" type="button">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <PencilLine />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <Trash />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}

const ArticleSkeleton = () => {
  return (
    <Card className="pt-0 w-full h-full">
      <Skeleton className="relative w-full z-10 aspect-video object-cover brightness-60 grayscale dark:brightness-40" />
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-64" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-28 w-72" />
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  )
}
