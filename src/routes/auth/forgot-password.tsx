import { createFileRoute, Link } from '@tanstack/react-router'
import z from 'zod'
import { useForm } from '@tanstack/react-form-start'
import { authClient } from '@/lib/auth-client.ts'
import { useState } from 'react'
import { FormState } from '@/types/formState.ts'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { Field, FieldError, FieldLabel } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'

const forgotPasswordSchema = z.object({ email: z.email() })

export const Route = createFileRoute('/auth/forgot-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const [formError, setFormError] = useState<null | string>()
  const [formState, setFormState] = useState<FormState>('default')
  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      forgotPasswordHandler(value)
    },
  })

  async function forgotPasswordHandler({ email }: { email: string }) {
    await authClient.requestPasswordReset(
      { email, redirectTo: '/auth/reset-password'},
      {
        onRequest: () => {
          setFormState('loading')
        },
        onSuccess: async () => {
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
    <Card className="w-full max-w-sm m-2">
      <form onSubmit={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await form.handleSubmit(e)
      }}>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Request password with your email</CardDescription>
          <CardAction>
            <Link
              to="/auth/login"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Remembered password?
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="my-4">
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    type="email"
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          {formError && <FieldError>{formError}</FieldError>}
          {formState === 'success' && (
            <span className="text-primary font-semibold">
                 Success! Check your email.
                </span>)
          }
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="default" className="w-full">
            {formState === 'loading' ? <Spinner /> : 'Reset password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
