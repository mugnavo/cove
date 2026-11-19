# Observability

evlog emits one structured wide event per server request. The Nitro module owns request lifecycle logging; application code should add useful domain context to that event instead of scattering unrelated log lines.

Do not add permanent application logs merely as a routine part of implementation work. Add context when it will explain a meaningful business outcome, an actionable failure, or a rare lifecycle event that would otherwise be difficult to diagnose.

## Levels and messages

- `info` records a completed outcome, `warn` an expected degraded outcome someone should act on, and `error` a failed operation. If nobody should react to it, it is not a `warn` or an `error`.
- Keep message strings stable and put values in fields: `log.info({ event: "server_started", url })`, not a message with the URL interpolated into it.

## TanStack Start

- Call `useLogger()` from `src/lib/logger.server.ts` only inside server request work (server functions, server route handlers, or services called by them). Outside a live request event it returns a detached logger whose context is dropped, so logging never fails the work itself.
- Add context progressively with `log.set({ ... })`. Use stable, queryable field names and nested objects for related fields.
- A request already produces one Nitro-owned event. Do not add separate `log.info()` milestone events inside it; add the outcome and relevant context to the request logger instead.
- Do not call `emit()` for request work. Nitro emits the completed wide event after the response finishes.
- Import `createError` and `parseError` directly from `evlog`. Throw `createError({ message, status, why, fix, link })` for expected failures at server boundaries; its `status` becomes the response status and the event's status. A plain `Error` means an unexpected failure and is recorded as a 500. Use `parseError(error)` where callers need the safe structured fields.
- When translating a caught error into a user-facing one, pass the original as `cause` in server functions; Start sends only `message` to the client. Server routes answer with the error's JSON, which includes `cause.message`, so put diagnostics there in `internal` instead.
- Do not catch an unexpected error only to call `log.error()` and rethrow it. Add useful context with `log.set()` and let the global error middleware in `src/start.ts` record the failure once; catch only to recover, translate the error, or add behavior the global handler cannot provide.
- Never log secrets, credentials, raw tokens, or unnecessary personal data. Treat full URLs and query strings, IP addresses, user agents, request bodies, and complete user/session records as sensitive; prefer stable IDs and explicitly allowlisted fields. Put private diagnostic values in `createError({ internal: ... })`, not client-visible fields.
- Await work that contributes to the request event. The Nitro v3 integration does not support `log.fork()`.
- Nitro emits the event when the response starts, but streaming SSR keeps rendering afterwards: component `useSuspenseQuery` calls run after the page's event is gone, sometimes outside Nitro's async context. Context set during that phase is dropped, and server-function failures in that phase are emitted as their own error event with the page's `requestId` when it is still available. Put context that must reach the page event in `beforeLoad` or a loader.

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

Framework wiring lives in `nitro.config.ts`, which registers the Nitro v3 module, and `src/start.ts`, which installs global middleware. Start turns thrown errors into responses before Nitro sees them, so that middleware records them instead:

- Request middleware runs `evlogErrorHandler` for `EvlogError`s and records any other unexpected error from server routes and SSR. It also restores Start's server-function CSRF guard, which a custom `start.ts` otherwise replaces; keep `createCsrfMiddleware` first when editing it.
- Function middleware records every failed server function with `serverFn` and sets the response status from the error (Start would otherwise answer an RPC failure with 200). For RPC requests it sets `operation` to the server function's name, because the request path is an opaque function ID.

Do not add per-function error logging; throw and let this middleware record the failure once. Better Auth also turns thrown errors into responses, so `onAPIError.onError` in `src/lib/auth/auth.ts` records its unexpected ones.

### Event fields

Reuse stable names so events stay queryable: `operation` and `serverFn` come from the middleware, and `user.id` is set by `_getUser()`, so `authMiddleware`, `freshAuthMiddleware`, and the auth route query identify every request they run in. Name domain context after the resource it describes (`project.id`, `invoice.status`), and set it in the shared helper that loads or authorizes that resource rather than in each caller. Do not add raw bodies, comments, or other user-generated content.

### Redaction

Redaction is configured once, in the `redact` object in `nitro.config.ts`. Add a new family of sensitive fields there instead of masking values at call sites. With that config, evlog redacts any key ending in `password`, `secret` or `token` at any depth (`newPassword`, `idToken`), plus the preset's paths and `cookies`.

- The Nitro module records the request's URL pathname as `path` and drops the query string. Custom `redact.patterns` are not applied reliably under the Nitro module (evlog 2.35.1 re-initializes the logger without restoring them), so never put secrets in URL paths. Better Auth's default password-reset link does (`/api/auth/reset-password/<token>`): if you enable `sendResetPassword`, email a link to your own reset page with the token in the query string instead.
- To leave noisy routes such as health checks out of request logging, use the Nitro module's `exclude` option rather than custom middleware.

## Drains and sampling

Without a drain, events go only to stdout. To send them to a provider, add an `evlog.config.ts` next to `nitro.config.ts` (the evlog Nitro module loads it) and set `drain`, plus `sampling` and `keep` if needed, with `defineEvlog()` from `evlog`. Prefer it over the `evlog:drain` Nitro hook: it also receives standalone `createLogger()` emits, such as late streaming-SSR failures.

- On serverless hosts, send each event when it is emitted rather than buffering across requests, and hand the send to the platform's `waitUntil` (for example `Netlify.context.waitUntil`, which Nitro's Netlify preset does not forward) so delivery neither delays the response nor is cut off.
- evlog's adapters log failed deliveries and never fail the request; keep stdout output on as the fallback record.
- Identify events with the same stable user ID your product analytics uses, and keep wide events operational: never derive product metrics from them.
- Tail rules (`sampling.keep`, `keep`) bypass head sampling. If you sample, always keep errors and other 4xx/5xx responses, slow requests, auth routes, and mutations; only successful reads are worth sampling.
- Tag events with the deployment environment and release through `env` in the Nitro module options, set at build time from your platform's variables, so each environment's traffic stays separable.

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
