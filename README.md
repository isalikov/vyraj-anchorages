# Vyraj

Frontend boilerplate — Vue 3 + TypeScript SPA with prerendered public pages, token auth, and a full lint/test/CI toolchain. Carries the tooling and architecture only; no business logic.

## Stack

- **Framework:** Vue 3 (`<script setup>`), TypeScript
- **Build:** Vite 8 + [vite-ssg](https://github.com/antfu-collective/vite-ssg) (public routes prerendered at build, app stays SPA)
- **Routing:** Vue Router with `requiresAuth` / `guestOnly` route meta + global guard
- **State:** Pinia
- **Styling:** UnoCSS configured but unused — pages are intentionally unstyled
- **Head/SEO:** `@unhead/vue`
- **Tests:** Vitest + `@vue/test-utils` (jsdom)
- **Quality:** ESLint (flat, type-checked) + Prettier + lefthook git hooks
- **Deploy:** Docker (nginx) + GitHub Actions → GHCR

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

The dev server proxies `/api` and `/ws` to `http://localhost:8000` (see `vite.config.ts`).

## Scripts

| Command       | What it does                                 |
| ------------- | -------------------------------------------- |
| `pnpm dev`    | Dev server                                   |
| `pnpm build`  | `vue-tsc` typecheck + `vite-ssg` prerender   |
| `pnpm test`   | Run Vitest once                              |
| `pnpm lint`   | ESLint                                       |
| `pnpm format` | Prettier write                               |
| `pnpm verify` | `lint` + `build` + `test` (runs on pre-push) |

## Structure

```
src/
  api/
    client.ts      — fetch wrapper: JWT in localStorage, raw Authorization header,
                     401 → /login, typed api.get/post/put/delete/upload, downloadBlob
    auth.ts        — authApi.me() → GET /auth/me
    types.ts       — MeResponse (extend with your backend shape)
  stores/
    auth.ts        — session store: init() resolves /auth/me, logout()
  router/
    index.ts       — routes + auth guard + document titles
  views/
    public/        — PublicLayout (bare), HomePage (public, prerendered), LoginPage (empty stub)
    auth/          — AuthLayout (bare + sign-out), DashboardPage (protected, reads /auth/me)
    NotFoundPage.vue
  App.vue
  main.ts          — ViteSSG entry, installs Pinia, wires the auth guard
```

> Pages carry no design, colors, or chrome on purpose — that's left for whatever
> gets built on top of this boilerplate.

## Auth model

- JWT is stored in `localStorage` under `token` and sent as the raw `Authorization` header (no `Bearer ` prefix).
- The router guard calls `auth.init()` once, which probes `GET /auth/me`. Routes marked `requiresAuth` redirect to `/login` when there is no user; `guestOnly` routes (login) bounce authenticated users to `/app`.
- `src/views/public/LoginPage.vue` is an intentional empty stub — implement your sign-in flow, call `setToken()`, then redirect.

## Conventions enforced by ESLint

- No direct `fetch()` in `src/` outside `src/api/` — go through `src/api/client.ts`.
- The `Authorization` header must carry the raw JWT — `Bearer ` prefixes are flagged.

## Deploy

`pnpm build` produces `dist/`. The `Dockerfile` serves it with nginx (`nginx.conf` handles SPA fallback, `/api` + `/ws` proxy, and `noindex` for `/app` and `/login`). CI builds and pushes the image to GHCR on push to `main`.
