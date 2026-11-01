import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, getAccessToken, hasApiConfig } from '../services/api/client';
import { realOfferId } from '../utils/homeOffer';

/** One approved review/comment as `GET /deals/:id/reviews` returns it. */
export interface DealReview {
  id: string;
  reviewerName: string;
  comment: string;
  /** 1–5, or null for a plain comment. */
  rating: number | null;
  likesCount: number;
  isLiked: boolean;
  merchantReply: string | null;
  createdAt: string | null;
}

export type SubmitResult = { ok: true; pending: boolean } | { ok: false; message: string };

const unwrap = (payload: unknown): Record<string, unknown> => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const data = record.data;
  return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : record;
};

const toReview = (value: unknown): DealReview | null => {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.comment !== 'string') return null;
  const rating = Number(row.rating);
  return {
    id: row.id,
    reviewerName: typeof row.reviewerName === 'string' && row.reviewerName.trim() ? row.reviewerName.trim() : 'Customer',
    comment: row.comment,
    rating: Number.isFinite(rating) && rating >= 1 ? Math.min(5, Math.round(rating)) : null,
    likesCount: Math.max(0, Number(row.likesCount) || 0),
    isLiked: Boolean(row.isLiked),
    merchantReply: typeof row.merchantReply === 'string' && row.merchantReply.trim() ? row.merchantReply : null,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : null,
  };
};

/** The backend's own reason ("You have already reviewed this deal", …) when it gives one. */
export const reviewErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in to do that.';
    if (error.message && !/^Request failed/.test(error.message)) return error.message;
  }
  return 'Something went wrong. Please try again.';
};

/** "Just now", "5m", "3h", "2d", else "12 Oct". */
export const reviewTimeLabel = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

export const reviewerInitials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';

/**
 * Live reviews/comments for one deal, shared by the mobile sheets and desktop
 * dialogs. Reads `GET /deals/:id/reviews`, posts `POST /deals/:id/reviews`
 * (`comment`, optional `rating` — nothing else, the API rejects unknown fields)
 * and toggles review likes via `POST /deals/:id/reviews/:reviewId/like`.
 */
export function useDealReviews(dealId: string | number | null | undefined, open: boolean) {
  const offerId = realOfferId({ id: dealId == null ? undefined : String(dealId) });
  const [reviews, setReviews] = useState<DealReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const likePending = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (!offerId || !hasApiConfig()) {
      setReviews([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const payload = unwrap(await api.get<unknown>(`/deals/${offerId}/reviews`, { params: { page: 1, limit: 50 } }));
      const rows = Array.isArray(payload.reviews) ? payload.reviews : [];
      const next = rows.map(toReview).filter((review): review is DealReview => Boolean(review));
      setReviews(next);
      setTotal(Math.max(Number(payload.total) || 0, next.length));
    } catch (error) {
      setReviews([]);
      setTotal(0);
      setLoadError(reviewErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  /**
   * Saves a comment (no rating) or a review (rating 1–5). Signed-in customers post under their
   * account name; signed-out visitors must give a name (the API requires one). Reloads the list
   * when the review is live straight away.
   */
  const submit = useCallback(
    async (comment: string, rating?: number, name?: string): Promise<SubmitResult> => {
      const text = comment.trim();
      if (!text) return { ok: false, message: 'Write something first.' };
      const reviewerName = name?.trim() ?? '';
      if (!getAccessToken() && reviewerName.length < 2) return { ok: false, message: 'Add your name (at least 2 letters).' };
      if (!offerId) return { ok: false, message: 'This deal cannot take comments right now.' };
      setSubmitting(true);
      try {
        const body: Record<string, unknown> = { comment: text };
        if (rating && rating >= 1 && rating <= 5) body.rating = Math.round(rating);
        if (!getAccessToken()) body.name = reviewerName;
        const saved = unwrap(await api.post<unknown>(`/deals/${offerId}/reviews`, body));
        const pending = saved.status === 'pending';
        if (!pending) await load();
        return { ok: true, pending };
      } catch (error) {
        return { ok: false, message: reviewErrorMessage(error) };
      } finally {
        setSubmitting(false);
      }
    },
    [offerId, load],
  );

  /** Likes/unlikes a review (signed-in only); optimistic, rolled back on failure. */
  const toggleLike = useCallback(
    async (reviewId: string): Promise<string | null> => {
      if (!offerId) return null;
      if (!getAccessToken()) return 'Please sign in to like comments.';
      if (likePending.current.has(reviewId)) return null;
      const before = reviews.find((review) => review.id === reviewId);
      if (!before) return null;
      const flip = (review: DealReview, liked: boolean, count: number) => (review.id === reviewId ? { ...review, isLiked: liked, likesCount: count } : review);
      setReviews((prev) => prev.map((review) => flip(review, !before.isLiked, Math.max(0, before.likesCount + (before.isLiked ? -1 : 1)))));
      likePending.current.add(reviewId);
      try {
        const result = unwrap(await api.post<unknown>(`/deals/${offerId}/reviews/${reviewId}/like`));
        setReviews((prev) => prev.map((review) => flip(review, Boolean(result.liked), Math.max(0, Number(result.likesCount) || 0))));
        return null;
      } catch (error) {
        setReviews((prev) => prev.map((review) => flip(review, before.isLiked, before.likesCount)));
        return reviewErrorMessage(error);
      } finally {
        likePending.current.delete(reviewId);
      }
    },
    [offerId, reviews],
  );

  const rated = reviews.filter((review) => review.rating != null);
  const averageRating = rated.length ? rated.reduce((sum, review) => sum + (review.rating ?? 0), 0) / rated.length : null;

  return { signedIn: Boolean(getAccessToken()), offerId, reviews, total, loading, loadError, submitting, submit, toggleLike, averageRating, ratedCount: rated.length, reload: load };
}
