import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, CopyIcon, ExternalLinkIcon, StarIcon } from "lucide-react";
import { Suspense, useState } from "react";

import { SignOutButton } from "#/components/sign-out-button.tsx";
import { ThemeToggle } from "#/components/theme-toggle.tsx";
import { Button } from "#/components/ui/button.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { useAuthSuspense } from "#/lib/auth/hooks.ts";

import { dependencies, devDependencies } from "../../../package.json";
import workspaceYaml from "../../../pnpm-workspace.yaml?raw";
import { formatGitHubStars } from "./format-github-stars";

/**
 * This is the intro component for Cove Stack, which you may delete after creating the project.
 * Happy coding!
 */
export function IntroPage() {
  return (
    <div className="min-h-svh bg-background text-foreground [--gold-ink:oklch(0.52_0.1_80)] [--gold:oklch(0.8_0.12_88)] selection:bg-(--gold) selection:text-black dark:[--gold-ink:#ebd27a] dark:[--gold:#ebd27a]">
      <style>{":root { --radius: 0rem; }"}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,var(--color-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-foreground)_1px,transparent_1px)] mask-[linear-gradient(to_bottom,black,transparent_70%)] bg-size-[3rem_3rem] opacity-[0.035]"
      />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <header className="flex h-20 items-center justify-between">
          <a href={REPO_URL} className="flex items-center gap-2.5">
            <img src="https://mugnavo.com/favicon-32x32.png" alt="" className="size-4" />
            <span className="text-lg font-semibold tracking-[-0.03em]">cove</span>
          </a>
          <div className="flex items-center gap-3">
            <HeaderStars />
            <ThemeToggle />
          </div>
        </header>

        <main className="border-x border-foreground/10">
          <Hero />
          <Features />
          <Suspense fallback={<div className="border-t border-foreground/10 p-10" />}>
            <Session />
          </Suspense>
          <Cleanup />
          <Closing />
        </main>

        <footer className="flex flex-col gap-4 border-t border-foreground/10 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Built and maintained by{" "}
            <a
              href="https://mugnavo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-(--gold)"
            >
              Mugnavo
            </a>
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <SiGithub className="size-4" />
            mugnavo/cove
          </a>
        </footer>
      </div>
    </div>
  );
}

const REPO_URL = "https://github.com/mugnavo/cove";
const CREATE_COMMAND = "pnpm create cove";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function Hero() {
  return (
    <section className="grid border-t border-foreground/10 lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col justify-between gap-14 p-6 py-14 sm:p-10 md:py-16">
        <div>
          <a
            href="https://github.com/mugnavo/cove/issues/96"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 flex w-fit items-center gap-2.5 border border-(--gold)/40 bg-(--gold)/10 px-3 py-1.5 text-sm transition-colors hover:border-(--gold) hover:bg-(--gold)/15"
          >
            <span aria-hidden="true" className="size-1.5 bg-(--gold)" />
            TanStarter is now Cove Stack.
            <ExternalLinkIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </a>
          <h1 className="max-w-[13ch] text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-light tracking-[-0.055em]">
            A minimal starter stack for TanStack Start.
          </h1>
          <p className="mt-7 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">
            The Cove Stack brings together the essentials for building type-safe web applications
            without the extra boilerplate.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CommandCopy />
          <GitHubLink />
        </div>
      </div>

      <SpecSheet />
    </section>
  );
}

function CommandCopy() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CREATE_COMMAND);
      setIsCopied(true);
      toast.add({ type: "success", description: "Command copied to clipboard." });
      setTimeout(() => setIsCopied(false), 4000);
    } catch {
      toast.add({ type: "error", description: "Failed to copy command." });
    }
  };

  return (
    <div className="flex h-12 w-fit items-center gap-4 bg-(--gold) pr-1.5 pl-4 font-mono text-sm text-black selection:bg-black! selection:text-(--gold)!">
      <span>
        <span className="mr-3 opacity-45 select-none">$</span>
        <span className="select-all">{CREATE_COMMAND}</span>
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command"
        title="Copy command"
        className="grid size-9 place-items-center transition-colors hover:bg-black/10"
      >
        {isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
    </div>
  );
}

function useRepoStars() {
  const { data } = useQuery({
    queryKey: ["github-repo-stars"],
    queryFn: ({ signal }) => fetchRepoStars({ signal }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
    enabled: typeof window !== "undefined",
  });

  const count = data ?? 1000;
  const suffix = data ? "" : "+";
  return {
    short: `${formatGitHubStars(count)}${suffix}`,
    label: `${count.toLocaleString()}${suffix} stars on GitHub`,
  };
}

function HeaderStars() {
  const stars = useRepoStars();

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={stars.label}
      title={stars.label}
      className="flex h-8 items-center gap-2 border border-foreground/15 px-3 text-muted-foreground transition-colors hover:border-(--gold) hover:text-foreground"
    >
      <SiGithub className="size-3.5" />
      <span className="font-mono text-xs">{stars.short}</span>
    </a>
  );
}

