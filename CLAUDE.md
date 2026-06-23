# CLAUDE.md

Guidance for working in this repo.

## What this is

A Vue 3 + TypeScript frontend boilerplate. Toolchain and architecture only — no business logic. Keep additions small and idiomatic to the existing patterns.

## Operating rules — READ FIRST

These are hard constraints for the agent. Full rationale lives in the
`dev-workflow` skill (`.claude/skills/dev-workflow/`).

0. **Read the skill first.** At the start of every session and after any context
   compaction, read `.claude/skills/dev-workflow/` before doing any work.
1. **Never start servers** — no `pnpm dev`, `pnpm preview`, `pnpm test:watch`, or any long-running process.
2. **Never run eslint** (`pnpm lint`, `pnpm lint:fix`, `eslint …`) — the lefthook git hooks own linting. Self-check with `pnpm exec vue-tsc -b` (type-check) and `pnpm test` instead.
3. **Never run builds** — no `pnpm build`, `pnpm verify` (it chains lint+build+test), or `docker build`.
4. **Never commit or push.** Propose a commit message for the user to apply; don't run `git commit`/`git push`.
5. **Commit messages start with `fix/`, `feature/`, or `chore/`.**
6. **ALWAYS end with a commit message — no exceptions.** Every turn that changes a tracked
   file MUST finish by proposing the `<prefix>/ …` commit message, unprompted, as the last
   thing you output. Never wait to be asked. If you forgot, you broke this rule.

Allowed commands: `pnpm exec vue-tsc -b`, `pnpm test`, `pnpm format`, `pnpm format:check`.

## Commands

| Command                               | Use                               | Agent may run?                  |
| ------------------------------------- | --------------------------------- | ------------------------------- |
| `pnpm exec vue-tsc -b`                | type-check (no emit) — self-check | ✅ yes                          |
| `pnpm test`                           | Vitest (`vitest run`)             | ✅ yes                          |
| `pnpm format` / `format:check`        | Prettier write / check            | ✅ yes                          |
| `pnpm dev` / `preview` / `test:watch` | dev server / watch                | ❌ never (rule 1)               |
| `pnpm lint` / `lint:fix`              | eslint                            | ❌ never (rule 2, hook owns it) |
| `pnpm build` / `verify`               | builds (`vite-ssg`)               | ❌ never (rule 3)               |

> `pnpm dev` proxies `/api` and `/ws` to `localhost:8000`.

## Architecture

- **API:** all HTTP goes through `src/api/client.ts` (`api.get/post/put/delete/upload`, `downloadBlob`). Never call `fetch()` directly outside `src/api/` — ESLint blocks it. Per-domain modules (e.g. `src/api/auth.ts`) wrap `api.*` and own their types.
- **Auth:** JWT in `localStorage` (`token`), sent as the **raw** `Authorization` header — no `Bearer ` prefix (ESLint blocks it). Session resolved once via `useAuthStore().init()` → `GET /auth/me`, invoked from the router guard.
- **Routing:** `src/router/index.ts`. Mark protected routes with `meta.requiresAuth`, login-only with `meta.guestOnly`. Public routes to prerender go in `vite.config.ts` → `ssgOptions.includedRoutes`.
- **State:** Pinia, setup-store style (see `src/stores/auth.ts`).
- **Styling:** UnoCSS is installed but pages ship no styling, colors, or chrome by design. Don't add a design system to the boilerplate itself — that belongs to the product built on top of it.
- **Build:** `vite-ssg` prerenders public routes; the app (`/app/*`) is client-only.

## Conventions

- Vue SFCs with `<script setup lang="ts">`.
- Prettier: no semicolons, single quotes, 100 cols. Don't hand-format against it.
- Add tests under `tests/*.test.ts`; component tests need `// @vitest-environment jsdom` at the top.

## Skills

Project skills live in `.claude/skills/`:

- **`dev-workflow`** — the operating rules above, in full. Consult before running commands or proposing commits.
- **`ui-ux-pro-max`** — UI/UX design intelligence (styles, palettes, typography, stacks). Use the `vue` stack. CLI: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py …`. (Note: the boilerplate ships no styling by design — use this only when building the product on top.)
