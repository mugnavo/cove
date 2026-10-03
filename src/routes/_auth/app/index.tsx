import { createFileRoute } from "@tanstack/react-router";

import { useAuthSuspense } from "#/lib/auth/hooks.ts";

export const Route = createFileRoute("/_auth/app/")({
  component: AppIndex,
});

function AppIndex() {
  const { user } = useAuthSuspense();

  return (
    <div className="flex flex-col items-center gap-3 text-center text-sm">
      <pre className="mb-1 rounded-md border bg-card p-1 text-xs text-card-foreground">
        _auth/app/index.tsx
      </pre>

      <div>
        Signed in as:
        <span className="mt-0.5 block font-mono text-xs">{user?.name}</span>
      </div>

      <div>
        <p>/app is a protected route under the _auth layout:</p>
        <pre className="mx-auto mt-0.5 block w-fit rounded-md border bg-card p-1 text-xs text-card-foreground">
          _auth/route.tsx
        </pre>
      </div>
    </div>
  );
}
