import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { subscriptionService } from '../../services/subscriptionService';
import { reviewsService } from '../../services/reviewsService';
import { notificationService } from '../../services/notificationService';
import { clustersService } from '../../services/clustersService';
import { useMyBusiness } from './useMyBusiness';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : null;

/**
 * Live figures for the More hub (business card, plan, reviews, unread
 * notifications, cluster). `null` fields mean "not known" — screens hide them
 * rather than show a demo value. Everything is null without an API.
 */
export function useMoreSummary() {
  const live = hasApiConfig();
  const { branch } = useBusinessBranch();
  const business = useMyBusiness();
  const plan = useQuery({ queryKey: ['more', 'subscription'], queryFn: subscriptionService.active, enabled: live, staleTime: 60_000 });
  const reviews = useQuery({ queryKey: ['more', 'reviews'], queryFn: reviewsService.summary, enabled: live, staleTime: 60_000 });
  const unread = useQuery({ queryKey: ['more', 'unread'], queryFn: notificationService.getUnreadCount, enabled: live, staleTime: 30_000 });
  const cluster = useQuery({
    queryKey: ['more', 'cluster', branch.id ?? 'own'],
    queryFn: () => clustersService.mine(branch.id),
    enabled: live,
    retry: false,
    staleTime: 60_000,
  });

  const b = business.data;
  const sub = plan.data;
  const r = reviews.data;
  return {
    live,
    name: b?.name ?? null,
    code: b?.uniqueCode ? `#${b.uniqueCode}` : null,
    logoUrl: b?.logoUrl ?? null,
    verified: Boolean(b?.isVerified),
    location: [b?.address, b?.city].filter(Boolean).join(', ') || null,
    branchName: branch.name,
    planName: sub?.plan?.name ?? null,
    planLine: sub
      ? [
          sub.plan?.name,
          sub.status === 'trial' ? 'Trial' : sub.status === 'active' ? 'Active' : sub.status,
          // Free plans carry a nominal end date; a past one is not a renewal.
          sub.endDate && !sub.plan?.isFree && new Date(sub.endDate).getTime() > Date.now()
            ? `${sub.status === 'trial' ? 'Ends' : 'Renews'} ${formatDate(sub.endDate)}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null,
    reviewsLine: r
      ? r.totalReviews
        ? `${(r.averageRating ?? 0).toFixed(1)} ★ · ${r.totalReviews} ${r.totalReviews === 1 ? 'review' : 'reviews'}`
        : 'No reviews yet'
      : null,
    pendingReviews: r?.pendingReviews ?? 0,
    unread: typeof unread.data === 'number' ? unread.data : 0,
    clusterName: cluster.data?.name ?? null,
  };
}
