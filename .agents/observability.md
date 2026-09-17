# Observability

evlog emits one structured wide event per server request. The Nitro module owns request lifecycle logging; application code should add useful domain context to that event instead of scattering unrelated log lines.

Do not add permanent application logs merely as a routine part of implementation work. Add context when it will explain a meaningful business outcome, an actionable failure, or a rare lifecycle event that would otherwise be difficult to diagnose.

## TanStack Start

- Call `useLogger()` from `src/lib/logger.server.ts` only inside server request work (server functions, server route handlers, or services called by them).
- Add context progressively with `log.set({ ... })`. Use stable, queryable field names and nested objects for related fields.
- A request already produces one Nitro-owned event. Do not add separate `log.info()` milestone events inside it; add the outcome and relevant context to the request logger instead.
- Do not call `emit()` for request work. Nitro emits the completed wide event after the response finishes.
- Import `createError` and `parseError` directly from `evlog`. Throw `createError({ message, status, why, fix, link })` at server boundaries; use `parseError(error)` where callers need the safe structured fields.
- Do not catch an unexpected error only to call `log.error()` and rethrow it. Add useful context with `log.set()` and let the root error middleware record the failure once; catch only to recover, translate the error, or add behavior the global handler cannot provide.
- Never log secrets, credentials, raw tokens, or unnecessary personal data. Treat full URLs and query strings, IP addresses, user agents, request bodies, and complete user/session records as sensitive; prefer stable IDs and explicitly allowlisted fields. Put private diagnostic values in `createError({ internal: ... })`, not client-visible fields.
- Await work that contributes to the request event. The Nitro v3 integration does not support `log.fork()`, and mutating a logger after its response has completed produces a warning.

```ts
import { createError } from "evlog";

import { useLogger } from "#/lib/logger.server";

const log = useLogger();
log.set({ user: { id: user.id }, action: "update_profile" });

throw createError({
  message: "Profile update failed",
  status: 409,
  why: "The profile changed while this update was in progress",
  fix: "Refresh and try again",
});
```

Framework wiring lives in `nitro.config.ts` and `src/routes/__root.tsx`.

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
