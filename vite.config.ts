import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

const ssgOptions: ViteSSGOptions = {
  // Public routes to prerender at build time. Protected routes under /app stay SPA-only.
  includedRoutes: () => ['/'],
  formatting: 'minify',
}

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  ssgOptions,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
} as UserConfig & { ssgOptions: ViteSSGOptions })
