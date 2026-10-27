# Project Rules

## Repos and branches

- **Web:** work and commit only on `logic-fix`.
- **Backend:** keep `local/area-integration` checked out, because the local server runs from it. Create each backend change on its own `feat/<name>` branch from `origin/dev`, then merge it into `local/area-integration` to test. Never commit directly to `dev`, `main` or `local/area-integration`; it only gets merges. Never touch `tobee`.

## Git — Branch Safety (CRITICAL)

- **Never push to the `tobee` branch.** The current working branch is `tobee`; treat it as read-only for remote operations.
- **Never push to or merge anything into any remote or local branch named `tobee`.** This applies to:
  - `git push` (direct or via PR/merge)
  - `git merge` into `tobee` (local or remote)
- **Always ask for explicit permission before pushing anything to remote**, regardless of the branch. No exceptions.
- Do not force-push, delete, or rename the `tobee` branch under any circumstances.
- If a task seems to require updating `tobee`, stop and ask the user for instructions instead.
