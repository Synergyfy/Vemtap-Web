/**
 * Stable identity for a deal.
 *
 * Claim state used to live behind a single `claimed` flag in `AuthContext`, so
 * the very first claim flipped it for every surface: every card in the deal
 * lists turned into "Claimed", the deal detail swapped its CTA for
 * "Claimed — View in Wallet", and `startClaim()` short-circuited straight to
 * the wallet. Claiming one deal therefore locked the customer out of claiming
 * any other deal, on both mobile and desktop.
 *
 * Every deal now carries an id so claim state — and the recorded claim — is
 * tracked per deal instead of per customer.
 */
export interface DealIdentity {
  /** Stable, non-displayed key used to match claim state across surfaces. */
  id: string;
  /** Title as displayed to the customer (stored on the claim record). */
  title?: string;
  /** Business the deal belongs to (stored on the claim record). */
  business?: string;
  /** Card / hero image (stored on the claim record). */
  image?: string;
}

/**
 * The deal the static deal-detail screens render. It is the fallback whenever
 * a surface opens the detail without naming a deal (deep link, saved items,
 * how-to-claim, terms, …).
 *
 * Backend gap: deal detail is not fetched per id yet, so the detail layout
 * keeps rendering this one deal's copy.
 */
export const DEFAULT_DEAL: DealIdentity = {
  id: 'featured-local-deal',
  title: 'Featured Local Deal',
  business: 'Local dining partner',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNsQYzlQAh9oju3O9Pp7b2OqE4Q1w9NTs0_fLXsac8VzxG06oD2NcwkkT8F3q8guxDTRfKEplRfmk3C-S9j62uAZ-X3SG4rkR3dDcngRx8sOpiwe5UeKWYk-lyy81904uUukw2Do3wMAOVj0Vg_7dv90NC6KTvhmoR0HFL6aPR56jOI4gZrX7w67mzbdQcgA44gm5lNRoAe6oGg6V1rNX8nBhjhfYCCBlRIssV7QqZImEOkPqpYnQDw',
};

/** Lower-cases a title into a stable, url-safe key. */
export const dealKey = (title?: string | null): string => {
  const key = (title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return key || 'deal';
};

/** Identity for a deal a card only knows by the title it displays. */
export const dealFromTitle = (
  title: string,
  extra?: { business?: string; image?: string },
): DealIdentity => ({
  id: dealKey(title),
  title,
  ...extra,
});

/** Opens the deal detail for a specific deal; `undefined` = the default deal. */
export type DealLauncher = (deal?: DealIdentity) => void;

/**
 * Starts a claim for a deal. `onClaimed` runs once the customer confirms the
 * claim; `deal` keeps the claim — and the resulting "Claimed" state — tied to
 * the card that launched it.
 */
export type ClaimLauncher = (onClaimed?: () => void, deal?: DealIdentity) => void;
