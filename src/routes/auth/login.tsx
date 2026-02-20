import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/login-form.tsx'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginForm className="max-w-sm m-2"/>
}
