import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsService, type BusinessReviewStatus } from '../../services/reviewsService';

export const businessReviewsKeys = {
  all: ['business-reviews'] as const,
  list: (status?: BusinessReviewStatus) => ['business-reviews', 'list', status ?? 'all'] as const,
  summary: ['business-reviews', 'summary'] as const,
};

/** `status` is part of the key: each filter chip is its own server-side query. */
export function useBusinessReviews(status?: BusinessReviewStatus) {
  return useQuery({
    queryKey: businessReviewsKeys.list(status),
    queryFn: async () => (await reviewsService.list({ status, limit: 50 })).reviews,
  });
}

export function useBusinessReviewsSummary() {
  return useQuery({ queryKey: businessReviewsKeys.summary, queryFn: reviewsService.summary, staleTime: 60_000 });
}

export type ReviewModerationAction = 'approve' | 'reject' | 'delete';

export function useModerateBusinessReview() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { reviewId: string; action: ReviewModerationAction }>({
    mutationFn: async ({ reviewId, action }: { reviewId: string; action: ReviewModerationAction }) => {
      if (action === 'approve') await reviewsService.approve(reviewId);
      else if (action === 'reject') await reviewsService.reject(reviewId);
      else await reviewsService.remove(reviewId);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: businessReviewsKeys.all }),
  });
}

/** `reply: null` removes the business's public reply. */
export function useReplyToBusinessReview() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { reviewId: string; reply: string | null }>({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string | null }) => {
      if (reply === null) await reviewsService.removeReply(reviewId);
      else await reviewsService.reply(reviewId, reply);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: businessReviewsKeys.all }),
  });
}
