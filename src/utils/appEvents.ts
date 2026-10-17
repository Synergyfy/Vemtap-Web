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
