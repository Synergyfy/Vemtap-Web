import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';
import { reviewTimeLabel, reviewerInitials, useDealReviews } from '../../hooks/useDealReviews';
import { SheetShell } from './SheetShell';
import type { ClaimDealSummary } from '../desktop/dialogs/ClaimIdentityModal';

export interface ReviewsSheetProps {
  open: boolean;
  onClose: () => void;
  deal?: ClaimDealSummary | null;
}

const SCORE_LABELS: Record<number, string> = {
  1: '1.0 — Needs Improvement',
  2: '2.0 — Fair Experience',
  3: '3.0 — Average Visit',
  4: '4.0 — Very Good!',
  5: '5.0 — Outstanding!',
};

// The API has no tag field: picked highlights are added to the review text. None are pre-selected.
const FEEDBACK_PILLS: { label: string; emoji: string; initiallySelected: boolean }[] = [
  { label: 'Great Portions', emoji: '👍', initiallySelected: false },
  { label: 'Fast Service', emoji: '⚡', initiallySelected: false },
  { label: 'Easy QR Redemption', emoji: '✨', initiallySelected: false },
  { label: 'Friendly Staff', emoji: '😊', initiallySelected: false },
  { label: 'Great Ambiance', emoji: '🌿', initiallySelected: false },
];

