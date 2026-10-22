import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import {
  useBusinessReviews,
  useBusinessReviewsSummary,
  useModerateBusinessReview,
  useReplyToBusinessReview,
} from '../../hooks/business/useBusinessReviews';
import type { BusinessReview, BusinessReviewStatus, BusinessReviewsSummary } from '../../services/reviewsService';
import { formatRelativeTime } from '../../utils/format';

type Filter = 'all' | BusinessReviewStatus;

const STATUS_BADGE: Record<BusinessReviewStatus, string> = {
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  approved: 'bg-badge-discount-bg text-badge-discount-text',
  rejected: 'bg-error-container text-on-error-container',
};

const STATUS_LABEL: Record<BusinessReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

function Stars({ rating, size = 'text-[16px]' }: { rating?: number | null; size?: string }) {
  if (typeof rating !== 'number') return <span className="font-caption text-caption text-text-tertiary">No rating</span>;
  return (
    <span className="inline-flex items-center text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Icon key={index} name="star" filled={index < Math.round(rating)} className={`${size} ${index < Math.round(rating) ? '' : 'text-outline-variant'}`} />
      ))}
    </span>
  );
}

function SummaryCard({ summary }: { summary?: BusinessReviewsSummary }) {
  const distribution = summary?.ratingDistribution;
  const max = distribution ? Math.max(1, ...Object.values(distribution)) : 1;
  const score = typeof summary?.averageRating === 'number' ? summary.averageRating.toFixed(1) : '—';

  return (
    <section className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-md">
      <div className="flex items-end gap-space-sm">
        <span className="font-display-hero text-[44px] leading-none font-bold text-text-primary">{score}</span>
        <div className="flex flex-col gap-1 pb-1">
          <Stars rating={summary?.averageRating} />
          <span className="font-caption text-caption text-text-secondary">
            Based on {summary?.totalReviews ?? 0} approved reviews
          </span>
        </div>
      </div>
      {summary?.pendingReviews ? (
        <span className="inline-flex w-fit items-center gap-1 px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm">
          <Icon name="schedule" className="text-[14px]" />
          {summary.pendingReviews} awaiting moderation
        </span>
      ) : null}
      <div className="flex flex-col gap-space-2xs">
        <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Rating distribution</span>
        {(['5', '4', '3', '2', '1'] as const).map((star) => {
          const count = distribution?.[star] ?? 0;
          return (
            <div key={star} className="flex items-center gap-space-xs">
              <span className="w-3 font-label-sm text-label-sm text-text-secondary">{star}</span>
              <Icon name="star" filled className="text-[14px] text-amber-500" />
              <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="w-6 text-right font-label-sm text-label-sm text-text-secondary">{count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReviewRow({ review }: { review: BusinessReview }) {
  const moderate = useModerateBusinessReview();
  const reply = useReplyToBusinessReview();
  const [replyOpen, setReplyOpen] = useState(false);
  const [draft, setDraft] = useState(review.merchantReply ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = (review.status ?? 'pending') as BusinessReviewStatus;
  const busy = moderate.isPending || reply.isPending;

  const saveReply = () => {
    const text = draft.trim();
    if (!text) return;
    reply.mutate({ reviewId: review.id, reply: text }, { onSuccess: () => setReplyOpen(false) });
  };

  return (
    <article className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm">
      <header className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
            {(review.reviewerName ?? 'G').charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
              {review.reviewerName ?? 'Guest'}
            </span>
            <span className="font-caption text-caption text-text-secondary truncate">
              {review.offerName ?? 'A deal'} · {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${STATUS_BADGE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </header>

      <Stars rating={review.rating} />
      {review.comment ? <p className="font-body-md text-body-md text-text-primary">{review.comment}</p> : null}
      <span className="inline-flex items-center gap-1 font-caption text-caption text-text-tertiary">
        <Icon name="thumb_up" className="text-[14px]" /> Helpful ({review.likesCount ?? 0})
      </span>

      {review.merchantReply && !replyOpen ? (
        <div className="rounded-lg bg-surface-container-low p-space-sm flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-text-secondary">
            Your reply{review.repliedAt ? ` · ${formatRelativeTime(review.repliedAt)}` : ''}
          </span>
          <p className="font-body-md text-body-md text-text-primary">{review.merchantReply}</p>
        </div>
      ) : null}

      {replyOpen ? (
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-sm text-label-sm text-text-secondary" htmlFor={`reply-${review.id}`}>
            Customers see your reply under the review.
          </label>
          <textarea
            id={`reply-${review.id}`}
            className="w-full min-h-[88px] p-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
            maxLength={1000}
            placeholder="Thank the guest or answer their point…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          {reply.isError ? (
            <span className="font-caption text-caption text-red-600">Could not save the reply. Try again.</span>
          ) : null}
          <div className="flex flex-wrap gap-space-xs">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={saveReply}
              className="h-9 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60"
            >
              Post reply
            </button>
            {review.merchantReply ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => reply.mutate({ reviewId: review.id, reply: null }, { onSuccess: () => setReplyOpen(false) })}
                className="h-9 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md"
              >
                Remove reply
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setReplyOpen(false)}
              className="h-9 px-space-md rounded-lg text-text-secondary font-label-md text-label-md"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="rounded-lg bg-error-container/60 p-space-sm flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-error-container">
            Delete this review? The review and its rating are removed from the deal.
          </span>
          <div className="flex gap-space-xs">
            <button
              type="button"
              disabled={busy}
              onClick={() => moderate.mutate({ reviewId: review.id, action: 'delete' })}
              className="h-9 px-space-md rounded-lg bg-error text-on-error font-label-md text-label-md"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-9 px-space-md rounded-lg bg-surface-canvas text-text-primary font-label-md text-label-md"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <footer className="flex flex-wrap gap-space-xs pt-space-2xs border-t border-border-subtle">
          {status === 'pending' ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => moderate.mutate({ reviewId: review.id, action: 'approve' })}
                className="h-9 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-60"
              >
                <Icon name="check" className="text-[18px]" /> Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => moderate.mutate({ reviewId: review.id, action: 'reject' })}
                className="h-9 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-60"
              >
                <Icon name="block" className="text-[18px]" /> Reject
              </button>
            </>
          ) : null}
          {!replyOpen ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(review.merchantReply ?? '');
                setReplyOpen(true);
              }}
              className="h-9 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md inline-flex items-center gap-1"
            >
              <Icon name="reply" className="text-[18px]" /> {review.merchantReply ? 'Edit reply' : 'Reply'}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            className="h-9 px-space-sm rounded-lg text-red-600 font-label-md text-label-md inline-flex items-center gap-1 ml-auto"
          >
            <Icon name="delete" className="text-[18px]" /> Delete
          </button>
        </footer>
      )}
      {moderate.isError ? (
        <span className="font-caption text-caption text-red-600">That action failed. Try again.</span>
      ) : null}
    </article>
  );
}

/** Reviews & reputation: score summary plus the merchant moderation queue. */
export function ReviewsPanel() {
  const [filter, setFilter] = useState<Filter>('all');
  const summary = useBusinessReviewsSummary();
  const reviews = useBusinessReviews(filter === 'all' ? undefined : filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-space-lg items-start">
      <div className="lg:sticky lg:top-24">
        {summary.isError ? (
          <ErrorState title="Could not load your score" error={summary.error} onRetry={() => summary.refetch()} />
        ) : (
          <SummaryCard summary={summary.data} />
        )}
      </div>

      <div className="flex flex-col gap-space-md min-w-0">
        <FilterChips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending', count: summary.data?.pendingReviews ?? undefined },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ]}
        />
        {reviews.isLoading ? (
          <LoadingRows label="Loading reviews" />
        ) : reviews.isError ? (
          <ErrorState title="Could not load reviews" error={reviews.error} onRetry={() => reviews.refetch()} />
        ) : !reviews.data?.length ? (
          <EmptyState icon="reviews" title="No reviews in this view" body="Reviews appear here as customers write them." />
        ) : (
          reviews.data.map((review) => <ReviewRow key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
}
