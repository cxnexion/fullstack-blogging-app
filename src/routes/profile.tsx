import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useForm } from '@tanstack/react-form-start'
import z from 'zod'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs.tsx'
import { authClient } from '@/lib/auth-client.ts'
import { useState } from 'react'
import { FormState } from '@/types/formState.ts'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Plus } from 'lucide-react'
import { authMiddleware } from '@/middleware/auth.ts'
import { Button } from '@/components/ui/button.tsx'
import { UploadButton } from '@/server/uploadthing.ts'
import { ButtonGroup } from '@/components/ui/button-group.tsx'

export const Route = createFileRoute('/profile')({
  server: {
    middleware: [authMiddleware],
  },
  component: RouteComponent,
})

const profileSchema = z.object({
  name: z
    .string()
    .min(5, 'Full name must be at least 5 characters')
    .max(32, 'Full name must be at most 32 characters'),
  image: z.string(),
})

const importantSchema = z.object({
  name: z
    .string()
    .min(5, 'Full name must be at least 5 characters')
    .max(32, 'Full name must be at most 32 characters'),
})

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession()
  return (
    <div className="wrapper m-2">
      <div className="flex flex-col gap-6 w-sm">
        <Tabs defaultValue="profile">
          <TabsList variant="line">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="important">
            <ImportantTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const ProfileTab = () => {
  const { data: session, isPending } = authClient.useSession()
  const [formError, setFormError] = useState<null | string>(null)
  const [formState, setFormState] = useState<FormState>('default')

  const form = useForm({
    defaultValues: {
      name: session?.user.name ?? '',
      image: session?.user.image ?? '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      handleProfile(value)
    },
  })

  if (isPending && !session?.user)
    return (
      <Card>
        <CardContent className="flex justify-center">
          <Spinner />
        </CardContent>
      </Card>
    )

  async function handleProfile({
    image,
    name,
  }: {
    image: string
    name: string
  }) {
    await authClient.updateUser(
      {
        image,
        name,
      },
      {
        onRequest: () => {
          setFormState('loading')
        },
        onSuccess: () => {
          setFormError(null)
          setFormState('success')
        },
        onError: (ctx) => {
          setFormState('error')
          setFormError(ctx.error.message)
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Profile</CardTitle>
        <CardDescription>Customize your profile here</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit(e)
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      onBlur={field.handleBlur}
                      type="text"
                      placeholder="John Doe"
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
              name="image"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Avatar</FieldLabel>
                    <Field orientation="horizontal">
                      <Avatar size="lg">
                        <AvatarImage src={field.state.value || undefined} />
                        <AvatarFallback>
                          <Plus />
                        </AvatarFallback>
                      </Avatar>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) =>
                          field.handleChange(res[0].ufsUrl)
                        }
                        appearance={{ allowedContent: 'hidden' }}
                      />
                    </Field>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    {formState === 'success' && (
                      <span className="text-primary font-semibold">
                        Successfully updated.
                      </span>
                    )}
                  </Field>
                )
              }}
            />
            <Field>
              <Button type="submit" disabled={formState === 'loading'}>
                {formState === 'loading' ? <Spinner /> : 'Update Profile'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

const ImportantTab = () => {

  const { data: session, isPending } = authClient.useSession()

  const [emailState, setEmailState] = useState<FormState>('default')
  const [emailError, setEmailError] = useState<string | null>(null);

  const [passwordState, setPasswordState] = useState<FormState>('default')
  const [passwordError, setPasswordError] = useState<string | null>(null)


  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const newEmail = formData.get('email');

    if  (typeof newEmail !== 'string') return;

    await authClient.changeEmail(
      {
        newEmail,
        callbackURL: '/profile',
      },
      {
        onRequest: () => {
          setEmailState('loading')
        },
        onSuccess: () => {
          setEmailError(null)
          setEmailState('success')
        },
        onError: (ctx) => {
          setEmailState('error')
          setEmailError(ctx.error.message)
        },
      },
    )
  }

  async function handlePassword() {

    if (!session?.user.email) return;

    await authClient.requestPasswordReset(
      {
        email: session?.user.email
      },
      {
        onRequest: () => {
          setPasswordState('loading')
        },
        onSuccess: () => {
          setPasswordError(null)
          setPasswordState('success')
        },
        onError: (ctx) => {
          setPasswordState('error')
          setPasswordError(ctx.error.message)
        },
      },
    )
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Important</CardTitle>
        <CardDescription>Important actions are placed here.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEmail(e)
            }}
          >
            <Field>
              <FieldLabel>Email</FieldLabel>
              <ButtonGroup>
                <Input name="email" type="email" required />
                <Button variant="outline" type="submit">
                  {emailState === 'loading' ? <Spinner /> : 'Send Email'}
                </Button>
              </ButtonGroup>
              {emailError && <FieldError>{emailError}</FieldError>}
            </Field>
          </form>
          <Field>
            <FieldLabel>Password reset</FieldLabel>
            <Button
              onClick={handlePassword}
              disabled={isPending}
              variant="outline"
            >
              {passwordState === 'loading' ? <Spinner/> : 'Send email'}
            </Button>
            {passwordError && <FieldError>{passwordError}</FieldError>}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
