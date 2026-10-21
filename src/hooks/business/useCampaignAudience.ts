import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessCustomersService, type CustomerCard } from '../../services/businessCustomersService';
import { useContacts } from '../../context/ContactsContext';
import { buildAudiencePool, type CampaignContact } from '../../scripts/campaigns/campaignsData';
import { customerKeys } from './useBusinessCustomers';

/** Enough for a campaign audience; the API pages at 100. */
const MAX_PAGES = 5;

async function allCustomers(): Promise<CustomerCard[]> {
  const rows: CustomerCard[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await businessCustomersService.list({ page, limit: 100, sort: 'recent' });
    rows.push(...res.data);
    if (!res.hasNextPage) break;
  }
  return rows;
}

const time = (iso?: string | null) => (iso ? new Date(iso).getTime() : Date.now());

/**
 * The backend keeps no per-customer marketing opt-in the web can read, so live
 * customers count as opted in and the business confirms consent on review.
 */
function toContact(card: CustomerCard): CampaignContact {
  return {
    key: card.userId,
    merchantId: '',
    merchantName: '',
    name: card.name || 'Customer',
    phone: card.phone ?? undefined,
    email: card.email ?? undefined,
    orderRefs: [],
    orderCount: card.visits,
    totalSpend: Number(card.spend) || 0,
    marketingConsent: true,
    createdAt: time(card.firstSeenAt),
    updatedAt: time(card.lastSeenAt),
  };
}

/** Who a campaign can reach: the business's real customers live, sample contacts in demo. */
export function useCampaignAudience(): { pool: CampaignContact[]; isLoading: boolean; error: unknown } {
  const { contacts } = useContacts();
  const live = hasApiConfig();
  const customers = useQuery({ queryKey: [...customerKeys.all, 'campaign-audience'], queryFn: allCustomers, enabled: live });
  const pool = useMemo(
    () => (live ? (customers.data ?? []).map(toContact) : buildAudiencePool(contacts)),
    [live, customers.data, contacts],
  );
  return { pool, isLoading: live && customers.isLoading, error: customers.error };
}
