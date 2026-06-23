---
name: dev-workflow
description: 'How to work in the vyraj-anchorages repo — mandatory operating rules and constraints. Read BEFORE: running any pnpm/npm/shell command, starting a dev server or build, running eslint, or proposing a git commit/push. Covers forbidden commands (servers, builds, eslint, commit/push), the required type-check/test self-check, and the fix/feature/chore commit-message convention.'
---

# Dev Workflow — vyraj-anchorages

Mandatory rules for working in this repository. They override default habits
(e.g. "run the build to verify", "lint before finishing", "commit when done").

This is a Vue 3 + TypeScript **boilerplate** — toolchain and architecture only, no
business logic. Keep additions small and idiomatic to the existing patterns; don't
bolt a design system onto the boilerplate itself (see `CLAUDE.md`).

## 1. Never start servers

Do **not** run any long-running / server process:

- `pnpm dev`, `pnpm preview`
- `pnpm test:watch` (Vitest watch mode — it never returns)
- any `vite`, watch mode, or process that does not return on its own

The user runs servers themselves. If you need to see a change running, ask the
user to start it (e.g. they can type `! pnpm dev` in the prompt).

## 2. Never run eslint — self-check with type-check + tests

- Do **not** run `pnpm lint`, `pnpm lint:fix`, or `eslint …`.
- Linting is enforced by the **lefthook git hooks** (`pre-commit` runs eslint +
  prettier on staged files; `pre-push` runs `pnpm verify`). It is not your job.
- Your self-checks are:
  - **`pnpm exec vue-tsc -b`** — type-check (no emit; this is what `pnpm build`
    runs first). Run it after meaningful TypeScript / `.vue` changes; keep it green.
  - **`pnpm test`** — Vitest (`vitest run`). Run it after logic changes.
- `pnpm format` / `pnpm format:check` — Prettier. Safe to run to autoformat.

## 3. Never run builds

Do **not** run:

- `pnpm build` (`vue-tsc -b && vite-ssg build`)
- `pnpm verify` (it chains `lint` + `build` + `test`)
- `docker build` or anything that compiles/bundles the app

Builds run in the lefthook `pre-push` hook / CI / Docker. For build-level
confidence, rely on `pnpm exec vue-tsc -b` and `pnpm test`, or ask the user to
run the build.

## 4. Never commit or push — propose the message instead

- Do **not** run `git commit`, `git push`, or `git add` with intent to commit.
- When work is ready, **propose a commit message** for the user to copy/run.
- The user decides when and what to commit.

### Always end with a commit message — no exceptions

This is the easiest rule to forget, so treat it as a hard checklist item:

- **Every turn that modifies a tracked file MUST end by proposing the commit
  message**, unprompted, as the **last thing you output**. Not "when the feature
  is done" — after _each_ change you hand back.
- Don't wait to be asked. If the user has to say "where's the commit msg?", you
  failed the rule.
- Build it fresh from the **current** `git status` / `git diff` (the user may have
  already committed earlier work — only describe what's still uncommitted). Then
  apply rule 5's `<prefix>/ …` format.
- The only times you may skip it: a turn that changed **no** tracked files (pure
  question, read-only investigation), or the diff is empty.

## 5. Commit-message convention

Build the message from the actual **not-yet-committed** changes — review
`git status` / `git diff` first, then describe _those_ changes (a **single line**).

Proposed commit messages **must** start with one of:

- `fix/` — bug fixes
- `feature/` — new functionality
- `chore/` — tooling, config, docs, refactors, deps

Format: `<prefix>/ <concise summary>` on one line — e.g.

```
feature/ add guestOnly redirect for the login route
fix/ send raw Authorization header without Bearer prefix
chore/ add CLAUDE.md operating rules and dev-workflow skill
```

## Minimize permission prompts

The user does not want to approve safe, read-only commands one by one. Two things
keep friction low:

- **Never prefix `cd`.** The shell already runs in the repo root and the working
  directory persists across calls, so `cd` is never needed. A command that starts
  with `cd … && <write>` trips a hard "cd with write" guard ("path resolution
  bypass") that prompts **regardless of permission mode** — even under bypass. Run
  commands directly with repo-relative paths.
- **Use the dedicated tools, not shell.** Read files with **Read**, list with
  **Glob**, search with **Grep** — never `cat`/`ls`/`find`/`grep` (and especially
  not compound `echo …; for f …; do cat …; done`, which trips the "expansion
  obfuscation" guard). Keep any shell command simple and single-purpose.
- **Permissions are wide open.** The committed `.claude/settings.json` allows
  Edit/Write in-tree, `pnpm test`/`format`/`exec`, and common read-only + file-op
  Bash. The maintainer's local `settings.local.json` runs
  `permissions.defaultMode: "bypassPermissions"` — so on this machine **nothing
  prompts**. Just execute; never make the user click "Yes".
- **Bypass mode removes the safety net, not the rules.** Rules 1–5 above are
  behavioral and still bind regardless of permission mode: never start servers,
  never run eslint, never run builds, never commit/push. Don't run destructive
  commands (`rm -rf`, history rewrites, etc.) just because nothing will stop you.

## Quick reference

| Action                                       | Allowed?             |
| -------------------------------------------- | -------------------- |
| `pnpm exec vue-tsc -b`, `pnpm test`, `pnpm format` | ✅             |
| start dev server / preview / `test:watch`    | ❌                   |
| `pnpm lint` / `eslint`                       | ❌ (lefthook owns)   |
| `pnpm build` / `pnpm verify`                 | ❌                   |
| `git commit` / `git push`                    | ❌ (propose message) |
