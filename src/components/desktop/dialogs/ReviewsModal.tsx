import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { Skeleton } from '../../ui/Skeleton';
import { reviewTimeLabel, reviewerInitials, useDealReviews } from '../../../hooks/useDealReviews';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import type { ClaimDealSummary } from './ClaimIdentityModal';

export interface ReviewsModalProps {
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

export function ReviewsModal({ open, onClose, deal }: ReviewsModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedPills, setSelectedPills] = useState<boolean[]>(FEEDBACK_PILLS.map((pill) => pill.initiallySelected));
  const [reviewText, setReviewText] = useState('');
  const [status, setStatus] = useState<'idle' | 'publishing' | 'published'>('idle');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const timers = useRef<Array<number>>([]);
  const feed = useDealReviews(deal?.id, open);
  const offerId = feed.offerId;

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (!open) {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
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

  /** "Helpful" is the review like — `POST /deals/:id/reviews/:reviewId/like`. */
  const toggleHelpful = async (id: string) => {
    const message = await feed.toggleLike(id);
    if (message) setNotice({ kind: 'error', text: message });
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
    timers.current.push(window.setTimeout(() => setStatus('idle'), 1200));
  };

  // Summary from the real ratings only (comments without stars are not counted).
  const rated = feed.reviews.filter((review) => review.rating != null);
  const averageRating = feed.averageRating ?? 0;
  const ratingBars = [5, 4, 3, 2, 1].map((stars) => {
    const count = rated.filter((review) => review.rating === stars).length;
    const percent = rated.length ? Math.round((count / rated.length) * 100) : 0;
    return { label: `${stars} star`, width: `${percent}%`, value: `${percent}%` };
  });
  const displayReviews = feed.reviews;

  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-center justify-between gap-space-md p-space-lg border-b border-border-subtle">
        <div className="flex flex-col gap-space-2xs">
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary w-fit">
            <Icon name="verified" className="text-[14px]" filled />
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              Deal Review
            </span>
          </span>
          <h4 className="font-heading-sm text-heading-sm text-text-primary">Reviews &amp; Ratings</h4>
        </div>
        <ModalCloseButton onClose={onClose} label="Close review dialog" />
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-space-lg space-y-space-md">
        <div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-tint-blue flex items-center justify-center">
            {deal?.image ? (
              <img className="w-full h-full object-cover" alt={deal?.title || 'Deal'} src={deal.image} />
            ) : (
              <Icon name="local_offer" className="text-primary text-[24px]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {deal?.business ? <p className="font-label-sm text-label-sm text-text-secondary truncate">{deal.business}</p> : null}
            <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{deal?.title || 'This deal'}</h3>
            {deal?.location ? (
              <div className="flex items-center gap-1 font-caption text-caption text-text-secondary mt-0.5">
                <Icon name="location_on" className="text-[13px]" />
                <span>{deal.location}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-surface-subtle p-space-md rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
            <div className="flex flex-col items-center sm:items-start bg-surface-canvas rounded-xl p-space-sm shadow-xs sm:w-48 shrink-0">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-heading-lg text-heading-lg text-text-primary leading-none">{rated.length ? averageRating.toFixed(1) : '–'}</span>
                <span className="font-caption text-caption text-text-tertiary">/ 5.0</span>
              </div>
              <div className="flex items-center gap-0.5 my-space-xs text-tertiary">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Icon key={value} name="star" filled={value <= Math.round(averageRating)} className="text-[18px]" />
                ))}
              </div>
              <p className="font-caption text-caption text-text-secondary leading-snug text-center sm:text-left">
                Based on <strong className="text-text-primary font-semibold">{rated.length} customer rating{rated.length === 1 ? '' : 's'}</strong>
              </p>
              <div className="mt-space-xs w-full flex items-center justify-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-sm py-space-2xs rounded-lg">
                <Icon name="thumb_up" className="text-[16px]" />
                <span className="font-label-sm text-label-sm font-semibold">{rated.length ? `${rated.filter((review) => (review.rating ?? 0) >= 4).length} of ${rated.length} rated 4★ or more` : 'Be the first to review this deal'}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-space-xs">
              {ratingBars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-space-xs">
                  <span className="font-caption text-caption text-text-secondary w-12">{bar.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: bar.width }} />
                  </div>
                  <span className="font-caption text-caption text-text-primary w-9 text-right">{bar.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center pt-2 pb-1">
          <h2 className="font-heading-md text-heading-md text-text-primary">Rate your experience</h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-[360px] mx-auto">
            How was this deal{deal?.business ? ` at ${deal.business}` : ''}?
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 mt-2 mb-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                aria-label={value === 1 ? 'Rate 1 star' : `Rate ${value} stars`}
                type="button"
                onClick={() => setRating(value)}
                className="transition-transform hover:scale-110 focus:outline-none p-1"
              >
                <Icon
                  name="star"
                  filled={value <= rating}
                  className={`text-[32px] ${value <= rating ? 'text-tertiary' : 'text-text-tertiary'}`}
                />
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-tertiary-fixed px-3 py-1 rounded-full">
            <Icon name="sentiment_very_satisfied" className="text-tertiary text-[15px]" filled />
            <span className="font-label-sm text-label-sm text-on-tertiary-fixed">{SCORE_LABELS[rating]}</span>
          </div>
        </div>

        <div>
          <p className="font-label-sm text-label-sm text-text-secondary mb-space-xs">What stood out most?</p>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_PILLS.map((pill, index) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => togglePill(index)}
                className={
                  selectedPills[index]
                    ? 'px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1.5 bg-surface-tint-blue text-primary'
                    : 'px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1.5 bg-surface-subtle text-text-secondary hover:bg-surface-container-low'
                }
              >
                <span>{pill.label}</span>
                <span>{pill.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="review-modal-text">
              Tell others about your experience
            </label>
            <span className="font-caption text-caption text-text-tertiary">{reviewText.length} / 500</span>
          </div>
          <div className="relative bg-surface-subtle rounded-xl p-space-sm focus-within:bg-surface-canvas focus-within:shadow-[0_0_0_2px_#066cf4] transition-all">
            <textarea
              className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none"
              id="review-modal-text"
              maxLength={500}
              placeholder="Share details of your visit, food quality, or customer service. Helpful reviews help other VEMTAP shoppers..."
              rows={3}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
            />
          </div>
        </div>

        {!feed.signedIn ? (
          <div>
            <label className="font-label-sm text-label-sm text-text-secondary mb-1.5 block" htmlFor="review-modal-name">Your name</label>
            <input
              id="review-modal-name"
              autoComplete="name"
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-surface-subtle rounded-xl px-space-sm py-2.5 font-body-md text-body-md text-text-primary focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4]"
            />
          </div>
        ) : null}

        <div className="space-y-space-sm pt-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
              Recent reviews
            </span>
            <span className="font-caption text-caption text-text-secondary">{feed.loading ? '…' : `${feed.total} review${feed.total === 1 ? '' : 's'}`}</span>
          </div>

          {feed.loading && displayReviews.length === 0 ? (
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
          ) : displayReviews.length === 0 ? (
            <div className="bg-surface-subtle p-space-md rounded-xl text-text-secondary text-body-md">
              There are no reviews for this deal yet. Be the first to rate it.
            </div>
          ) : (
            displayReviews.map((review) => (
              <article
                key={review.id}
                className="bg-surface-subtle p-space-md rounded-xl space-y-space-sm shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 bg-surface-container-high text-primary"
                    >
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
                      onClick={() => void toggleHelpful(review.id)}
                      aria-pressed={review.isLiked}
                      className={`flex items-center gap-1 px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-medium transition-colors ${
                        review.isLiked
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : 'bg-surface-canvas hover:bg-surface-container-low text-text-primary'
                      }`}
                    >
                      <Icon
                        name="thumb_up"
                        filled={review.isLiked}
                        className={`text-[16px] ${review.isLiked ? 'text-badge-discount-text' : 'text-primary'}`}
                      />
                      <span>{review.likesCount}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="p-space-lg pt-space-sm border-t border-border-subtle space-y-space-sm bg-surface-canvas">
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
              ? 'w-full h-[52px] bg-badge-discount-text text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] transition-all disabled:opacity-50'
              : 'w-full h-[52px] bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] transition-all disabled:opacity-50'
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
    </DesktopModal>
  );
}
