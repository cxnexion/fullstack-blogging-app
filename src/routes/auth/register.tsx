import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '@/components/signup-form.tsx'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="wrapper m-2"><SignupForm className="max-w-sm" /></div>
}
