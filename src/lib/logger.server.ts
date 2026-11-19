import { createLogger, type RequestLogger } from "evlog";
import { useRequest } from "nitro/context";

const RESPONSE_STARTED = "evlogResponseStarted";

function getRequestContext() {
  try {
    return useRequest().context;
  } catch {
    // Streaming SSR can resume rendering outside Nitro's async context.
    return undefined;
  }
}

function getRequestLogger() {
  const context = getRequestContext();
  // evlog's Nitro plugin attaches the request logger when the request starts.
  const log = context?.log as RequestLogger | undefined;

  return log && context?.[RESPONSE_STARTED] !== true ? log : undefined;
}

/**
 * Returns the evlog logger for the current Nitro request.
 * Call it only during server request work; Nitro's async context must be enabled.
 *
 * Nitro emits the request's wide event once the response starts, but streaming SSR keeps
 * rendering after that, sometimes outside the request's async context. Work in that phase gets
 * a detached logger, so logging never fails the request: its context is dropped unless the
 * caller emits it as a separate event.
 */
export function useLogger() {
  const log = getRequestLogger();

  if (log) {
    return log;
  }

  const requestLog = getRequestContext()?.log as RequestLogger | undefined;
  const { method, path, requestId } = requestLog?.getContext() ?? {};
  return createLogger({ method, path, requestId });
}

/** Whether `useLogger()` would return a detached logger because the request event is gone. */
export function isResponseStarted() {
  return !getRequestLogger();
}

/** Call once the framework hands Nitro the response; later work cannot reach the request event. */
export function markResponseStarted() {
  const context = getRequestContext();

  if (context) {
    context[RESPONSE_STARTED] = true;
  }
}
