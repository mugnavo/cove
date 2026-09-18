---
name: sync-template
description: Compare or sync projects with upstream changes from the Cove Stack template while preserving project-specific behavior and configuration. Use for Cove Stack upgrades, starter syncs, or upstream-change reviews.
---

# Sync a project with Cove Stack

Integrate relevant changes from the project's Cove Stack template while preserving the project's own behavior.

For a comparison-only request, inspect and report without applying changes. For a sync request, prepare and validate a reviewable update. Follow existing user authorization for commits, pushes, pull requests, and deployment.

## Establish the project state

- Confirm the destination repository and its Cove Stack provenance.
- Read `.cove.jsonc` when present. It may contain:

  ```jsonc
  {
    // Used by the sync-template skill to track this project's
    // Cove Stack source and applied template revision.
    "source": "https://github.com/mugnavo/cove",
    "revision": "<exact upstream commit>",
    "createdAt": "<ISO 8601 creation time>",
    "lastSyncedAt": "<ISO 8601 successful sync time>"
  }
  ```

  `source` identifies the template repository. `revision` is initially the downloaded commit and later the newest upstream commit fully reconciled with the project. `createdAt` is immutable and may be absent. `lastSyncedAt` is absent until the first completed sync.
- Read its current `AGENTS.md`, relevant project guidance, package scripts, environment schema, and previous sync records.
- Record the starting commit (`PROJECT_START`), branch, staged and unstaged changes, and untracked files.
- Use a dedicated sync branch following the repository's naming conventions.
- Preserve unrelated work. With a dirty checkout, prefer an isolated worktree from the relevant committed state and explain which uncommitted changes it excludes. If the update depends on those changes, resolve that dependency before integrating.
- Do not silently stash, commit, discard, or copy secret-bearing files to obtain a clean checkout.
- If a merge or rebase is already in progress, identify its purpose before modifying that state.
- Establish relevant baseline check results so existing failures can be distinguished from regressions.

## Resolve the upstream target

Resolve `TEMPLATE_SOURCE` from an explicit user choice, `.cove.jsonc`, previous sync records, or reliable generation and history evidence. Supported Cove Stack sources are:

- `https://github.com/mugnavo/cove`
- `https://github.com/mugnavo/cove-monorepo`

Workspace structure is supporting evidence, not proof of provenance. Ask rather than guess when the source remains ambiguous. Do not rewrite a recorded source unless correcting it is part of the requested work and the evidence is clear.

Discover the canonical repository's default branch:

```sh
git ls-remote --symref "$TEMPLATE_SOURCE" HEAD
```

An explicitly requested upstream branch, tag, or commit takes precedence.

Verify a remote's URL before using it. Do not assume a remote named `upstream` points to `TEMPLATE_SOURCE`, and do not repoint an existing remote or the project's `origin`.

Fetch the verified ref and immediately resolve its immutable commit as `TARGET`. Record the source URL, ref, SHA, and fetch date. If using `FETCH_HEAD`, resolve it before another fetch replaces it.

If remote verification is unavailable, identify any inspected local revision as cached. Do not claim it is the latest upstream version.

## Establish the comparison base

Projects created from a GitHub template or starter CLI may not share Git history with Cove Stack. Check the actual history rather than assuming the project is a fork.

Look for:

- A real Git merge base.
- A previously recorded upstream revision, including `.cove.jsonc`'s `revision`.
- Generation metadata or an identifiable initial starter snapshot.
- Earlier sync commits and records of intentionally omitted changes.

Before using `.cove.jsonc`'s `revision` as `BASE`, verify that it identifies a commit from `source`. Treat `createdAt` and `lastSyncedAt` only as context; timestamps and dependency versions do not establish a reliable base. Check for shallow or incomplete history before concluding that no common ancestor exists.

When a verified comparison base (`BASE`) exists, inspect the upstream delta:

```sh
git log --oneline "$BASE..$TARGET"
git diff --stat "$BASE" "$TARGET"
git diff --name-status -M "$BASE" "$TARGET"
```

Review renames, deletions, and the intent of relevant commits as well as file additions.

If no reliable base exists, compare the initial project snapshot and current implementation with the target by concern. Document the uncertainty. Do not invent a base or manufacture shared history.

If the target is already integrated, review previously omitted changes before reporting that no update is needed. An older requested target requires an explicit rollback strategy; merging it does not undo newer changes.

## Classify the changes

Determine ownership from file contents and local history, not directory names alone.

| Concern | Treatment |
| --- | --- |
| Application routes, features, content, branding, and assets | Preserve project behavior; adapt only where upstream changes require it. |
| Framework setup, routing infrastructure, server boundaries, and shared utilities | Integrate relevant upstream fixes with local adaptations. |
| Authentication and authorization | Preserve the project's providers, roles, access rules, account flows, and optional-feature behavior while adapting API changes. |
| Database schema and migrations | Preserve application tables, fields, data, and applied migration history. |
| UI components and styles | Review local modifications before accepting upstream changes. Preserve the application's design and accessibility behavior. |
| Dependencies, scripts, workspace configuration, and lockfiles | Reconcile compatible changes together, retaining project-specific requirements. |
| Environment and deployment configuration | Preserve deployment identities, services, startup behavior, and environment contracts. |
| Instructions and documentation | Incorporate relevant guidance without replacing project-specific instructions with starter defaults. |

