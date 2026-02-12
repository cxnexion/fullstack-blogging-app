import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import appCss from '../styles.css?url'
import Footer from "@/components/Footer.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {auth} from "@/lib/auth.ts";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async () => {
    // Get session server-side
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    return {
      session,
    }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {

  const queryClient = new QueryClient()
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <QueryClientProvider client={queryClient}>
        <body className="flex flex-col min-h-screen">
        <Header />
        <main className="grow">{children}</main>
        <Footer />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
        </body>
      </QueryClientProvider>
    </html>
  )
}
