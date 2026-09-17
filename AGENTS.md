# Agent Guidelines

## Essentials

- Stack: TypeScript + React (TanStack Start), with Drizzle ORM, shadcn/ui, and Better Auth.
- Use shadcn CLI (`vpr ui add <component>`) for adding new UI components & primitives.
- Use `lucide-react` for UI icons (use `Icon` suffix, e.g. `import { Loader2Icon } from "lucide-react"`); for brand icons use `@icons-pack/react-simple-icons` (e.g. `SiGithub`).
- Keep UI copy user-centered: describe outcomes and next actions concisely without exposing providers, internal states, or implementation details.
- Don't run a standalone build after every little change. Use `vpr lint` as the baseline and run the narrowest relevant tests described in the testing guidelines; `vpr test:e2e` performs its own production build.
- For running scripts, use `vpr`, which is a shorthand for `vp run`.
- Treat `.env.schema` as the environment-variable source of truth. In application code, import `ENV` from `varlock/env` instead of reading `process.env` directly. Never read local env files; validate safely with `vp exec varlock load --agent`.

## Code style

- Prefer straightforward solutions for current requirements. Introduce abstractions, generic utilities, extensibility, or architectural layers only when there is a concrete need.
- Keep the main control flow easy to follow. Avoid wrapper layers that merely rename or forward calls and fragmentation that creates unnecessary jumps between files or functions.
- Extract helpers only when they meaningfully improve readability, reuse, or testability.
- Keep types simple and close to where they are used. Prefer inference and avoid type gymnastics unless necessary.
- Be robust at system boundaries such as user input, auth, external APIs, and persistence. Within trusted boundaries, rely on established invariants instead of guarding against hypothetical states.
- Handle edge cases in proportion to their likelihood and impact. Avoid adding complexity for contrived, extremely unlikely, low-impact scenarios outside normal supported use, while preserving applicable security and data-integrity requirements.
- Add concise comments only for non-obvious intent, unusual edge cases, and important constraints. Briefly explain why, not what.

## Topic-specific Guidelines

- [Data flow](.agents/data-flow.md) - TanStack Start/Router + Query data loading, cache behavior, mutations, and server boundaries
- [Auth patterns](.agents/auth.md) - Route guards, middleware, auth utilities
- [Database conventions](.agents/database.md) - Drizzle column types and generated Better Auth schema ownership
- [Observability](.agents/observability.md) - evlog request context, structured errors, and safe event logging for server-side features
- [Testing](.agents/testing.md) - What to test, Vitest/Playwright boundaries, commands
- [TypeScript conventions](.agents/typescript.md) - Casting rules, prefer type inference
- [Workflow](.agents/workflow.md) - Workflow commands, validation approach

<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `vpx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `vpx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
