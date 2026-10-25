import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { offersService } from '../../services/offersService';
import { catalogueItemsService } from '../../services/catalogueItemsService';
import { reviewsService } from '../../services/reviewsService';
import { verificationService, type VerificationCheck, type BusinessVerificationStatus } from '../../services/verificationService';
import { formatNaira } from '../../utils/format';
import { useMyBusiness } from './useMyBusiness';
import { useBusinessQr } from './useBusinessQr';

const VERIFICATION_LABEL: Record<BusinessVerificationStatus, string> = {
  verified: 'Verified Business',
  in_progress: 'Verification in progress',
  needs_review: 'Verification under review',
  rejected: 'Verification rejected',
  unverified: 'Not verified',
};

const CHECK_LABEL: Record<VerificationCheck['status'], string> = {
  verified: 'Confirmed',
  pending: 'Pending',
  needs_review: 'Under review',
  failed: 'Failed',
};

/**
 * Live facts for the desktop storefront studio: brand header, trust dossier and
 * the consumer phone preview. Null fields mean "not known" — the screen hides
 * them rather than show demo copy. `live` is false without an API.
 */
export function useStorefrontPreview() {
  const live = hasApiConfig();
  const opts = { enabled: live, staleTime: 60_000 };
  const business = useMyBusiness();
  const qr = useBusinessQr();
  const verification = useQuery({ queryKey: ['storefront-preview', 'verification'], queryFn: verificationService.status, ...opts });
  const reviews = useQuery({ queryKey: ['storefront-preview', 'reviews'], queryFn: reviewsService.summary, ...opts });
  const offers = useQuery({ queryKey: ['storefront-preview', 'offers'], queryFn: () => offersService.summary(), ...opts });
  const items = useQuery({
    queryKey: ['storefront-preview', 'items'],
    queryFn: () => catalogueItemsService.list({ limit: 100 }),
    ...opts,
  });

  const b = business.data;
  const v = verification.data;
  const activeItems = (items.data ?? []).filter((item) => item.status === 'active' && !item.isSuspended);
  const check = (c?: VerificationCheck | null) =>
    c ? `${CHECK_LABEL[c.status]}${c.maskedId ? ` · ${c.maskedId}` : ''}` : 'Not submitted';

  return {
    live,
    storeCode: b?.uniqueCode ?? null,
    logoUrl: b?.logoUrl ?? null,
    coverImage: b?.coverImage ?? null,
    location: [b?.address, b?.city].filter(Boolean).join(', ') || null,
    city: b?.city ?? null,
    category: b?.subcategory?.name ?? b?.category?.name ?? null,
    publicUrl: qr.url,
    verified: Boolean(v?.isVerified ?? b?.isVerified),
    verificationLabel: v ? VERIFICATION_LABEL[v.status] : null,
    businessCheck: v ? check(v.business) : null,
    businessCheckOk: v?.business?.status === 'verified',
    identityCheck: v ? check(v.identity) : null,
    identityCheckOk: v?.identity?.status === 'verified',
    rating: reviews.data?.totalReviews ? (reviews.data.averageRating ?? 0).toFixed(1) : null,
    reviewCount: reviews.data?.totalReviews ?? 0,
    activeDeals: offers.data ? Number(offers.data.activeDeals ?? 0) : null,
    itemCount: items.data ? activeItems.length : null,
    featured: activeItems.slice(0, 2).map((item) => ({
      id: item.id,
      name: item.name,
      note: item.shortDescription || item.category?.name || (item.itemType === 'service' ? 'Service' : 'Product'),
      price: item.price != null && item.price !== '' ? formatNaira(Number(item.price)) : '',
      image: item.mainImage ?? null,
    })),
  };
}
