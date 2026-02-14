import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import appCss from '../styles.css?url'
import Footer from "@/components/Footer.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getThemeServerFn } from '@/lib/theme.ts'
import { ThemeProvider } from '@/components/theme-provider.tsx'

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
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()


  const queryClient = new QueryClient()
  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      </QueryClientProvider>
    </html>
  )
}