Current user instructions and project guidance take precedence over historical examples.

## Integrate the update

Choose the strategy that fits the actual history and previous sync process.

### Shared history

On a clean, dedicated sync branch, prepare a normal merge:

```sh
git merge --no-ff --no-commit "$TARGET"
```

`--no-ff` keeps a fast-forward update reviewable before committing.

Resolve conflicts by intent. Inspect files that merged cleanly too; an automatic merge can still overwrite application behavior or introduce unwanted defaults.

Continue an established selective-sync process when that is more appropriate than merging the entire upstream tree.

### Unrelated history or selective updates

Apply the upstream delta from the verified base to the target rather than replacing the project with the target snapshot.

For reviewed paths, a patch generated with `git diff --binary --full-index` can support `git apply --3way` when the required base blobs are available and the index/worktree are clean. Handle moved files, deletions, and semantic changes deliberately.

When the base is unknown, reconcile relevant changes manually by concern.

Do not use a blanket copy, `rsync --delete`, hard reset, automatic “ours/theirs” resolution, or `--allow-unrelated-histories` as a shortcut. Do not create an ancestry-only merge that represents unapplied changes as integrated.

### Preserve adaptations during either strategy

- Apply upstream fixes to the project's current file locations. Do not recreate old directories or parallel implementations when the project has reorganized starter code.
- Preserve existing feature choices. New upstream functionality does not automatically belong in the application.
- Keep project-specific dependencies and scripts. Resolve related framework versions, workspace catalogs, overrides, and peer requirements together.
- Do not downgrade a newer local dependency solely to match upstream. Check compatibility and document intentional divergence.
- Keep broad dependency upgrades separate unless the user requested them.
- Review lifecycle scripts before installing dependencies. Preserve required preparation, code generation, and container build behavior.
- Reconcile manifests first, then regenerate the lockfile with the pinned package manager. Do not replace the lockfile wholesale.
- Regenerate route trees, environment types, and affected schemas through the project's tools. Review the resulting diffs.
- Preserve applied migration history. Generate incremental migrations when necessary and validate them against a disposable local database.
- Use the environment schema and sanitized examples to understand configuration. Never read local secret-bearing env files or invent credentials to make validation pass.

## Validate the result

Use the destination project's current commands and testing guidance.

- Install dependencies with the pinned toolchain after reviewing manifest and lifecycle changes.
- Run lint/type checks and the narrowest relevant tests.
- In projects retaining Cove Stack's Vite+ scripts, `vpr lint` covers linting and type checking, `vpr test` runs unit tests, and `vpr test:e2e` runs browser tests. Verify the current scripts before relying on these names.
- If browser behavior changed, run the affected browser tests. When their configuration owns the production build and server lifecycle, do not run a duplicate build first.
- Validate environment configuration using the project's current tooling without exposing values.
- Check affected routes, authentication flows, navigation, forms, metadata, and responsive behavior against the baseline.
- Exercise supported optional-feature states when their integration changes.
- Follow the project's test-port convention. Do not stop unrelated servers to free a port.
- Use disposable local resources for database and integration checks. Do not trigger real external side effects or run production migrations during validation.
- For deployment changes, inspect and verify the affected build/startup path. Entrypoints may apply migrations.

Review the complete result against `PROJECT_START`, including staged, unstaged, and newly introduced files:

```sh
git diff --check
git diff --cached --check
git ls-files -u
```

Check for unresolved conflicts, duplicated implementations, restored demo content, overwritten configuration, and unexpected generated files.

Separate pre-existing failures, introduced regressions, and checks blocked by the environment. Resolve introduced failures before calling the update ready.

## Record and deliver

Update an existing sync record, or create `docs/upstream-sync.md` if none exists. Record:

- Canonical upstream URL, ref, immutable target SHA, and date.
- Project starting commit, comparison base, and evidence for that base.
- Integration strategy and adopted changes.
- Preserved customizations, intentional deviations, and outstanding omissions.
- Validation results and remaining actions.
- Whether the update is prepared, committed, or partial.

Keep previous entries so future syncs can reconsider omissions.

After every upstream change through `TARGET` has been adopted, adapted, or explicitly recorded as not applicable, and introduced regressions are resolved, update `.cove.jsonc` as part of the prepared sync:

- Set `revision` to `TARGET`.
- Set `lastSyncedAt` to the current ISO 8601 timestamp.
- Preserve `source`, `createdAt`, unknown fields, and comments.

Do not update these fields for comparison-only work, a target with deferred or unresolved changes, or a failed validation. Do not invent a missing `createdAt` or change it during a sync.

A recorded target is not proof that all changes were integrated. Do not advance `revision` past unresolved work or claim a completed merge before its merge commit exists.

Deliver the branch or worktree, exact upstream target, practical changes, validation results, and remaining work. A dependency-only update is not a full starter sync. A local sync request does not itself authorize publishing, production migrations, or deployment.
