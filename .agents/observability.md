# Observability

evlog emits one structured wide event per server request. The Nitro module owns request lifecycle logging; application code should add useful domain context to that event instead of scattering unrelated log lines.

Do not add permanent application logs merely as a routine part of implementation work. Add context when it will explain a meaningful business outcome, an actionable failure, or a rare lifecycle event that would otherwise be difficult to diagnose.

## TanStack Start

- Call `useLogger()` from `src/lib/logger.server.ts` only inside server request work (server functions, server route handlers, or services called by them). Outside a live request event it returns a detached logger whose context is dropped, so logging never fails the work itself.
- Add context progressively with `log.set({ ... })`. Use stable, queryable field names and nested objects for related fields.
- A request already produces one Nitro-owned event. Do not add separate `log.info()` milestone events inside it; add the outcome and relevant context to the request logger instead.
- Do not call `emit()` for request work. Nitro emits the completed wide event after the response finishes.
- Import `createError` and `parseError` directly from `evlog`. Throw `createError({ message, status, why, fix, link })` for expected failures at server boundaries; its `status` becomes the response status and the event's status. A plain `Error` means an unexpected failure and is recorded as a 500. Use `parseError(error)` where callers need the safe structured fields.
- When translating a caught error into a user-facing one, pass the original as `cause` in server functions; Start sends only `message` to the client. Server routes answer with the error's JSON, which includes `cause.message`, so put diagnostics there in `internal` instead.
- Do not catch an unexpected error only to call `log.error()` and rethrow it. Add useful context with `log.set()` and let the global error middleware in `src/start.ts` record the failure once; catch only to recover, translate the error, or add behavior the global handler cannot provide.
- Never log secrets, credentials, raw tokens, or unnecessary personal data. Treat full URLs and query strings, IP addresses, user agents, request bodies, and complete user/session records as sensitive; prefer stable IDs and explicitly allowlisted fields. Put private diagnostic values in `createError({ internal: ... })`, not client-visible fields. The Nitro module logs each request's URL pathname, so never put secrets in paths.
- Await work that contributes to the request event. The Nitro v3 integration does not support `log.fork()`.
- Context set from component `useSuspenseQuery` calls during streaming SSR arrives after Nitro has emitted the page's event, so it is dropped. Put context that must reach the page event in `beforeLoad` or a loader.

```ts
import { createError } from "evlog";

import { useLogger } from "#/lib/logger.server.ts";

const log = useLogger();
log.set({ user: { id: user.id }, action: "update_profile" });

throw createError({
  message: "Profile update failed",
  status: 409,
  why: "The profile changed while this update was in progress",
  fix: "Refresh and try again",
});
```

`nitro.config.ts` registers the Nitro v3 module, and `src/start.ts` installs global middleware that records failed requests and server functions with their real status. It also restores Start's server-function CSRF guard, which a custom `start.ts` otherwise replaces; keep `createCsrfMiddleware` when editing it. Do not add per-function error logging: throw and let that middleware record the failure once. Better Auth turns its own errors into responses, so `onAPIError.onError` in `src/lib/auth/auth.ts` records the unexpected ones.

### Event fields

Reuse the shared fields: `operation` and `serverFn` come from the middleware, and `user.id` from `_getUser()`. Name domain context after the resource it describes (`project.id`, `invoice.status`) and set it in the shared helper that loads or authorizes that resource, not in each caller. Do not add raw bodies or other user-generated content.

## Drains and sampling

Without a drain, events go only to stdout. To add one, create an `evlog.config.ts` next to `nitro.config.ts` and set `drain`, plus `sampling` and `keep` if needed, with `defineEvlog()` from `evlog`. Prefer it over the `evlog:drain` Nitro hook, which misses standalone `createLogger()` emits such as late streaming-SSR failures.

- On serverless hosts, hand each send to the platform's `waitUntil` so delivery neither delays the response nor is cut off. Nitro's Netlify preset does not forward Netlify's context, so use `Netlify.context.waitUntil` there.
- If you sample, always keep errors and other 4xx/5xx responses, slow requests, and mutations.

## Standalone server work

For jobs, scripts, migrations, and lifecycle operations outside a framework request, import `createLogger()` and `initLogger()` from `evlog`. Build one wide event as work progresses and call `emit()` exactly once after its outcome is known. `logger.error()` adds error context but does not emit by itself.

```ts
import { auditRedactPreset, createLogger, initLogger } from "evlog";

initLogger({
  env: { service: "worker" },
  redact: {
    ...auditRedactPreset,
    paths: [...(auditRedactPreset.paths ?? []), "cookies"],
  },
});

const log = createLogger({ operation: "sync_accounts" });

try {
  const synced = await syncAccounts();
  log.emit({ outcome: "succeeded", synced });
} catch (error) {
  log.error(error instanceof Error ? error : String(error));
  log.emit({ outcome: "failed", _forceKeep: true });
  throw error;
}
```

Call `initLogger()` once at the entry point of a standalone process. Do not call it in request handlers; the Nitro module initializes evlog there. Use the simple `log` API only for rare one-off lifecycle events where a progressively built wide event would add no value.

Configure the same credential redaction used in `nitro.config.ts` for every standalone process. Redaction is a backstop, not permission to add raw headers, cookies, request bodies, or full records to log context.
