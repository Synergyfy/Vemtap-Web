/**
 * Host-relative link to a business's public storefront profile.
 *
 * Business codes are resolved by `resolveBusinessPath`, which accepts both
 * `/b/<code>` and `/business/<code>`. Building the link from the current origin
 * means a merchant looking at the local app gets a link that opens the local
 * storefront, while production gets the production one.
 */

const CODE_IN_PATH = /\/b\/([^/?#]+)/;

/**
 * @param code The business's `uniqueCode` (or its short QR URL as a fallback).
 * @returns An absolute URL on the current host, or '' when the code is unknown.
 */
export function businessProfileUrl(code?: string | null): string {
  if (!code || typeof window === 'undefined') return '';

  let resolved = code.trim();
  const shortLink = CODE_IN_PATH.exec(resolved);
  if (shortLink) {
    try {
      resolved = decodeURIComponent(shortLink[1]);
    } catch {
      resolved = shortLink[1];
    }
  }

  return resolved ? `${window.location.origin}/b/${encodeURIComponent(resolved)}` : '';
}