function GitHubLink() {
  const stars = useRepoStars();

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={stars.label}
      className="group flex h-12 w-fit items-stretch border border-foreground/20 text-sm transition-colors hover:border-(--gold)"
    >
      <span className="flex items-center gap-2 px-3.5">
        <SiGithub className="size-4" />
        View on GitHub
      </span>
      <span className="flex items-center gap-1.5 border-l border-foreground/20 px-3.5 font-mono transition-colors group-hover:border-(--gold)">
        <StarIcon
          aria-hidden="true"
          fill="currentColor"
          strokeWidth={0}
          className="size-3.5 text-(--gold)"
        />
        <span className="sr-only">GitHub stars:</span>
        {stars.short}
      </span>
    </a>
  );
}

async function fetchRepoStars({ signal }: { signal: AbortSignal | undefined }) {
  const response = await fetch("https://api.github.com/repos/mugnavo/cove", {
    signal,
    headers: { Accept: "application/vnd.github+json" },
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

const STACK = [
  {
    name: "TanStack Start",
    role: "Framework",
    href: "https://tanstack.com/start",
    pkg: "@tanstack/react-start",
  },
  {
    name: "TanStack Query",
    role: "Data",
    href: "https://tanstack.com/query",
    pkg: "@tanstack/react-query",
  },
  { name: "React", role: "UI", href: "https://react.dev", pkg: "react" },
  { name: "Tailwind CSS", role: "Styling", href: "https://tailwindcss.com", pkg: "tailwindcss" },
  { name: "shadcn/ui", role: "Components", href: "https://ui.shadcn.com", pkg: "shadcn" },
  { name: "Base UI", role: "Primitives", href: "https://base-ui.com", pkg: "@base-ui/react" },
  { name: "Drizzle ORM", role: "Database", href: "https://orm.drizzle.team", pkg: "drizzle-orm" },
  { name: "Better Auth", role: "Auth", href: "https://better-auth.com", pkg: "better-auth" },
  { name: "Vite+", role: "Toolchain", href: "https://viteplus.dev", pkg: "vite-plus" },
  { name: "Nitro", role: "Server", href: "https://nitro.build", pkg: "nitro" },
];

const PACKAGE_VERSIONS: Record<string, string> = { ...dependencies, ...devDependencies };

// Only pnpm's flat `catalog:` block is supported, which is all this template uses
const CATALOG_VERSIONS: Record<string, string> = Object.fromEntries(
  (workspaceYaml.match(/^catalog:\r?\n((?:(?:[ \t]+.*)?\r?\n)*)/m)?.[1] ?? "")
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/^\s+["']?([^"'\s]+?)["']?:\s*["']?([^"'\s#]+)/);
      return match ? [[match[1], match[2]]] : [];
    }),
);

function getVersion(pkg: string) {
  const version = PACKAGE_VERSIONS[pkg];
  return version?.startsWith("catalog:") ? CATALOG_VERSIONS[pkg] : version;
}

function SpecSheet() {
  return (
    <div className="relative border-t border-foreground/10 p-6 py-14 sm:p-10 md:py-16 lg:border-t-0 lg:border-l">
      <span aria-hidden="true" className="absolute -top-px left-0 h-3 w-px bg-(--gold) lg:hidden" />
      <div className="flex items-center justify-between gap-6">
        <Label>Spec</Label>
        <span className="font-mono text-xs text-muted-foreground">package.json</span>
      </div>
      <ul className="mt-10">
        {STACK.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid h-9 items-center gap-4 sm:grid-cols-[6.5rem_1fr]"
            >
              <span className="text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase max-sm:hidden">
                {item.role}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-[0.9375rem] whitespace-nowrap transition-colors group-hover:text-(--gold-ink)">
                  {item.name}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-foreground/10 transition-colors group-hover:bg-(--gold)"
                />
                <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {getVersion(item.pkg)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FEATURES = [
  {
    title: "Full-Stack Core",
    desc: "Build on a modern full-stack framework with TanStack Start, Router, and Vite.",
  },
  {
    title: "Only the Essentials",
    desc: "Drizzle ORM, Better Auth, shadcn/ui. Less boilerplate that you'll end up deleting anyway.",
  },
  {
    title: "End-to-end Type Safety",
    desc: "Effortless type safety powered by TanStack Router and Start server functions.",
  },
  {
    title: "Next-Gen Tooling",
    desc: "Build with Vite+, log with evlog, and manage environment variables with Varlock.",
  },
];

function Features() {
  return (
    <section className="grid gap-px border-t border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature, index) => (
        <div key={feature.title} className="relative bg-background p-6 pt-8 pb-12 sm:p-8 sm:pb-14">
          <span aria-hidden="true" className="absolute -top-px left-0 h-3 w-px bg-(--gold)" />
          <span className="font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-8 text-lg font-medium tracking-[-0.02em]">{feature.title}</h3>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {feature.desc}
          </p>
        </div>
      ))}
    </section>
  );
}

function Session() {
  const { user } = useAuthSuspense();

  return (
    <section className="grid grid-cols-1 border-t border-foreground/10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-6 p-6 py-12 sm:p-10">
        <Label>Session</Label>
        <h2 className="text-2xl font-light tracking-[-0.04em] wrap-break-word md:text-3xl">
          {user ? `Signed in as ${user.name || user.email}.` : "You are not signed in."}
        </h2>
        <p className="max-w-[44ch] leading-relaxed text-muted-foreground">
          Nothing fancy. Just a quick demo of protected routes and the auth utilities in action.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <Button render={<Link to="/app" />} nativeButton={false} size="lg">
                Go to /app
              </Button>
              <SignOutButton />
            </>
          ) : (
            <Button render={<Link to="/login" />} nativeButton={false} size="lg">
              Log in
            </Button>
          )}
        </div>
      </div>
      <div className="border-t border-foreground/10 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-3 font-mono text-xs text-muted-foreground sm:px-10">
          <span>useAuthSuspense()</span>
          <span className="tracking-[0.16em] uppercase">Read-only</span>
        </div>
        <pre className="max-h-80 overflow-auto p-6 font-mono text-xs leading-relaxed text-foreground/80 sm:px-10">
          {JSON.stringify(user ?? null, null, 2)}
        </pre>
      </div>
    </section>
  );
}

const CLEANUP_STEPS = [
  {
    path: "src/components/_DELETE_ME_intro-page/",
    note: "Delete it. It holds this page, its helpers, and the example unit test.",
  },
  {
    path: "e2e/_DELETE_ME_example-tests/",
    note: "Delete it. The Playwright config needs no change.",
  },
  {
    path: "src/routes/index.tsx",
    note: "Replace the starter homepage with your own.",
  },
];

function Cleanup() {
  return (
    <section className="border-t border-foreground/10 bg-[repeating-linear-gradient(-45deg,color-mix(in_oklab,var(--color-foreground)_7%,transparent)_0_1px,transparent_1px_8px)] p-3 sm:p-6">
      <div className="grid border border-dashed border-foreground/30 bg-background lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-6 p-6 sm:p-10">
          <p className="flex items-center gap-2.5 font-mono text-xs tracking-[0.16em] text-(--gold-ink) uppercase">
            <span aria-hidden="true" className="size-1.5 bg-(--gold)" />
            Getting started
          </p>
          <h2 className="text-2xl font-light tracking-[-0.04em] md:text-3xl">
            Just created a project from this stack?
          </h2>
          <p className="max-w-[44ch] leading-relaxed text-muted-foreground">
            This page and its demo ship with the starter. Clear them out when you're ready to build
            your own.
          </p>
          <p className="max-w-[44ch] text-sm leading-relaxed text-muted-foreground lg:mt-auto lg:pt-6">
            The testing setup is intentionally lightweight. For short-lived prototypes, it can be
            safely ignored or removed.
          </p>
        </div>
        <ol className="border-t border-dashed border-foreground/30 lg:border-t-0 lg:border-l">
          {CLEANUP_STEPS.map((step, index) => (
            <li
              key={step.path}
              className="border-dashed border-foreground/30 p-6 not-first:border-t sm:px-10 sm:py-8"
            >
              <span className="font-mono text-xs text-muted-foreground">Step {index + 1}</span>
              <code className="mt-4 block font-mono text-sm wrap-anywhere text-(--gold-ink)">
                {step.path}
              </code>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {step.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="grid gap-10 border-t border-foreground/10 p-6 py-20 sm:p-10 md:py-28 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
      <p className="max-w-[12ch] text-[clamp(2.25rem,5vw,4.5rem)] leading-none font-light tracking-[-0.055em]">
        Clone it. Delete what you don't need.
      </p>
      <div className="flex flex-col gap-3">
        <CommandCopy />
        <GitHubLink />
      </div>
    </section>
  );
}
