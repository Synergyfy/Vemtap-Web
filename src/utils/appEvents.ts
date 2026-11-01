/**
 * App-wide window events.
 *
 * The router lives in `App`, but many headers (mobile/tablet dashboards, the
 * POS shell, the collapsed rails) render several levels below it and never
 * receive a nav callback, so they announce their intent through these events.
 */

/** Fired by the shared account menu so the app router can route to sign-in. */
export const SIGN_OUT_EVENT = 'vemtap:sign-out';

/** Fired by the collapsed business rail while the app is in POS mode. */
export const BUSINESS_NAV_EVENT = 'vemtap:business-nav';

/**
 * Fired by the mobile/tablet dashboard header account menu and notification
 * bell. Detail is one of `MobileAccountNavKey`.
 */
export const MOBILE_ACCOUNT_NAV_EVENT = 'vemtap:mobile-account-nav';

export type MobileAccountNavKey = 'dashboard' | 'notifications' | 'settings';

/**
 * Fired by the global search (desktop navbar, mobile home) when a result is picked.
 * The app router opens the deal, the business page, or the Deals page with the term.
 */
export const SEARCH_PICK_EVENT = 'vemtap:search-pick';

export type SearchPick =
  | { kind: 'deal'; deal: { id: string; title?: string; business?: string; location?: string; price?: number; oldPrice?: number; discountLabel?: string; image?: string } }
  | { kind: 'business'; code: string; id?: string; name?: string }
  | { kind: 'all-deals'; query: string };

export const pickSearchResult = (pick: SearchPick) =>
  window.dispatchEvent(new CustomEvent<SearchPick>(SEARCH_PICK_EVENT, { detail: pick }));