export function ReviewsSheet({ open, onClose, deal }: ReviewsSheetProps) {
  const [rating, setRating] = useState(5);
  const [selectedPills, setSelectedPills] = useState<boolean[]>(FEEDBACK_PILLS.map((pill) => pill.initiallySelected));
  const [reviewText, setReviewText] = useState('');
  const [status, setStatus] = useState<'idle' | 'publishing' | 'published'>('idle');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const feed = useDealReviews(deal?.id, open);
  const offerId = feed.offerId;

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setRating(5);
      setReviewText('');
      setNotice(null);
      setSelectedPills(FEEDBACK_PILLS.map((pill) => pill.initiallySelected));
    }
  }, [open]);

  const togglePill = (index: number) => {
    setSelectedPills((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  /** Saves the review — `POST /deals/:id/reviews` with the star rating and text. */
  const submitReview = async () => {
    if (status !== 'idle' || !offerId || !reviewText.trim()) return;
    setStatus('publishing');
    setNotice(null);
    const highlights = FEEDBACK_PILLS.filter((_, index) => selectedPills[index]).map((pill) => pill.label);
    const comment = highlights.length ? `${reviewText.trim()}\n\nHighlights: ${highlights.join(', ')}` : reviewText.trim();
    const result = await feed.submit(comment, rating, feed.signedIn ? undefined : name);
    if (!result.ok) {
      setStatus('idle');
      setNotice({ kind: 'error', text: result.message });
      return;
    }
    setStatus('published');
    setReviewText('');
    setSelectedPills(FEEDBACK_PILLS.map((pill) => pill.initiallySelected));
    if (result.pending) setNotice({ kind: 'info', text: 'Thanks! Your review will appear once the business approves it.' });
    window.setTimeout(() => setStatus('idle'), 1200);
  };

  const toggleHelpful = async (reviewId: string) => {
    const message = await feed.toggleLike(reviewId);
    if (message) setNotice({ kind: 'error', text: message });
  };

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center items-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>

      <div className="px-margin pt-3 pb-8">
        <div className="flex items-center justify-between pb-space-sm">
          <div className="inline-flex items-center gap-1.5 bg-surface-tint-blue px-3 py-1 rounded-full">
            <Icon name="verified" className="text-primary text-[15px]" filled />
            <span className="font-label-sm text-label-sm text-primary tracking-wide">DEAL REVIEW</span>
          </div>
          <button
            aria-label="Close review dialog"
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-xl mb-space-md">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-tint-blue flex items-center justify-center">
            {deal?.image ? (
              <img className="w-full h-full object-cover" alt={deal?.title || 'Deal'} src={deal.image} />
            ) : (
              <Icon name="local_offer" className="text-primary text-[24px]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {deal?.business ? <p className="font-label-sm text-label-sm text-text-secondary truncate">{deal.business}</p> : null}
            <h3 className="font-heading-sm text-heading-sm text-on-surface truncate">{deal?.title || 'This deal'}</h3>
            {deal?.location ? (
              <div className="flex items-center gap-1 font-caption text-caption text-text-secondary mt-0.5">
                <Icon name="location_on" className="text-[13px]" />
                <span>{deal.location}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-center pt-4 pb-2">
          <h2 className="font-heading-md text-heading-md text-on-surface">Rate your experience</h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-[280px] mx-auto">
            How was this deal{deal?.business ? ` at ${deal.business}` : ''}?
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 mt-2 mb-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                aria-label={value === 1 ? 'Rate 1 star' : `Rate ${value} stars`}
                type="button"
                onClick={() => setRating(value)}
                className="transition-transform active:scale-125 focus:outline-none p-1"
              >
                <Icon
                  name="star"
                  filled={value <= rating}
                  className={`text-[36px] ${value <= rating ? 'text-tertiary-container' : 'text-surface-dim'}`}
                />
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-tertiary-fixed px-3 py-1 rounded-full">
            <Icon name="sentiment_very_satisfied" className="text-tertiary text-[15px]" filled />
            <span className="font-label-sm text-label-sm text-on-tertiary-fixed">{SCORE_LABELS[rating]}</span>
          </div>
        </div>

        <div className="mt-space-md">
          <p className="font-label-sm text-label-sm text-text-secondary mb-space-xs">What stood out most?</p>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_PILLS.map((pill, index) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => togglePill(index)}
                className={
                  selectedPills[index]
                    ? 'px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1.5 bg-surface-tint-blue text-primary-container'
                    : 'px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1.5 bg-surface-subtle text-text-secondary hover:bg-surface-container-low'
                }
              >
                <span>{pill.label}</span>
                <span>{pill.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-space-md">
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="review-sheet-text">
              Tell others about your experience
            </label>
            <span className="font-caption text-caption text-text-tertiary">{reviewText.length} / 500</span>
          </div>
          <div className="relative bg-surface-subtle rounded-xl p-space-sm focus-within:bg-surface-canvas focus-within:shadow-[0_0_0_2px_#066cf4] transition-all">
            <textarea
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none resize-none"
              id="review-sheet-text"
              maxLength={500}
              placeholder="Share details of your visit, food quality, or customer service. Helpful reviews help other VEMTAP shoppers..."
              rows={3}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
            />
          </div>
        </div>

        {!feed.signedIn ? (
          <div className="mt-space-md">
            <label className="font-label-sm text-label-sm text-text-secondary mb-1.5 block" htmlFor="review-sheet-name">Your name</label>
            <input
              id="review-sheet-name"
              autoComplete="name"
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-surface-subtle rounded-xl px-space-sm py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4]"
            />
          </div>
        ) : null}

        <div className="pt-5 pb-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
              Recent reviews
            </span>
            <span className="font-caption text-caption text-text-secondary">{feed.loading ? '…' : `${feed.total} review${feed.total === 1 ? '' : 's'}`}</span>
          </div>

          {feed.loading && feed.reviews.length === 0 ? (
            [0, 1].map((key) => (
              <div key={key} role="status" aria-busy="true" className="bg-surface-subtle p-space-md rounded-xl space-y-2">
                <span className="sr-only">Loading reviews</span>
                <div className="flex items-center gap-space-sm">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : feed.loadError ? (
            <div className="bg-surface-subtle p-space-md rounded-xl text-error text-body-md flex items-center justify-between gap-2">
              <span>Couldn’t load reviews.</span>
              <button type="button" onClick={() => void feed.reload()} className="font-semibold underline">Retry</button>
            </div>
          ) : feed.reviews.length === 0 ? (
            <div className="bg-surface-subtle p-space-md rounded-xl text-text-secondary text-body-md">
              There are no reviews for this deal yet. Be the first to rate it.
            </div>
          ) : (
            feed.reviews.map((review) => (
              <article key={review.id} className="bg-surface-subtle p-space-md rounded-xl space-y-space-sm shadow-xs">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 bg-surface-container-high text-primary">
                      {review.reviewerAvatar ? (
                      <img className="w-full h-full rounded-full object-cover bg-surface-canvas" alt="" src={review.reviewerAvatar} />
                    ) : (
                      reviewerInitials(review.reviewerName)
                    )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">{review.reviewerName}</span>
                      </div>
                      <span className="font-caption text-caption text-text-tertiary">{reviewTimeLabel(review.createdAt)}</span>
                    </div>
                  </div>
                  {review.rating != null ? (
                    <div className="flex items-center gap-1 text-tertiary shrink-0">
                      <Icon name="star" className="text-[16px]" filled />
                      <span className="font-label-md text-label-md font-bold text-text-primary">{review.rating.toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>

                {review.createdAt ? (
                  <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
                    <Icon name="calendar_today" className="text-[14px]" />
                    <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                ) : null}

                <p className="font-body-md text-body-md text-text-secondary leading-relaxed whitespace-pre-line">{review.comment}</p>

                {review.merchantReply ? (
                  <div className="bg-surface-canvas rounded-lg p-space-sm">
                    <p className="font-caption text-caption text-primary font-semibold">Reply from {deal?.business ?? 'the business'}</p>
                    <p className="font-body-md text-body-md text-text-secondary mt-0.5">{review.merchantReply}</p>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-space-sm pt-space-2xs">
                  <span className="font-caption text-caption text-text-tertiary">Was this review helpful?</span>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      aria-pressed={review.isLiked}
                      aria-label={review.isLiked ? 'Remove helpful vote' : 'Mark review as helpful'}
                      onClick={() => void toggleHelpful(review.id)}
                      className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-canvas text-text-primary font-label-sm text-label-sm font-medium active:scale-95 transition-transform"
                    >
                      <Icon name="thumb_up" className="text-[16px] text-primary" filled={review.isLiked} />
                      <span>{review.likesCount}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}

          {notice ? (
            <p role={notice.kind === 'error' ? 'alert' : 'status'} className={`font-caption text-caption text-center ${notice.kind === 'error' ? 'text-error' : 'text-badge-discount-text'}`}>
              {notice.text}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!offerId || !reviewText.trim() || status !== 'idle'}
            onClick={() => void submitReview()}
            className={
              status === 'published'
                ? 'w-full h-[52px] bg-badge-discount-text text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] active:scale-[0.98] transition-all disabled:opacity-50'
                : 'w-full h-[52px] bg-primary-container text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] active:scale-[0.98] transition-all disabled:opacity-50'
            }
          >
            {status === 'idle' ? (
              <>
                <span>Submit Review</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </>
            ) : status === 'publishing' ? (
              <>
                <Icon name="progress_activity" className="text-[20px] animate-spin" />
                <span>Publishing Review...</span>
              </>
            ) : (
              <>
                <Icon name="check_circle" className="text-[20px]" filled />
                <span>Review Published!</span>
              </>
            )}
          </button>
          <div className="flex items-start justify-center gap-1.5 px-2 text-center text-text-tertiary">
            <Icon name="shield" className="text-[15px] flex-shrink-0 mt-0.5 text-badge-discount-text" filled />
            <p className="font-caption text-caption">
              Reviews are public and shown on this deal to help other VEMTAP shoppers.
            </p>
          </div>
        </div>
      </div>
    </SheetShell>
  );
}
