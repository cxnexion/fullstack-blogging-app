import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx'
import { EllipsisVertical, PencilLine, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'

export const Route = createFileRoute('/write')({
  component: RouteComponent,
})

function RouteComponent() {
  const articles = [
    {
      title: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Observability Plus is replacing Monitoring',
      description:
        'Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the Pro plan in November, 2025',
      img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ]

  return (
    <>
      {articles.length === 0 ? (
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
          {articles.map((article) => (
            <Card className="max-w-sm pt-0 h-fit" key={article.title}><img
                src={article.img}
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                <Button variant="secondary">Edit</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline"><EllipsisVertical/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild><Button variant="destructive">Delete <Trash/></Button></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
