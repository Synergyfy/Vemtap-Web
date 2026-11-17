# Project Rules

## Desktop + Mobile view parity on every fix (hard rule)

Many Vemtap-Web pages have **separate code for the desktop view and the mobile view**
(e.g. `src/scripts/desktop/DesktopHomeScreen.tsx` vs `src/scripts/HomeScreen.tsx`).

- Every fix must be applied to **both the desktop and mobile view** of the page.
- Always check both views for the same issue, even if only one was reported.
- A fix is not done until it works fully in **both** views.
- Both views must be fully functional using **live data** from the real backend API.
- **No mock data in live mode** — no hardcoded, placeholder, stub, or fixture data may render
  when running against the live API. Any mocks must be strictly gated to dev/mock mode.
- When reporting completion, state what was changed and verified in the desktop and mobile view separately.

## Readable pop-ups (hard rule)

Every toast, pop-up, modal, sheet and badge must have clearly readable text on its background.

- Only use color classes whose token exists in `Vemtap-Web/tailwind.config.js` — a misspelled token
  renders no color at all (e.g. `text-on-inverse-surface` silently left dark text on dark toasts).
- Dark pop-ups/toasts: `bg-inverse-surface` (or `bg-on-surface`) with `text-inverse-on-surface`.
- When adding or changing any pop-up, check its text/background contrast in both desktop and mobile views.

## Integrate, don't recreate (hard rule)

Never recreate anything that already exists — no new page, screen, sheet, modal, drawer, dialog,
card or any other UI component to replace an existing one, and no rewriting an existing one with a
new design. Fix the existing one in place: keep its layout and design, and replace its mock data
with live API data so it works end to end. Shared data hooks/services are fine; parallel or
redesigned UI is not.

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
