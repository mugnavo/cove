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
    <div className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 pt-14 pb-12 sm:px-6 md:pt-22">
        <header className="flex items-center justify-between">
          <a href={repoUrl} className="flex items-center gap-2 hover:underline">
            <img
              src="https://mugnavo.com/favicon-32x32.png"
              alt="Mugnavo logo"
              className="size-5"
            />
            <span className="text-lg font-semibold tracking-tight text-foreground">cove</span>
          </a>
          <div className="flex items-center gap-2">
            <RepoStarsBadge href={repoUrl} fallbackStarsCount={fallbackStarsCount} />
            <ThemeToggle />
          </div>
        </header>

        <main>
          <section className="relative isolate mt-6 mb-24 overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-14 shadow-[0_32px_100px_-64px_rgba(0,0,0,0.55)] sm:px-10 md:mt-8 md:px-14 md:py-20">
            <div
              aria-hidden="true"
              className="absolute top-10 right-10 size-2 rounded-full bg-yellow-400 shadow-[0_0_32px_12px_rgba(250,204,21,0.2)] dark:bg-yellow-200"
            />
            <div
              aria-hidden="true"
              className="absolute -right-72 -bottom-88 size-192 rotate-[-8deg] rounded-[43%_57%_66%_34%/58%_39%_61%_42%] border border-sky-950/10 bg-sky-950/2.5 dark:border-sky-100/10 dark:bg-sky-100/2.5"
            />
            <div
              aria-hidden="true"
              className="absolute -right-60 -bottom-80 size-168 rotate-[-13deg] rounded-[51%_49%_39%_61%/44%_62%_38%_56%] border border-sky-950/10 dark:border-sky-100/10"
            />
            <div
              aria-hidden="true"
              className="absolute -right-44 -bottom-68 size-140 rotate-[-18deg] rounded-[38%_62%_55%_45%/63%_42%_58%_37%] border border-yellow-500/20 dark:border-yellow-200/15"
            />

            <div className="relative max-w-2xl">
              <a
                href="https://github.com/mugnavo/cove/issues/96"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-yellow-500/15 md:text-sm dark:border-yellow-200/20 dark:bg-yellow-200/10 dark:hover:bg-yellow-200/15"
              >
                TanStarter is now Cove Stack.
                <ExternalLinkIcon aria-hidden="true" className="size-3 md:size-3.5" />
              </a>
              <h1 className="max-w-xl text-3xl font-bold tracking-[-0.04em] text-balance sm:text-4xl md:text-5xl md:leading-[1.05]">
                A <span className="text-yellow-500 dark:text-yellow-200">minimal</span> starter
                stack for TanStack Start.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                The Cove Stack brings together the essentials for building type-safe web
                applications without the extra boilerplate.
              </p>

              <div className="mt-9 max-w-xl rounded-xl border border-border/80 bg-background/80 p-1 shadow-lg backdrop-blur-sm">
                <div className="group flex items-center justify-between rounded-lg border border-border bg-card/90 p-4">
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
                    aria-label="Copy command"
                  >
                    {isCopied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              A <span className="text-yellow-500 dark:text-yellow-200">calm</span> foundation to
              build on.
            </h2>
            <div className="grid grid-cols-1 gap-x-12 gap-y-8 rounded-2xl border border-border bg-card/50 p-6 sm:p-8 md:grid-cols-2">
              <Feature
                title="Full-Stack Core"
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
                desc="Build with Vite+, log with evlog, and manage environment variables with Varlock."
              />
            </div>
          </section>

          <Suspense fallback={<div className="mb-20 py-6">Loading session...</div>}>
            <UserAction />
          </Suspense>

          <section className="mb-20">
            <div className="space-y-2">
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
            </div>
          </section>

          <TemplateSetupGuide />
        </main>

        <footer className="flex flex-col items-center justify-between gap-6 pt-8 text-sm md:flex-row">
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
    </div>
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
      <div className="w-full">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-border"></div>
              <div className="size-2.5 rounded-full bg-border"></div>
              <div className="size-2.5 rounded-full bg-border"></div>
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                useAuthSuspense() data
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/70 uppercase">
              ReadOnly
            </span>
          </div>
          <div className="overflow-x-auto p-6">
            <pre className="font-mono text-xs leading-relaxed text-foreground/80">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
        <div className="-mt-px mr-4 ml-auto flex w-fit flex-wrap items-center justify-end gap-2 rounded-b-xl border border-t-0 border-border bg-muted/30 px-4 py-3 shadow-sm md:mr-8">
          <Button render={<Link to="/app" />} className="w-fit" size="lg" nativeButton={false}>
            Go to /app
          </Button>
          <SignOutButton />
        </div>
      </div>
    </section>
  ) : (
    <section className="mb-20">
      <div className="mb-4 flex w-full items-center gap-2">
        <div className="size-2 rounded-full bg-muted-foreground/40"></div>
        <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Session
        </h2>
      </div>
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card/50 px-6 py-8 text-center sm:px-10">
        <h3 className="text-lg font-semibold text-foreground">You are not signed in.</h3>
        <p className="mt-2 max-w-90 text-sm leading-relaxed text-muted-foreground">
          Nothing fancy. Just a quick demo of protected routes and the auth utilities in action.
        </p>
        <Button render={<Link to="/login" />} className="mt-6 w-fit" size="lg" nativeButton={false}>
          Log in
        </Button>
      </div>
    </section>
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
