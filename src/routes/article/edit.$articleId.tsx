import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import {BlockNoteView} from '@blocknote/shadcn'
import {useCreateBlockNote} from '@blocknote/react'
import {Spinner} from '@/components/ui/spinner.tsx'
import '@blocknote/shadcn/style.css'

export const Route = createFileRoute('/article/edit/$articleId')({
  component: RouteComponent,
})

const editor = useCreateBlockNote()

function RouteComponent() {
   return (<ClientOnly fallback={<div className="flex justify-center h-dvh items-center"><Spinner/></div>}>
        <BlockNoteView editor={editor} />
    </ClientOnly>)
}
