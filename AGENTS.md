<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code style

Formatting is enforced by Prettier (`.prettierrc`), with `.editorconfig` mirroring it for editors. Write code that already follows it:

- Single quotes, in JS/TS and in JSX attributes (`className='...'`)
- No semicolons
- Tabs for code; two spaces for `json`, `md`, `mdx`, `yml` and `yaml`
- Tailwind classes are sorted by `prettier-plugin-tailwindcss`

Run `pnpm format` to fix formatting and `pnpm format:check` to verify it. Before opening a PR, `pnpm lint` and `pnpm build` must pass.

## Git workflow

- Never commit to `main`. Work on a branch named `type/short-description` (`feat/`, `fix/`, `chore/`, `docs/`, `style/`, `refactor/`).
- Use Conventional Commits in English, imperative mood: `feat(lab): add dial component`.
- Keep branches small and short-lived, one topic per PR. Formatting-only changes go in their own commit.
- Keep a branch up to date with `git rebase main`, then `git push --force-with-lease`. Never rewrite `main`.
