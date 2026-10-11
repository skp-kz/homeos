import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  RouterProvider,
} from '@tanstack/react-router'
import { apps } from './apps'
import { Shell, appForPath } from './Shell'
import '@fontsource/didact-gothic/400.css'
import '@fontsource/jura/500.css'
import '@fontsource/jura/600.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/source-code-pro/400.css'
import './index.css'

// Вкладка = URL. Один корневой маршрут-оболочка; приложение определяется по префиксу пути
// (apps[].route), поэтому новое приложение не требует правки маршрутов.
const rootRoute = createRootRoute({ component: Shell })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ href: apps[0].route, replace: true })
  },
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  beforeLoad: ({ location }) => {
    if (!appForPath(location.pathname)) throw redirect({ href: apps[0].route, replace: true })
  },
})

const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, appRoute]) })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

// Оболочку не вкладываем саму в себя: если она открылась во фрейме — это ошибка маршрутизации.
if (window.top !== window.self) {
  document.body.textContent = 'HomeOS: оболочка открыта во фрейме — проверьте маршрутизацию Caddy.'
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
