import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/article/$articleId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/article/$articleId"!</div>
}
