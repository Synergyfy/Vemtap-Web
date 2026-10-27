import { businessCustomersService, type CustomerCard, type CustomerDossier, type CustomersQuery } from '../services/businessCustomersService';
import { formatNaira, parsePrice } from '../utils/format';

/**
 * Display values for live customers, shared by the customer screens so each
 * one maps a real customer into its own row shape the same way.
 */

export const customerName = (card: Pick<CustomerCard, 'name' | 'phone' | 'email'>) =>
  card.name?.trim() || card.phone || card.email || 'Customer';

export const customerFirstName = (card: Pick<CustomerCard, 'name' | 'phone' | 'email'>) =>
  customerName(card).split(/\s+/)[0];

export const customerContact = (card: CustomerCard) => card.phone || card.email || '—';

/** "#VEM-4F2A9C": a short member reference from the user id. */
export const memberRef = (card: Pick<CustomerCard, 'userId'>) => `#VEM-${card.userId.slice(0, 6).toUpperCase()}`;

export const SEGMENT_LABEL: Record<string, string> = {
  frequent: 'Frequent',
  returning: 'Returning',
  new: 'New Customer',
  inactive: 'Inactive',
  occasional: 'Occasional',
};

export const segmentLabel = (card: CustomerCard) => SEGMENT_LABEL[card.segment] ?? 'Customer';

export const tierLabel = (card: CustomerCard) => (card.tier ? `${card.tier} Tier` : '—');

export const customerSpend = (card: CustomerCard) => parsePrice(card.spend);

export const spendLabel = (card: CustomerCard) => formatNaira(customerSpend(card));

export const pointsLabel = (points?: number | null) => `${(points ?? 0).toLocaleString('en-US')} pts`;

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** "Oct 14, 2026" */
export const dayLabel = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

/** "Today, 9:24 AM" / "Oct 14, 9:24 AM" */
export const whenLabel = (iso?: string | null) => {
  if (!iso) return '—';
  const at = new Date(iso);
  const time = at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (at.toDateString() === new Date().toDateString()) return `Today, ${time}`;
  return `${at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
};

const INTERACTION_LABEL: Record<string, string> = {
  pos: 'POS sale',
  order: 'Order',
  visit: 'Check-in',
  booking: 'Booking',
  claim: 'Deal claimed',
  chat: 'Message',
};

export const interactionLabel = (kind?: string | null) => INTERACTION_LABEL[kind ?? ''] ?? 'Interaction';

/** "Order #4F2A9C1B" / "Deal claimed (Lunch Combo)" for the last-activity line. */
export const lastInteractionLabel = (card: CustomerCard) => {
  const last = card.lastInteraction;
  if (!last) return '—';
  const label = interactionLabel(last.kind);
  if (!last.reference) return label;
  return last.kind === 'pos' || last.kind === 'order' ? `${label} #${last.reference}` : `${label} (${last.reference})`;
};

export const averageOrder = (card: CustomerCard) => (card.orders > 0 ? customerSpend(card) / card.orders : 0);

/** The saved staff note as separate entries, one per line, newest first. */
export const noteEntries = (dossier?: CustomerDossier | null) =>
  (dossier?.note?.note ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

/** Adds a note line on top of the saved note. */
export const withNoteLine = (dossier: CustomerDossier | null | undefined, line: string) =>
  [line.trim(), ...noteEntries(dossier)].join('\n');

/** Downloads the server-built CSV of the directory for the given filters. */
export async function exportCustomers(query: CustomersQuery) {
  const file = await businessCustomersService.export(query);
  const bytes = Uint8Array.from(atob(file.contentBase64), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  link.click();
  URL.revokeObjectURL(url);
  return file.records;
}

/** Neutral silhouette for customers without a photo. */
export const CUSTOMER_AVATAR =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e7e0ec"/%3E%3Ccircle cx="20" cy="15" r="7" fill="%236750a4"/%3E%3Cpath d="M8 36c0-7 5.4-11 12-11s12 4 12 11" fill="%236750a4"/%3E%3C/svg%3E';

export interface DossierEvent {
  key: string;
  kind: 'purchase' | 'claim' | 'points';
  title: string;
  at: string;
  detail: string;
  amount?: number;
  points?: number;
}

/** Purchases, deal claims and points movements in one newest-first timeline. */
export const dossierTimeline = (dossier?: CustomerDossier | null): DossierEvent[] => {
  if (!dossier) return [];
  const purchases = (dossier.recentPurchases ?? []).map<DossierEvent>((purchase) => ({
    key: `p-${purchase.id}`,
    kind: 'purchase',
    title: `${purchase.kind === 'pos' ? 'POS sale' : 'Order'} #${purchase.reference ?? purchase.id.slice(0, 8).toUpperCase()}`,
    at: purchase.at,
    detail: [purchase.items, purchase.branchName].filter(Boolean).join(' · '),
    amount: parsePrice(purchase.total),
  }));
  const claims = (dossier.recentClaims ?? []).map<DossierEvent>((claim) => ({
    key: `c-${claim.id}`,
    kind: 'claim',
    title: `${claim.redeemedAt ? 'Redeemed' : 'Claimed'} ${claim.offerName}`,
    at: claim.redeemedAt ?? claim.claimedAt,
    detail: [claim.claimCode ? `Voucher ${claim.claimCode}` : '', claim.branchName].filter(Boolean).join(' · '),
    amount: parsePrice(claim.saved) || undefined,
  }));
  const points = (dossier.loyaltyLedger ?? []).map<DossierEvent>((entry) => ({
    key: `l-${entry.id}`,
    kind: 'points',
    title: `${entry.points < 0 ? 'Redeemed' : 'Earned'} ${Math.abs(entry.points).toLocaleString('en-US')} loyalty points`,
    at: entry.at,
    detail: entry.reason ?? '',
    points: entry.points,
  }));
  return [...purchases, ...claims, ...points].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
};

/** The backend's loyalty tier ladder (`LOYALTY_TIER_THRESHOLDS`). */
const TIERS = [
  { name: 'Bronze', minPoints: 0 },
  { name: 'Silver', minPoints: 1000 },
  { name: 'Gold', minPoints: 2000 },
  { name: 'Platinum', minPoints: 3000 },
  { name: 'Diamond', minPoints: 6000 },
];

/** "550 pts until Platinum" / "Top tier reached". */
export const nextTierLabel = (points?: number | null) => {
  const next = TIERS.find((tier) => tier.minPoints > (points ?? 0));
  return next ? `${(next.minPoints - (points ?? 0)).toLocaleString('en-US')} pts until ${next.name}` : 'Top tier reached';
};
