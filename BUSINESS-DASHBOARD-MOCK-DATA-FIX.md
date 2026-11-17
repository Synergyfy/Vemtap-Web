# Task: Remove mock data from the business dashboard shell (desktop + mobile)

Hand this whole file to the agent doing the work.

## Goal
Every business-shell screen must render live API data when an API is configured
(`hasApiConfig()` is true). Hardcoded businesses, branches, prices, counts, names,
images and dates must never render in live mode. Sample data may stay only when it
is strictly gated to no-API (demo) mode.

## Rules (read these first)
- Read and follow `Vemtap-Full-Stack/CLAUDE.md` and `Vemtap-Web/AGENTS.md`.
- Every fix must work in BOTH the desktop and the mobile view of the page, using live
  data from the real backend. Fix both, even if only one is listed.
- Integrate, don't recreate: no new pages, screens, sheets or redesigns. Keep each
  screen's layout and classes, and swap mock values for live ones. Shared data
  hooks and services are fine.
- If an endpoint is missing, don't invent data or UI:
  - Gate the sample behind demo mode, or show an honest empty state ("—", "No data
    yet").
  - Record the gap under "Backend gaps" in your report.
- Use the existing business hooks in `src/hooks/business/*` and services in
  `src/services/*`. The endpoint lists are in `business-dashboard-api-list.md` and
  `missing-endpoint.md`.
- Readable pop-ups: only use colour tokens that exist in `tailwind.config.js`. Dark
  pop-ups use `bg-inverse-surface` with `text-inverse-on-surface`.
- No headless browsers. Use the Claude in Chrome extension if connected; otherwise
  verify with code, typecheck and direct API calls, and ask the user to check the UI.
- No AI attribution in commits or PRs, ever.
- Web work is on branch `logic`. Another session may have uncommitted changes in this
  repo: don't revert them, and stage only your own files. Ask before pushing.
- Any backend change goes on its own `feat/` branch from `origin/dev` in
  `../Vemtap/apps/backend`. Ask before merging or pushing.
- `dist/` is tracked, so build to a temp dir: `npx vite build --outDir <temp dir>`.
- Treat the demo-mode pattern the repo already uses as correct, for example
  `live ? liveRows : MOCK_ROWS`, `{!live && (...)}` and `v(liveValue, demoValue)`.
  Don't "fix" mock data that is already gated like that.

## Confirmed problems: mock data that renders in live mode

### 1. Mobile split bill: fully mock
- **File:** `src/scripts/BusinessSplitBillScreen.tsx`, route `pos-split-bill`, mobile only.
- **Problem:** the screen uses no hooks at all. It hardcodes "Urban Grill & Bistro, Wuse
  II", the totals "₦29,669 / ₦31,768 (w/ 15% Table Tip)", "3 Items + 7.5% State VAT",
  and the `TIPS`, `SEGS` and `DINERS` constants.
- **Fix:** do what desktop already does. `src/scripts/desktop/DesktopSplitBillScreen.tsx`
  splits the live POS cart with `usePosSettings()` and `computeTotals(...)`. Reuse that
  logic or a shared hook, and keep the mobile markup.

### 2. Mobile branch comparison: fully mock
- **File:** `src/scripts/BusinessBranchComparisonScreen.tsx`, route `analytics-branches`.
- **Problem:** the screen uses no hooks. `METRICS`, `BRANCH_BARS` and `SCORECARDS` are
  hardcoded, including "54% of Network Gross".
- **Fix:** do what desktop already does. `src/scripts/desktop/DesktopAnalyticsLocationsScreen.tsx`
  is live: it gates its demo segments and branches. Use the same analytics hook
  (`useBusinessAnalytics` with the branches/locations domain) and map it into the
  existing mobile cards.

### 3. Desktop deal locations step: fully mock
- **File:** `src/scripts/desktop/DesktopDealCreateLocationsScreen.tsx`, route
  `deal-create-locations`.
- **Problem:** the screen uses no hooks. It hardcodes the prices "₦9,600" and "₦10,800",
  "Standard MSRP -20%", a Lagos surcharge, and the branch keys `wuse`, `vi` and `garki`
  in its state.
- **Fix:**
  - Use the business's real branches (`useBranchesAndTeam` / `useLiveDealBranch`) and
    the deal or item being created.
  - Compare it with `src/scripts/desktop/DesktopDealLocationPricingScreen.tsx` and
    `src/hooks/business/useLiveDealBranch.ts`, which are already live.
  - Find the mobile equivalent of this step and check it too.

### 4. Desktop orders: branch filter is hardcoded
- **File:** `src/scripts/desktop/DesktopBusinessOrdersScreen.tsx`, route
  `business-orders`, around lines 215–260.
- **Problem:** the branch dropdown hardcodes `wuse-2` ("Wuse II Flagship"), `maitama`
  ("Maitama Heights") and "All Branches (Abuja)". Its filter compares `o.branchId` to
  those strings, so picking a branch empties the list in live mode.
- **Fix:** build the options from the business's real branches, filter on real branch
  ids, and label "All branches" without a city. Check the mobile orders screen for the
  same problem.

### 5. Desktop More page: profile deck is hardcoded
- **File:** `src/scripts/desktop/DesktopBusinessMoreScreen.tsx`, route `business-more`.
- **Problem:** the screen has no live data at all. It hardcodes the "Urban Grill &
  Bistro" name and logo, `#VG-80492`, "Growth Plan", and the billing row "Growth Tier ·
  ₦5,000/mo · Next renewal Nov 14".
- **Fix:** the mobile `src/scripts/BusinessMoreScreen.tsx` already does this live with
  `useMyBusiness()` and `useActiveSubscription()`, for the name, logo, unique code,
  plan and branch. Mirror that on desktop.

### 6. Mobile More page: billing row is hardcoded
- **File:** `src/scripts/BusinessMoreScreen.tsx`, line about 143.
- **Problem:** the "Subscription & Billing" row always says "Growth Tier · ₦5,000/mo ·
  Next renewal Nov 14".
- **Fix:** build the text from `useActiveSubscription()`: plan name, price and the next
  renewal or trial end. If there's no plan, say "No plan yet".

### 7. Subscription screens: metric cards are hardcoded
These screens are rendered from the subscription center. Find where they're routed
first.
- **`src/scripts/desktop/DesktopSubscriptionEndingScreen.tsx`:**
  - **Problem:** `METRIC_CARDS` ("12.4k" impressions, "318" claims, "42%" returning)
    renders whether or not the API is live.
  - **Fix:** use `useOverviewData` / `useBusinessAnalytics` for the trial period, or
    gate the cards to demo mode.
- **`src/scripts/desktop/DesktopSubscriptionTrialActiveScreen.tsx`:**
  - **Problem:** `WEEKLY_FOOTFALL` and "128 scans this week" (around lines 240–256) are
    hardcoded.
  - **Fix:** use the same live sources, or gate them.
- Check the mobile subscription equivalents too.

### 8. Default customer name "Michael James"
- **Problem:** `src/App.tsx` sets `useState('Michael James')` for `hubCustomerName`
  (line about 2174) and `posDossierCustomer` (line about 1276).
  `src/scripts/BusinessCustomerProfileScreen.tsx` also defaults `customerName` to
  "Michael James".
- **Fix:** in live mode, never show a sample customer. Start these as empty or null,
  and show a loading or empty state until a real customer is chosen.

### 9. POS station ID is hardcoded
- **File:** `src/scripts/desktop/PosTerminalChrome.tsx`, line about 189.
- **Problem:** it always shows "Station ID: POS-NG-ABJ-004".
- **Fix:** use the open till or terminal from `usePos` / POS settings, or hide it when
  there isn't one. Check the mobile POS header for the same thing.

### 10. Onboarding prefills "Urban Grill & Bistro"
- **Files:** `src/scripts/BusinessOnboardingScreen.tsx` (line about 92) and
  `src/scripts/desktop/DesktopBusinessOnboardingScreen.tsx` (line about 175).
- **Problem:** the sample business, including phone "+234 803 555 9821", is the
  fallback branch of a ternary.
- **Fix:** confirm that branch can only run in demo mode. If a live user can reach it,
  start the form empty, or prefill from `useMyBusiness` / `useOnboardingSync`.

### 11. Auto-import deal steps: hardcoded branches and stock copy
- **Files:** `src/scripts/BusinessDealAutoImportScreen.tsx` (no hooks) and
  `src/scripts/desktop/DesktopDealAutoImportScreen.tsx`. Both are used from the
  onboarding screens.
- **Problems:**
  - `BRANCH_OPTIONS` and `OUTLET_BRANCHES` are fixed branch lists.
  - `DEFAULT_TERMS`, "Lunch Hours Only (12-5pm)" and "App alerts when 80% claimed"
    are fixed.
- **Fix:** use the business's real branches, and the item or deal data the import came
  from. Keep the defaults only where they're genuine editable form defaults, not
  presented as facts.

### 12. Pre-signup business intro: fake stats and testimonial (lower priority)
- **Files:** `src/scripts/BusinessIntroScreen.tsx` and
  `src/scripts/desktop/DesktopBusinessIntroScreen.tsx`.
- **Problem:** they show "+18% from last weekend", "Plot 42, Apo District…", "Active in
  Apo", a fabricated quote from "Amara K. • Founder, Bloom Wellness & Cafe", and a
  stock storefront image.
- **Fix:** this is marketing copy, but it presents invented results as real. Ask the
  user whether to replace it with neutral copy, or show real platform figures from
  `GET /public/stats`.

## Verify, then fix if needed
I couldn't confirm these were safe. Each uses sample data near live code, so check
whether a live user can reach the sample, on both views:
- **`BusinessCatalogScreen.tsx`:** `useState(SEED_ITEMS)`. Is the screen routed in
  live mode, and does live data replace the seed?
- **`BusinessBranchesScreen.tsx`:** `SEED_BRANCHES`. Live uses `liveBranches` (line
  about 90). Confirm the seed never mixes in.
- **`BusinessLocationsScreen.tsx`:** the hardcoded "Maitama Flagship" location card
  (lines about 36–69). Confirm it's gated.
- **`desktop/DesktopStaffDirectoryScreen.tsx`:** the named sample staff (`showJohn`,
  `showAmara`, `showTunde`, `showKemi`) are gated with `!live`. Confirm
  `SAFEGUARDS` and the static policy text are honest.
- **`desktop/DesktopDealsWorkspaceScreen.tsx`:** confirm `DEAL_STATS` and
  `WORKSPACE_DEALS` are only used in demo mode, including the CSV export (line about 449).
- **`desktop/DesktopBusinessCatalogHubScreen.tsx`:** `ROWS` and `SERVICES_ROWS` seed
  the sync-switch state (line about 859). Confirm nothing sample renders in live mode.
- **`desktop/DesktopAnalyticsBusinessScreen.tsx`:** `buildKpis`, `CHART_BASE`,
  `CHANNEL_BASE` and `HEAT_DATA` (line about 890). Confirm every one of them is only
  used in the `!live` branch.
- **`BusinessAnalyticsScreen.tsx` (mobile):**
  - The heat grid and the "Recommended: Schedule +2 floor staff on Friday 5:30 PM"
    text (line about 874) are gated.
  - Check every other mock constant there, including `TOP_ITEMS`, `SEGMENTS` and
    `PATRONS`.
- **`desktop/DesktopBoostWalletScreen.tsx` and `BusinessBoostWalletScreen.tsx`:** the
  print and CSV exports contain "Gourmet Bites Bistro", a TIN and a VAT archive.
  Confirm every one is behind `live ? … : …`.
- **POS offline buffers:** `desktop/DesktopPosBufferScreen.tsx` and
  `BusinessPosOfflineBufferScreen.tsx` (`QUEUED_TXNS`, line about 123). Confirm the
  real offline queue (`PosOfflineContext`) is used in live mode.
- **`desktop/DesktopBusinessCustomersScreen.tsx`:** confirm `CONTACT_AVATAR` (a stock
  photo) isn't shown for real customers without a photo. Use initials or the
  repo's neutral `NO_IMAGE` instead.
- **`BusinessCustomersScreen.tsx` (mobile):** `seededRows` from `CUSTOMERS` (line about
  359) is concatenated into the list. Confirm it's empty in live mode.
- **Message sub-views:** `desktop/DesktopBusinessMessages{Booking,Deal,Compose,Search}Screen.tsx`
  are fully mock. `DesktopBusinessMessagesWorkspaceScreen` returns the live order-context
  screen when `hasApiConfig()` is true, so they should be demo-only. Confirm no route
  reaches them directly in live mode.

## Already correct: don't change
These were checked and are gated properly. Their sample data only shows with no API:
- **Kitchen ticket items:** `DesktopPosKitchenScreen`, `BusinessPosKitchenStreamScreen`
  (`TICKET_ITEMS` inside `{!live && …}`).
- **Mobile POS orders:** `BusinessPosOrdersScreen` sample tickets.
- **Desktop POS orders:** the `DesktopBusinessPosOrdersScreen` shift Z-report (live
  closes the real register).
- **POS ledger:** `DesktopPosLedgerScreen` stats.
- **POS home and transaction detail:** `DesktopPosHomeScreen`,
  `DesktopPosTransactionDetailScreen` (`v(live, demo)`).
- **Deal analytics:** `DesktopDealAnalyticsScreen` branch and terminal cards.
- **Branch pricing:** `DesktopBusinessBranchPricingScreen` sample branches.
- **Deal Studio step 3:** `DesktopDealStudioStep3Screen` heatmap and reach figures.
- **Analytics:** `AnalyticsCustomersScreen` metrics, growth and touchpoints.
- **Business overview:** `BusinessOverviewScreen` / `DesktopBusinessOverviewScreen` recent orders.
- **Loyalty:** `BusinessLoyaltyScreen` earning rules (live uses `useLoyaltyRules`),
  `DesktopLoyaltyRewardsScreen` cards and audit rows.
- **Help & support:** `DesktopBusinessHelpSupportScreen` tickets (live uses
  `supportService.tickets`).

## Not routed: leave alone unless the user asks
These files aren't imported anywhere:
- `BusinessBoostScreen.tsx`, `BusinessCreateDealScreen.tsx`, `BusinessComingSoonScreen.tsx`
- `desktop/DesktopBusinessOperationsHubScreen.tsx`, `desktop/DesktopBusinessDealsScreen.tsx`,
  `desktop/DesktopBusinessManagementHubScreen.tsx`
- `desktop/DesktopBusinessMessagesScreen.tsx`, `desktop/DesktopBusinessMessagesSmsScreen.tsx`,
  `desktop/DesktopBusinessMessagesEmailScreen.tsx`

## How this list was made
- An automated scan of every business-shell screen in `src/scripts` and
  `src/scripts/desktop` looked for hardcoded naira amounts, sample business, person
  and place names, stock images, and data constants rendered outside a live gate.
- Each item above was then read by hand.
- The scan is heuristic, so before you finish, sweep each screen you touch for
  anything that still renders sample data in live mode. Search for `₦` followed by
  digits, "Wuse", "Maitama", "Apo", "Urban Grill", `lh3.googleusercontent`, `unsplash`,
  and ALL_CAPS data constants.

## Done means
- Every confirmed item is fixed in both views, and every "verify" item is either
  confirmed safe or fixed.
- `npx tsc --noEmit -p .` passes, and a build to a temp dir passes.
- **Report:** per screen, what changed in desktop and in mobile separately; how you
  verified it (API calls made, UI checked or not); and a "Backend gaps" list for
  anything left as an empty state because an endpoint doesn't exist.
- **Commit:** only your own files, with no AI attribution. Don't push without asking.
