import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes, scrollBehavior, setupAuthGuard } from './router'
import { setAppReady } from './api/client'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior,
  },
  ({ app, router, initialState }) => {
    const pinia = createPinia()
    app.use(pinia)

    if (import.meta.env.SSR) {
      initialState.pinia = pinia.state.value
    } else {
      pinia.state.value = initialState.pinia || {}
    }

    setupAuthGuard(router)

    if (!import.meta.env.SSR) {
      router.isReady().then(() => setAppReady())
    }
  },
  { hydration: false }
)
