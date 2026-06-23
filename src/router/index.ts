import {
  createRouter,
  createWebHistory,
  type Router,
  type RouterScrollBehavior,
  type RouteRecordRaw,
} from 'vue-router'
import { useAuthStore } from '../stores/auth'

const APP_ROOT = '/app'

function withAppPrefix(path: string) {
  return `${APP_ROOT}${path}`
}

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../views/public/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/public/HomePage.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/public/LoginPage.vue'),
    meta: { title: 'Sign in', guestOnly: true },
  },
]

const appRoutes: RouteRecordRaw[] = [
  {
    path: APP_ROOT,
    component: () => import('../views/auth/AuthLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/auth/DashboardPage.vue'),
        meta: { title: 'Dashboard' },
      },
    ],
  },
]

export const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...appRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundPage.vue'),
    meta: { title: '404' },
  },
]

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior,
  })

  setupAuthGuard(router)
  setupDocumentTitles(router)

  return router
}

export const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  if (savedPosition) return savedPosition
  if (to.hash) return { el: to.hash, behavior: 'smooth' }
  return { top: 0 }
}

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const guestOnly = to.matched.some((record) => record.meta.guestOnly)

    if ((requiresAuth || guestOnly) && !auth.initialized) {
      await auth.init()
    }

    if (requiresAuth && !auth.user) {
      return { name: 'login', query: { next: to.fullPath } }
    }

    if (guestOnly && auth.user) {
      return { name: 'dashboard' }
    }
  })
}

export function setupDocumentTitles(router: Router) {
  if (import.meta.env.SSR) return

  router.afterEach((to) => {
    const title = to.meta?.title as string | undefined
    document.title = title ? `${title} — Vyraj` : 'Vyraj'
  })
}

export { APP_ROOT, withAppPrefix }
