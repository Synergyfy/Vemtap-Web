/**
 * Deals this account opened on this device. The API has no viewing history, so
 * this list lives in the browser, per account, and only ever holds real deals.
 */
export interface RecentDeal {
  id: string;
  title: string;
  merchant: string;
  image?: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
}

const MAX_DEALS = 12;
const keyFor = (userId: string) => `vemtap_recent_deals_${userId}`;

export function readRecentDeals(userId: string | undefined): RecentDeal[] {
  if (!userId) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(keyFor(userId)) ?? '[]');
    return Array.isArray(parsed) ? (parsed as RecentDeal[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentDeal(userId: string | undefined, deal: RecentDeal): void {
  if (!userId) return;
  const next = [deal, ...readRecentDeals(userId).filter((entry) => entry.id !== deal.id)].slice(0, MAX_DEALS);
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    // storage unavailable; the history just isn't kept
  }
}

export function clearRecentDeals(userId: string | undefined): void {
  if (!userId) return;
  try {
    window.localStorage.removeItem(keyFor(userId));
  } catch {
    // storage unavailable; nothing to clear
  }
}
