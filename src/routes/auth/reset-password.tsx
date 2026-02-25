import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { FormState } from '@/types/formState.ts'
import { useForm } from '@tanstack/react-form-start'
import { authClient } from '@/lib/auth-client.ts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import z from 'zod'

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must be at most 32 characters'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const Route = createFileRoute('/auth/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { token }: { token: string } = Route.useSearch()
  const [formError, setFormError] = useState<null | string>()
  const [formState, setFormState] = useState<FormState>('default')
  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await resetPasswordHandler({...value, token})
    },
  })

  async function resetPasswordHandler({
    newPassword,
    token,
  }: {
    newPassword: string
    token: string
  }) {
    await authClient.resetPassword(
      { newPassword, token },
      {
        onRequest: () => {
          setFormState('loading')
        },
        onSuccess: async () => {
          setFormError(null)
          setFormState('success')
          await navigate({to :"/auth/login"})
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
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await form.handleSubmit(e)
        }}
      >
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Set new password</CardDescription>
        </CardHeader>
        <CardContent className="my-4">
          <Field>
            <Field className="grid grid-cols-2 gap-4">
              <form.Field
                name="newPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor="password">New Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        onBlur={field.handleBlur}
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
                name="confirmNewPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm New Password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        onBlur={field.handleBlur}
                        required
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </Field>
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          </Field>
          {formError && <FieldError>{formError}</FieldError>}
          {formState === 'success' && (
            <span className="text-primary font-semibold">
              Success! Password changed.
            </span>
          )}
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
