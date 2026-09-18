import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  StarIcon,
  TerminalIcon,
} from "lucide-react";
import { Suspense } from "react";
import { useState } from "react";

import { SignOutButton } from "#/components/sign-out-button.tsx";
import { ThemeToggle } from "#/components/theme-toggle.tsx";
import { Button } from "#/components/ui/button.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { useAuthSuspense } from "#/lib/auth/hooks.ts";

import { formatGitHubStars } from "./format-github-stars";

/**
 * This is the intro component for Cove Stack, which you may delete after creating the project.
 * Happy coding!
 */
export function IntroPage() {
  const [isCopied, setIsCopied] = useState(false);

  const repoUrl = "https://github.com/mugnavo/cove";
  const cloneCommand = "pnpm create cove";
  const fallbackStarsCount = 1000;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cloneCommand);
      setIsCopied(true);
      toast.add({ type: "success", description: "Command copied to clipboard." });
      setTimeout(() => {
        setIsCopied(false);
      }, 4000);
    } catch {
      toast.add({ type: "error", description: "Failed to copy command." });
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pt-16 pb-12 md:pt-32">
      <header className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <a href={repoUrl} className="flex items-center gap-2 hover:underline">
            <img
              src="https://mugnavo.com/favicon-32x32.png"
              alt="Mugnavo logo"
              className="size-5 md:size-6"
            />
            <span className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              cove
            </span>
          </a>
          <div className="flex items-center gap-2">
            <RepoStarsBadge href={repoUrl} fallbackStarsCount={fallbackStarsCount} />
            <ThemeToggle />
          </div>
        </div>

        <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          A <span className="text-yellow-500 dark:text-yellow-200">minimal</span> starter stack for
          TanStack Start.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          A minimal, opinionated foundation for building type-safe web applications without the
          extra boilerplate.
        </p>
      </header>

      <section className="mb-12">
        <div className="rounded-xl border border-border bg-card p-1 shadow-2xl">
          <div className="group flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <TerminalIcon className="hidden size-4 shrink-0 text-muted-foreground/70 sm:inline" />
              <code className="overflow-hidden font-mono text-sm text-ellipsis whitespace-nowrap md:text-base">
                <span className="mr-2 hidden text-muted-foreground/70 select-none sm:inline">
                  $
                </span>
                <span className="select-all">{cloneCommand}</span>
              </code>
            </div>
            <button
              onClick={copyToClipboard}
              className="ml-4 shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              title="Copy command"
            >
              {isCopied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
            </button>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="py-6">Loading session...</div>}>
        <UserAction />
      </Suspense>

      <section className="mb-16 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        <Feature
          title="Full-Stack Foundation"
          desc="Build on a modern full-stack framework with TanStack Start, Router, and Vite."
        />
        <Feature
          title="Only the Essentials"
          desc="Drizzle ORM, Better Auth, shadcn/ui. Less boilerplate that you'll end up deleting anyway."
        />
        <Feature
          title="End-to-end Type Safety"
          desc="Effortless type safety powered by TanStack Router and Start server functions."
        />
        <Feature
          title="Next-Gen Tooling"
          desc="Powered by Vite+, which includes Vite, Oxlint, and Oxfmt for a faster development workflow."
        />
      </section>

      <section className="mb-12 space-y-2">
        {TECH_BADGE_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap items-center justify-center gap-2">
            {row.map((badge) => (
              <a
                key={badge.alt}
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img alt={badge.alt} src={badge.src} />
              </a>
            ))}
          </div>
        ))}
      </section>

      <TemplateSetupGuide />

      <footer className="flex flex-col items-center justify-between gap-6 text-sm md:flex-row">
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <SiGithub className="size-4" />
          GitHub
        </a>
        <a
          href="https://mugnavo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 underline decoration-border transition-all hover:decoration-foreground"
        >
          Mugnavo
          <ExternalLinkIcon className="size-4" />
        </a>
      </footer>
    </div>
  );
}

