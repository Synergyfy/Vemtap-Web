import { useEffect, useRef, useState } from 'react';
import { reviewService } from '../../../services';
import { Icon } from '../../ui/Icon';
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

const FEEDBACK_PILLS: { label: string; emoji: string; initiallySelected: boolean }[] = [
  { label: 'Great Portions', emoji: '👍', initiallySelected: true },
  { label: 'Fast Service', emoji: '⚡', initiallySelected: true },
  { label: 'Easy QR Redemption', emoji: '✨', initiallySelected: true },
  { label: 'Friendly Staff', emoji: '😊', initiallySelected: false },
  { label: 'Great Ambiance', emoji: '🌿', initiallySelected: false },
];

const INITIAL_PHOTOS = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIcp8g6m4P-jpz-POl_vIPvofIJ5zmrfVVqpTJwWoXYFQfD6_ugqaCe0eTwSYzec2EdPaj12Vo0DAEl4gX42JDDWhFHkTokDPlatIggmrHEbTp8l4jQE-t25Iu516mrZQSjRoZy5ZtvNYN0QN88zYnzNePTU-WXN-mVdGJPALx83XYYDNOzpy4T-zXpSH_kbfgGI6xr8NvY3TfP3z0evD1tf3MIzPCQNNXwZdWQVjMFbgQIs0VgWzkxg',
    alt: 'Top down overhead food photography of a juicy grilled craft burger and golden shoestring fries inside modern minimalist setting',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqjFW9d1vN3UrttqPqORh7WuVKcp03-f0Mhj7AtnYMuvWtUx9MiQxYaCfRKSkjmXhyuWi59RtQWheizn7WMmpXxPHyh1nAnrXSNW3or6Ro5kGIzmTmI5e52FO9ukXIRNq1TUSifXn3Tj-80OYNZRdYvou5-cv2NQ2Cpt40fKH-iT_52cPD-aBOvmpXZUPbioEtUuGZrwer5assrCQYZVQ_Tzr8Tus2zv6c0xA495cQ3XVmvKdW_lr_iw',
    alt: 'Bright table setup showing artisan lemon iced beverage with paper straw alongside seasoned rustic potato wedges in restaurant setting',
  },
];

const RATING_BARS: Array<{ label: string; width: string; value: string }> = [
  { label: '5 star', width: '80%', value: '80%' },
  { label: '4 star', width: '12%', value: '12%' },
  { label: '3 star', width: '4%', value: '4%' },
  { label: '2 star', width: '2%', value: '2%' },
  { label: '1 star', width: '2%', value: '2%' },
];

interface ReviewCard {
  id: string;
  initials: string;
  avatarClass: string;
  name: string;
  meta: string;
  rating: string;
  badge: string;
  date: string;
  body: string;
  helpful: number;
  comments?: number;
}

const pickString = (source: Record<string, unknown> | undefined, keys: string[]): string => {
  if (!source) return '';
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const pickNumber = (source: Record<string, unknown> | undefined, keys: string[]): number => {
  if (!source) return 0;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

const buildInitials = (value: string): string => {
  const words = value.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) return 'V';
  return words.map((word) => word[0]?.toUpperCase() ?? '').join('').slice(0, 2);
};

const normalizeReviewCard = (record: Record<string, unknown>, index: number): ReviewCard => {
  const author = pickString(record, ['authorName', 'customerName', 'userName', 'name']) || `Verified customer ${index + 1}`;
  const body = pickString(record, ['comment', 'message', 'content', 'review', 'text', 'body']) || 'Helpful review from a verified customer.';
  const ratingValue = pickNumber(record, ['rating', 'score', 'stars']) || 5;
  const createdAt = pickString(record, ['createdAt', 'created_at', 'updatedAt', 'reviewedAt', 'date']) || new Date().toISOString();
  const helpful = pickNumber(record, ['helpfulCount', 'likes', 'likeCount']) || 0;
  const comments = pickNumber(record, ['commentsCount', 'commentCount']) || undefined;

  return {
    id: String(pickString(record, ['id', '_id', 'reviewId']) || `review-${index}`),
    initials: buildInitials(author),
    avatarClass: index % 2 === 0 ? 'bg-surface-container-high text-primary' : 'bg-secondary-container text-on-secondary-container',
    name: author,
    meta: pickString(record, ['customerMeta', 'location', 'verifiedLabel']) || 'Verified Patron',
    rating: `${ratingValue.toFixed(1)}`,
    badge: pickString(record, ['badge', 'status']) || 'Verified Purchase',
    date: createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    body,
    helpful,
    comments,
  };
};

const toReviewCards = (payload: unknown): ReviewCard[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object').map((item, index) => normalizeReviewCard(item, index));
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['reviews', 'items', 'results', 'data', 'rows', 'list']) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object').map((item, index) => normalizeReviewCard(item, index));
      }
    }
  }

  return [];
};

