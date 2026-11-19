import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { EvlogError, parseError } from "evlog";
import { evlogErrorHandler } from "evlog/nitro/v3";

import { isResponseStarted, markResponseStarted, useLogger } from "#/lib/logger.server.ts";

// Start turns thrown errors into responses before Nitro's error hook sees them, so record them
// here. Redirects and notFound() are not Error instances and pass through untouched.

/** Records unexpected errors from server routes and SSR; evlogErrorHandler records EvlogErrors. */
const requestErrorLogging = createMiddleware().server(async ({ next }) => {
  try {
    const response = await next();
    // Nitro emits the wide event now, while streaming SSR may still be rendering.
    markResponseStarted();
    return response;
  } catch (error) {
    if (error instanceof Error && !EvlogError.isEvlogError(error)) {
      useLogger().error(error);
    }
    throw error;
  }
});

/** Names the request's server function and records its failure on the wide event. */
const serverFnLogging = createMiddleware({ type: "function" }).server(
  async ({ next, serverFnMeta }) => {
    const log = useLogger();
    // Server functions also run during SSR and inside other server functions; only the RPC
    // target names the request's operation.
    const isRpcTarget = new URL(getRequest().url).pathname.endsWith(`/${serverFnMeta.id}`);

    if (isRpcTarget) {
      log.set({ operation: serverFnMeta.name });
    }

    try {
      return await next();
    } catch (error) {
      if (error instanceof Error) {
        // Suspense queries can fail during the streamed render, after the request's event was
        // emitted; report those failures as their own event.
        if (isResponseStarted()) {
          const lateLog = useLogger();
          lateLog.error(error, { serverFn: serverFnMeta.name });
          lateLog.emit();
        } else {
          log.error(error, { serverFn: serverFnMeta.name });
          // Start otherwise answers RPC failures with 200; this also gives SSR its 401/403/404.
          setResponseStatus(parseError(error).status);
        }
      }
      throw error;
    }
  },
);

// A custom start.ts replaces Start's default server-function CSRF guard, so restore it here.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    csrfMiddleware,
    createMiddleware().server(evlogErrorHandler),
    requestErrorLogging,
  ],
  functionMiddleware: [serverFnLogging],
}));