function UserAction() {
  const { user } = useAuthSuspense();

  return user ? (
    <section className="mb-20 flex flex-col items-center space-y-1.5">
      <div className="mb-4 flex w-full items-center gap-2">
        <div className="size-2 animate-pulse rounded-full bg-primary"></div>
        <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Session
        </h2>
      </div>
      <div className="mb-3 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-border"></div>
            <div className="size-2.5 rounded-full bg-border"></div>
            <div className="size-2.5 rounded-full bg-border"></div>
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
              useAuthSuspense() data
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70 uppercase">ReadOnly</span>
        </div>
        <div className="overflow-x-auto p-6">
          <pre className="font-mono text-xs leading-relaxed text-foreground/80">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>

      <Button render={<Link to="/login" />} className="w-fit" size="lg" nativeButton={false}>
        Go to /app
      </Button>
      <SignOutButton />
    </section>
  ) : (
    <section className="mb-20 space-y-1 text-center">
      <p>You are not signed in.</p>
      <Button render={<Link to="/login" />} className="w-fit" size="lg" nativeButton={false}>
        Log in
      </Button>
    </section>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function TemplateSetupGuide() {
  return (
    <details className="group mx-auto mb-16 max-w-[65ch] overflow-hidden rounded-xl border border-border bg-card/50 text-sm text-foreground/80">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 select-none [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-medium text-foreground">
            Just created a project from this stack?
          </span>
          <span className="mt-1 block text-muted-foreground">
            Expand for the starter cleanup checklist.
          </span>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-border px-4 py-4">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            Delete{" "}
            <code className="rounded-md border border-border bg-card px-1 py-0.5">
              src/components/_DELETE_ME_intro-page/
            </code>
            , which contains this page, its helper, and the example unit test.
          </li>
          <li>
            Delete{" "}
            <code className="rounded-md border border-border bg-card px-1 py-0.5">
              e2e/_DELETE_ME_example-tests/
            </code>
            . The Playwright config needs no change.
          </li>
          <li>
            Replace the starter homepage in{" "}
            <code className="rounded-md border border-border bg-card px-1 py-0.5">
              src/routes/index.tsx
            </code>
            .
          </li>
        </ol>
        <p className="mt-4 text-muted-foreground">
          The testing setup is intentionally lightweight. For short-lived prototypes, it can be
          safely ignored or removed.
        </p>
      </div>
    </details>
  );
}

function RepoStarsBadge({
  href,
  fallbackStarsCount,
}: {
  href: string;
  fallbackStarsCount: number;
}) {
  const { data } = useQuery({
    queryKey: ["github-repo-stars"],
    queryFn: ({ signal }) => fetchRepoStars({ signal }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
    enabled: typeof window !== "undefined",
  });

  const count = data || fallbackStarsCount;
  const formattedStarsCount = formatGitHubStars(count);
  const starsLabel = `${count.toLocaleString()}${data ? "" : "+"} stars on GitHub`;

  return (
    <Button
      render={
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={starsLabel}
          title={starsLabel}
        />
      }
      nativeButton={false}
      variant="secondary"
      className="tracking-wide"
    >
      <SiGithub className="size-4" />
      {formattedStarsCount}
      {data ? "" : "+"}
      <StarIcon
        fill="currentColor"
        strokeWidth={0}
        className="size-4 text-yellow-500 dark:text-yellow-300"
      />
    </Button>
  );
}

async function fetchRepoStars({ signal }: { signal: AbortSignal | undefined }) {
  const response = await fetch("https://api.github.com/repos/mugnavo/cove", {
    signal,
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch repository stars");
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("stargazers_count" in data) ||
    typeof data.stargazers_count !== "number"
  ) {
    throw new Error("Invalid repository response");
  }

  return data.stargazers_count;
}

interface TechBadge {
  alt: string;
  href: string;
  src: string;
}

const CORE_BADGES: TechBadge[] = [
  {
    alt: "React version",
    href: "https://react.dev",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies.react&label=react&style=flat-square",
  },
  {
    alt: "TanStack Start version",
    href: "https://tanstack.com/start/latest",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22%40tanstack%2Freact-start%22%5D&label=tanstack-start&style=flat-square",
  },
  {
    alt: "TanStack Query version",
    href: "https://tanstack.com/query/latest",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22%40tanstack%2Freact-query%22%5D&label=tanstack-query&style=flat-square",
  },
];

const UI_BADGES: TechBadge[] = [
  {
    alt: "Tailwind CSS version",
    href: "https://tailwindcss.com/",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.devDependencies.tailwindcss&label=tailwindcss&style=flat-square",
  },
  {
    alt: "shadcn/ui version",
    href: "https://ui.shadcn.com/",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies.shadcn&label=shadcn%2Fui&style=flat-square",
  },
  {
    alt: "Base UI version",
    href: "https://base-ui.com/",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22%40base-ui%2Freact%22%5D&label=base-ui&style=flat-square",
  },
];

const DATA_BADGES: TechBadge[] = [
  {
    alt: "Drizzle ORM version",
    href: "https://orm.drizzle.team/",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22drizzle-orm%22%5D&label=drizzle-orm&style=flat-square",
  },
  {
    alt: "Better Auth version",
    href: "https://better-auth.com/",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22better-auth%22%5D&label=better-auth&style=flat-square",
  },
];

const PLATFORM_BADGES: TechBadge[] = [
  {
    alt: "Vite+ version",
    href: "https://viteplus.dev",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog.vite-plus&label=vite-plus&style=flat-square",
  },
  {
    alt: "Nitro version",
    href: "https://nitro.build/",
    src: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Fcove%2Fmain%2Fpackage.json&query=%24.devDependencies.nitro&label=nitro&style=flat-square",
  },
];

const TECH_BADGE_ROWS = [CORE_BADGES, UI_BADGES, DATA_BADGES, PLATFORM_BADGES];
