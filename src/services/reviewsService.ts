import { api } from './api/client';
import { withMock } from './mock';

export type BusinessReviewStatus = 'pending' | 'approved' | 'rejected';

export interface BusinessReview {
  id: string;
  offerId: string;
  offerName?: string | null;
  reviewerName?: string | null;
  comment?: string | null;
  rating?: number | null;
  likesCount?: number | null;
  status?: BusinessReviewStatus | null;
  merchantReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface BusinessReviewsPage {
  reviews: BusinessReview[];
  total: number;
  page?: number | null;
  limit?: number | null;
}

export interface BusinessReviewsSummary {
  totalReviews: number;
  averageRating?: number | null;
  pendingReviews?: number | null;
  ratingDistribution?: Record<'1' | '2' | '3' | '4' | '5', number> | null;
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

let mockReviews: BusinessReview[] = [
  { id: 'rv-1', offerId: 'of-1', offerName: 'Woodfire Ribeye Combo', reviewerName: 'Tunde Bakare', comment: 'Cooked to perfection. The pepper sauce is unreal.', rating: 5, likesCount: 21, status: 'pending', createdAt: daysAgo(0) },
  { id: 'rv-2', offerId: 'of-2', offerName: 'Weekend Brunch for Two', reviewerName: 'Amaka Obi', comment: 'Lovely ambience, though the wait was a bit long on Saturday.', rating: 4, likesCount: 8, status: 'pending', createdAt: daysAgo(1) },
  { id: 'rv-3', offerId: 'of-1', offerName: 'Woodfire Ribeye Combo', reviewerName: 'Chidi Eze', comment: 'Deal was honoured without any fuss. Will be back.', rating: 5, likesCount: 14, status: 'approved', merchantReply: 'Thank you Chidi, see you soon!', repliedAt: daysAgo(2), createdAt: daysAgo(3) },
  { id: 'rv-4', offerId: 'of-3', offerName: '20% off Grills', reviewerName: 'Funke A.', comment: 'Portion was smaller than pictured.', rating: 3, likesCount: 2, status: 'approved', createdAt: daysAgo(5) },
  { id: 'rv-5', offerId: 'of-2', offerName: 'Weekend Brunch for Two', reviewerName: null, comment: 'Spam link removed', rating: 1, likesCount: 0, status: 'rejected', createdAt: daysAgo(7) },
];

const mockSummary = (): BusinessReviewsSummary => {
  const approved = mockReviews.filter((r) => r.status === 'approved');
  const rated = approved.filter((r) => typeof r.rating === 'number');
  const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as Record<'1' | '2' | '3' | '4' | '5', number>;
  rated.forEach((r) => {
    distribution[String(r.rating) as keyof typeof distribution] += 1;
  });
  return {
    totalReviews: approved.length,
    averageRating: rated.length ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length : null,
    pendingReviews: mockReviews.filter((r) => r.status === 'pending').length,
    ratingDistribution: distribution,
  };
};

const updateMock = (id: string, patch: Partial<BusinessReview>) => {
  mockReviews = mockReviews.map((r) => (r.id === id ? { ...r, ...patch } : r));
};

/** Merchant moderation queue — `/deals/business/reviews` (OWNER/MANAGER only). */
export const reviewsService = {
  list: (query: { status?: BusinessReviewStatus; offerId?: string; page?: number; limit?: number } = {}) =>
    withMock(
      () => api.get<BusinessReviewsPage>('/deals/business/reviews', { params: query }),
      () => {
        const reviews = mockReviews.filter((r) => !query.status || r.status === query.status);
        return { reviews, total: reviews.length, page: 1, limit: query.limit ?? 20 };
      },
    ),

  summary: () => withMock(() => api.get<BusinessReviewsSummary>('/deals/business/reviews/summary'), mockSummary),

  approve: (id: string) =>
    withMock(
      () => api.post<{ id: string; status: string }>(`/deals/business/reviews/${id}/approve`),
      () => {
        updateMock(id, { status: 'approved' });
        return { id, status: 'approved' };
      },
    ),

  reject: (id: string) =>
    withMock(
      () => api.post<{ id: string; status: string }>(`/deals/business/reviews/${id}/reject`),
      () => {
        updateMock(id, { status: 'rejected' });
        return { id, status: 'rejected' };
      },
    ),

  remove: (id: string) =>
    withMock(
      () => api.del<void>(`/deals/business/reviews/${id}`),
      () => {
        mockReviews = mockReviews.filter((r) => r.id !== id);
      },
    ),

  reply: (id: string, reply: string) =>
    withMock(
      () => api.post<{ id: string; merchantReply: string | null }>(`/deals/business/reviews/${id}/reply`, { reply }),
      () => {
        updateMock(id, { merchantReply: reply, repliedAt: new Date().toISOString() });
        return { id, merchantReply: reply };
      },
    ),

  removeReply: (id: string) =>
    withMock(
      () => api.del<void>(`/deals/business/reviews/${id}/reply`),
      () => updateMock(id, { merchantReply: null, repliedAt: null }),
    ),
};