export function ReviewsModal({ open, onClose, deal }: ReviewsModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedPills, setSelectedPills] = useState<boolean[]>(FEEDBACK_PILLS.map((pill) => pill.initiallySelected));
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [status, setStatus] = useState<'idle' | 'publishing' | 'published'>('idle');
  const [helpfulOn, setHelpfulOn] = useState<Record<string, boolean>>({});
  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const timers = useRef<Array<number>>([]);
  const offerId = deal?.id ? String(deal.id) : '';

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!open || !offerId) {
      setReviews([]);
      return () => {
        active = false;
      };
    }

    const loadReviews = async () => {
      try {
        const next = await reviewService.listByOffer(offerId);
        if (!active) return;
        setReviews(toReviewCards(next));
      } catch {
        if (active) setReviews([]);
      }
    };

    void loadReviews();

    return () => {
      active = false;
    };
  }, [open, offerId]);

  useEffect(() => {
    if (!open) {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
      setStatus('idle');
      setRating(5);
      setReviewText('');
      setPhotos(INITIAL_PHOTOS);
      setSelectedPills(FEEDBACK_PILLS.map((pill) => pill.initiallySelected));
      setHelpfulOn({});
    }
  }, [open]);

  const togglePill = (index: number) => {
    setSelectedPills((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  const toggleHelpful = (id: string) => {
    setHelpfulOn((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const submitReview = async () => {
    if (status !== 'idle' || !offerId || !reviewText.trim()) return;
    setStatus('publishing');
    try {
      await reviewService.create(offerId, {
        rating,
        comment: reviewText.trim(),
        tags: FEEDBACK_PILLS.filter((_, index) => selectedPills[index]).map((pill) => pill.label),
      });
      const refreshed = await reviewService.listByOffer(offerId);
      setReviews(toReviewCards(refreshed));
      setStatus('published');
      timers.current.push(window.setTimeout(() => setStatus('idle'), 1200));
    } catch {
      setStatus('idle');
    }
  };

  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : 4.8;
  const displayReviews = reviews.length ? reviews : [];

  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-center justify-between gap-space-md p-space-lg border-b border-border-subtle">
        <div className="flex flex-col gap-space-2xs">
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary w-fit">
            <Icon name="verified" className="text-[14px]" filled />
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              Verified Redemption Review
            </span>
          </span>
          <h4 className="font-heading-sm text-heading-sm text-text-primary">Reviews &amp; Ratings</h4>
        </div>
        <ModalCloseButton onClose={onClose} label="Close review dialog" />
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-space-lg space-y-space-md">
        <div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="Close up crisp shot of freshly grilled brioche cheeseburger paired with golden shoestring fries inside modern minimalist setting"
              src={deal?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFqqLNHhuH9W4IdXGLvTW2t2YDrv9cGefs5r2XEK9XKSaeiyeyogGmSomgI0WgkZnhIPh88NCQm1KW8X_0qAkYf_D06yF-MZzuawfnUA21eQASoFq6TokITjG974O9jkTancNVbKCf0lb5FLwh5FeoTYhctib3ilk2a7ORd69-WnT7dQrPAmS_wkMjTbJNzYkaCZJ1M4FgMmziz_oSrRium3sj4BWwXp8p9IFfD0BtTXtOXdVJKbGQfQ'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-sm text-label-sm text-text-secondary truncate">{deal?.business || 'Local dining partner'}</p>
            <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{deal?.title || 'Featured local deal'}</h3>
            <div className="flex items-center gap-1 font-caption text-caption text-badge-discount-text mt-0.5">
              <Icon name="check_circle" className="text-[13px]" filled />
              <span>{deal?.location || 'Redeemed today'}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-subtle p-space-md rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
            <div className="flex flex-col items-center sm:items-start bg-surface-canvas rounded-xl p-space-sm shadow-xs sm:w-48 shrink-0">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-heading-lg text-heading-lg text-text-primary leading-none">{averageRating.toFixed(1)}</span>
                <span className="font-caption text-caption text-text-tertiary">/ 5.0</span>
              </div>
              <div className="flex items-center gap-0.5 my-space-xs text-tertiary">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Icon key={value} name="star" filled={value <= Math.round(averageRating)} className="text-[18px]" />
                ))}
              </div>
              <p className="font-caption text-caption text-text-secondary leading-snug text-center sm:text-left">
                Based on <strong className="text-text-primary font-semibold">{displayReviews.length} verified customer ratings</strong>{' '}
                in your area
              </p>
              <div className="mt-space-xs w-full flex items-center justify-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-sm py-space-2xs rounded-lg">
                <Icon name="thumb_up" className="text-[16px]" />
                <span className="font-label-sm text-label-sm font-semibold">{displayReviews.length ? 'Local shoppers recommend this' : 'Be the first to review this deal'}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-space-xs">
              {RATING_BARS.map((bar) => (
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
            How was your meal and redemption at this local merchant?
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

        <div>
          <p className="font-label-sm text-label-sm text-text-secondary mb-2">Add photos of your meal (optional)</p>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-surface-subtle text-primary hover:bg-surface-tint-blue transition-colors flex-shrink-0 group"
            >
              <Icon name="add_a_photo" className="text-[26px] group-active:scale-110 transition-transform" />
              <span className="font-caption text-caption mt-1">Add Photo</span>
            </button>
            {photos.map((photo) => (
              <div key={photo.src} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <img className="w-full h-full object-cover" alt={photo.alt} src={photo.src} />
                <button
                  aria-label="Remove photo"
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((item) => item.src !== photo.src))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-inverse-surface/80 text-on-primary flex items-center justify-center"
                >
                  <Icon name="close" className="text-[13px]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-space-sm pt-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
              Recent verified reviews
            </span>
            <span className="font-caption text-caption text-text-secondary">{displayReviews.length} review{displayReviews.length === 1 ? '' : 's'}</span>
          </div>

          {displayReviews.length === 0 ? (
            <div className="bg-surface-subtle p-space-md rounded-xl text-text-secondary text-body-md">
              There are no verified reviews for this deal yet. Be the first to rate it.
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 ${review.avatarClass}`}
                    >
                      {review.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">{review.name}</span>
                        <Icon name="verified" className="text-primary text-[16px]" filled />
                        <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-1.5 py-0.5 rounded-full font-semibold">
                          {review.badge}
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-tertiary">{review.meta}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-tertiary shrink-0">
                    <Icon name="star" className="text-[16px]" filled />
                    <span className="font-label-md text-label-md font-bold text-text-primary">{review.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
                  <Icon name="calendar_today" className="text-[14px]" />
                  <span>{review.date}</span>
                </div>

                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{review.body}</p>

                <div className="flex items-center justify-between gap-space-sm pt-space-2xs">
                  <span className="font-caption text-caption text-text-tertiary">Was this review helpful?</span>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => toggleHelpful(review.id)}
                      aria-pressed={Boolean(helpfulOn[review.id])}
                      className={`flex items-center gap-1 px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-medium transition-colors ${
                        helpfulOn[review.id]
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : 'bg-surface-canvas hover:bg-surface-container-low text-text-primary'
                      }`}
                    >
                      <Icon
                        name="thumb_up"
                        filled={Boolean(helpfulOn[review.id])}
                        className={`text-[16px] ${helpfulOn[review.id] ? 'text-badge-discount-text' : 'text-primary'}`}
                      />
                      <span>{review.helpful + (helpfulOn[review.id] ? 1 : 0)}</span>
                    </button>
                    {typeof review.comments === 'number' ? (
                      <span className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-canvas text-text-secondary font-label-sm text-label-sm font-medium">
                        <Icon name="chat_bubble_outline" className="text-[16px]" />
                        <span>{review.comments}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="p-space-lg pt-space-sm border-t border-border-subtle space-y-space-sm bg-surface-canvas">
        <button
          type="button"
          onClick={submitReview}
          className={
            status === 'published'
              ? 'w-full h-[52px] bg-badge-discount-text text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] transition-all'
              : 'w-full h-[52px] bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] transition-all'
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
            Reviews are verified by VEMTAP digital receipts and displayed on the business profile to support your local
            neighborhood.
          </p>
        </div>
      </div>
    </DesktopModal>
  );
}
