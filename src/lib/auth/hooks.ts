import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { authQueryOptions } from "./queries";

/**
 * These hooks can be used in our components.
 * They share the same deduped query as beforeLoad in the _auth layout,
 * so these will not result in unnecessary duplicate calls.
 *
 * For reading auth data in loaders/beforeLoad,
 * we can use `authQueryOptions` from queries.ts with `queryClient` from loader context.
 */

export function useAuth() {
  const { data: user, isPending } = useQuery(authQueryOptions());
  return { user, isPending };
}

export function useAuthSuspense() {
  const { data: user } = useSuspenseQuery(authQueryOptions());
  return { user };
}
