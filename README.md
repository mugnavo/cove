# [Cove Stack](https://github.com/mugnavo/cove)

<!-- scaffold:description -->

A minimal starter stack for 🏝️ TanStack Start. [→ Preview here](https://cove.mugnavo.com/)

```bash
pnpm create cove
```

- [React](https://react.dev) + TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) (base-rhea, [`--preset b1au68YWO`](https://ui.shadcn.com/create?preset=b1au68YWO&base=base&template=start&pointer=true))
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Better Auth](https://better-auth.com/)
- [Vite Plus](https://viteplus.dev/) + [Nitro](https://nitro.build/)

> [!TIP]
> This template is also available as a monorepo, powered by Vite+ and pnpm workspaces. See [mugnavo/cove-monorepo](https://github.com/mugnavo/cove-monorepo).

## Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/en/download) >= 24
- [pnpm](https://pnpm.io/installation) >= 12
- [Vite Plus](https://viteplus.dev/guide/#install-vp) (`vp`)

#### Setup

1. [Use this template](https://github.com/new?template_name=cove&template_owner=mugnavo) or create a project using our CLI:

   ```bash
   pnpm create cove
   ```

2. Create a `.env.local` file with your values, based on [`.env.schema`](./.env.schema), then validate them:

   ```sh
   vpr env:load
   ```

3. Generate the initial migration with drizzle-kit, then apply to your database:

   ```sh
   vpr db generate
   vpr db migrate
   ```

   https://orm.drizzle.team/docs/migrations

4. Run the development server:

   ```bash
   vpr dev
   ```

   The development server should now be running at [http://localhost:3000](http://localhost:3000).

## Environment variables

[Varlock](https://varlock.dev/) keeps the environment-variable contract in `.env.schema` and generates types from it. Put local values, including secrets, in the uncommitted `.env.local`, then run `vpr env:load` to validate them.

In application code, `import { ENV } from "varlock/env"` instead of reading `process.env` directly.

## Logging

[evlog](https://www.evlog.dev/) is wired into the app through Nitro and emits one structured event per request. Add a [drain](https://www.evlog.dev/integrate/adapters/overview) when production needs logs sent to your chosen provider.

## Deploying to production

[![Netlify Status](https://api.netlify.com/api/v1/badges/66acdee6-8e42-436f-9943-a67cad998f63/deploy-status)](https://app.netlify.com/projects/mugnavo-cove/deploys)

The [vite config](./vite.config.ts) is configured to use Nitro by default, which supports many [deployment presets](https://nitro.build/deploy) like Netlify, Vercel, Node.js, and more.

Refer to the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) for more information.

## Issue watchlist

- [Router/Start issues](https://github.com/TanStack/router/issues) - TanStack Start is in RC.
- [Devtools releases](https://github.com/TanStack/devtools/releases) - TanStack Devtools is in alpha and may still have breaking changes.
- [Nitro v3 beta](https://nitro.build/blog/v3-beta) - The template is configured with Nitro v3 beta by default.
- [Drizzle ORM v1 RC](https://orm.drizzle.team/docs/relations-v1-v2) - Drizzle ORM v1 is in RC with relations v2.
- [Vite+ releases](https://github.com/voidzero-dev/vite-plus/releases) - Vite+ is in beta.

## Goodies

#### Upgrading dependencies

Dependency versions are pinned, so they may be slightly outdated when you create your project. To selectively upgrade packages, run `vpr deps` or `vpx taze@latest -Ilw --maturity-period 3`.

#### Scripts

Check [package.json](./package.json) for the full list of available scripts.

- **`auth:generate`** - Regenerate the [auth db schema](./src/lib/db/schema/auth.schema.ts) if you've made changes to your Better Auth [config](./src/lib/auth/auth.ts).
- **`db`** - Run [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) commands. (e.g. `vpr db generate`, `vpr db studio`)
- **`ui`** - The shadcn/ui CLI. (e.g. `vpr ui add button`)
- **`format`**, **`lint`** - Run Oxfmt and Oxlint, or both via `vpr check`.
- **`deps`** - Selectively upgrade dependencies via taze.

#### Utilities

- [`auth/middleware.ts`](./src/lib/auth/middleware.ts) - Sample middleware for enforcing authentication on server functions & API routes.
- [`theme-toggle.tsx`](./src/components/theme-toggle.tsx), [`theme-provider.tsx`](./src/components/theme-provider.tsx) - A theme toggle and provider for toggling between light and dark mode.

#### Testing

The [testing foundation](./.agents/testing.md) uses Vitest and Playwright and is intentionally lightweight. For short-lived prototypes, it can be safely ignored or removed.

- `vpr test` (or Vite+'s built-in `vp test`) runs the Vitest unit and local integration tests once.
- `vpr test watch` runs Vitest in watch mode.
- `vpr test:e2e` builds the app and runs the Playwright end-to-end tests.

## License

Code in this template is public domain via [Unlicense](./LICENSE). Feel free to remove or replace for your own project.

## Ecosystem

- [@tanstack/intent](https://tanstack.com/intent/latest/docs/getting-started/quick-start-consumers) - Up-to-date skills for your AI agents, auto-synchronized from your installed dependencies.
- [awesome-tanstack-start](https://github.com/Balastrong/awesome-tanstack-start) - A curated list of awesome resources for TanStack Start.
- [shadcn/ui Directory](https://ui.shadcn.com/docs/directory), [shoogle.dev](https://shoogle.dev/) - Component directories & registries for shadcn/ui.

## Related templates

- [mugnavo/cove-monorepo](https://github.com/mugnavo/cove-monorepo) - A minimal monorepo version of this template, powered by Vite+ and pnpm workspaces.
- [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack) - An opinionated and batteries-included monorepo template from Luzefiru, built on cove-monorepo, with Paraglide.js (i18n), Hono, oRPC, and more.
