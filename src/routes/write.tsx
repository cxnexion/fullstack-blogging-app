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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/ui/field.tsx'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth.ts'
import { db } from '@/db'
import { article } from '@/db/schema'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { and, eq } from 'drizzle-orm'
import { Label } from '@/components/ui/label.tsx'
import { FormState } from '@/types/formState.ts'
import { Spinner } from '@/components/ui/spinner.tsx'
import { toast } from 'sonner'

const changeArticleSchema = z.object({
  heading: z
    .string()
    .min(6, 'Heading must be at least 5 characters')
    .max(64, 'Heading must be at most 64 characters'),
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters'),
  id: z.string(),
})

const createArticleSchema = z.object({
  heading: z
    .string()
    .min(6, 'Heading must be at least 5 characters')
    .max(64, 'Heading must be at most 64 characters'),
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters'),
})

const deleteArticleSchema = z.object({
  id: z.string(),
})

const getArticles = createServerFn({ method: 'POST' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session?.user.id) return null

  const articles = await db.query.user
    .findFirst({
      where: (user, { eq }) => eq(user.id, session.user.id),
      with: {
        articles: true,
      },
    })
    .then((user) => user?.articles ?? [])

  return articles.map((article) => ({
    ...article,
    img:
      article.body?.find((block) => block.type === 'image')?.props?.url ?? null,
  }))
})

const createArticle = createServerFn({ method: 'POST' })
  .inputValidator(createArticleSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session?.user.id) return null

    try {
      await db.insert(article).values({
        authorId: session.user.id,
        heading: data.heading,
        description: data.description,
        body: [],
        isPublic: false,
      })
      return { success: true }
    } catch (e) {
      return { success: false }
    }
  })

const renameArticle = createServerFn({ method: 'POST' })
  .inputValidator(changeArticleSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session?.user.id) return null

    try {
      await db
        .update(article)
        .set({
          heading: data.heading,
          description: data.description,
        })
        .where(
          and(eq(article.authorId, session.user.id), eq(article.id, data.id)),
        )
      return { success: true }
    } catch (e) {
      return { success: false }
    }
  })

const removeArticle = createServerFn({ method: 'POST' })
  .inputValidator(deleteArticleSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session?.user.id) return null

    try {
      await db
        .delete(article)
        .where(
          and(eq(article.authorId, session.user.id), eq(article.id, data.id)),
        )
      return { success: true }
    } catch (e) {
      return { success: false }
    }
  })

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isPending || !data)
    return (
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 m-2">
        {Array(10)
          .fill(null)
          .map((_, index) => (
            <ArticleSkeleton key={index} />
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
              <Dialog
                open={isDialogOpen}
                onOpenChange={() => setIsDialogOpen(true)}
              >
                <DialogTrigger asChild onClick={() => setIsDialogOpen(true)}>
                  <Button variant="default">Write</Button>
                </DialogTrigger>
                <ArticleCreationDialogContent openFn={setIsDialogOpen} />
              </Dialog>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex p-1 border-b w-full">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger onClick={() => setIsDialogOpen((o) => !o)} asChild>
                <Button size="icon">
                  <PencilLine />
                </Button>
              </DialogTrigger>
              <ArticleCreationDialogContent openFn={setIsDialogOpen} />
            </Dialog>
          </div>
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 m-2">
            {data.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
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
  img?: string
  description?: string | null
  id: string
}) => {
  const queryClient = useQueryClient()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const renameArticleFn = useServerFn(renameArticle)
  const removeArticleFn = useServerFn(removeArticle)
  const articleRenameMutation = useMutation({
    mutationFn: ({
      id,
      heading,
      description,
    }: {
      id: string
      heading: string
      description: string
    }) => renameArticleFn({ data: { id, heading, description } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setIsRenaming(false)
    },
  })
  const articleRemoveMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => removeArticleFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setIsRemoving(false)
    },
    onMutate: () => {
      setIsRemoving(true)
    },
    onError: () => {
      setIsRemoving(false)
      toast.error('Article was not removed')
    },
  })

  const form = useForm({
    defaultValues: {
      heading,
      description: description || '',
      id,
    },
    validators: {
      onSubmit: changeArticleSchema,
    },
    onSubmit: async ({ value }) => articleRenameMutation.mutate(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <Card className="w-full pt-0 h-full max-h-106">
        {img ? (
          <img
            src={img}
            className="relative z-10 aspect-video w-full object-cover"
            alt={heading}
          />
        ) : (
          <div className="relative z-10 aspect-video w-full object-cover flex justify-center items-center bg-muted-foreground">
            No image
          </div>
        )}
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
              <Button variant="default" size="icon" type="submit">
                <Check />
              </Button>
            </ButtonGroup>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" type="button">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <PencilLine />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isRemoving}
                  onClick={() => articleRemoveMutation.mutate({ id })}
                >
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
      <CardFooter className="flex justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8" />
      </CardFooter>
    </Card>
  )
}

const ArticleCreationDialogContent = ({ openFn }: { openFn: Function }) => {
  const [formState, setFormState] = useState<FormState>('default')
  const [formError, setFormError] = useState<null | string>(null)

  const queryClient = useQueryClient()

  const articleMutation = useMutation({
    mutationFn: ({
      heading,
      description,
    }: {
      heading: string
      description: string
    }) => createArticleFn({ data: { heading, description } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setFormState('success')
      openFn((o: boolean) => !o)
    },
    onError: (e) => {
      setFormState('error')
      setFormError(e.message)
    },
    onMutate: () => {
      setFormState('loading')
    },
  })
  const createArticleFn = useServerFn(createArticle)

  const form = useForm({
    defaultValues: {
      heading: '',
      description: '',
    },
    validators: {
      onSubmit: createArticleSchema,
    },
    onSubmit: async ({ value }) => articleMutation.mutate(value),
  })
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create article</DialogTitle>
        <DialogDescription>Let's create new article</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(e)
        }}
      >
        <FieldGroup>
          <form.Field
            name="heading"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field>
                  <Label>Heading</Label>
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <Label>Description</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    type="text"
                    maxLength={256}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  <FieldDescription>
                    Quick description of what's going on in your article
                  </FieldDescription>
                </Field>
              )
            }}
          />
          {formError && <FieldError>{formError}</FieldError>}
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive" type="reset">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="default"
            type="submit"
            disabled={formState === 'loading'}
          >
            {formState === 'loading' ? <Spinner /> : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
