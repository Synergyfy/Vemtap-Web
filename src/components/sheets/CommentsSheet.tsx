import { useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';
import { SheetShell } from './SheetShell';
import { reviewTimeLabel, reviewerInitials, useDealReviews } from '../../hooks/useDealReviews';

export interface CommentsSheetProps {
  open: boolean;
  onClose: () => void;
  deal?: {
    id?: string | number;
    title?: string;
    business?: string;
    location?: string;
    price?: number | string;
  } | null;
}

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😍', '🤤'];

/** Comment like — saved through `POST /deals/:id/reviews/:reviewId/like`. */
function LikeButton({ label, size, liked, onToggle }: { label: string; size: string; liked: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={label}
      aria-pressed={liked}
      type="button"
      onClick={onToggle}
      className="p-1.5 rounded-full text-text-tertiary hover:text-error active:scale-125 transition-transform flex flex-col items-center"
    >
      <Icon name="favorite" filled={liked} className={`${size} transition-colors ${liked ? 'text-error' : ''}`} />
    </button>
  );
}

/**
 * Deal comments — live from `GET /deals/:id/reviews`, posted with `POST /deals/:id/reviews`
 * (`comment`, plus `name` when signed out). Nothing here is stand-in data.
 */
export function CommentsSheet({ open, onClose, deal }: CommentsSheetProps) {
  const feed = useDealReviews(deal?.id, open);
  const [draft, setDraft] = useState('');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const postComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || feed.submitting) return;
    const result = await feed.submit(draft, undefined, feed.signedIn ? undefined : name);
    if (!result.ok) {
      setNotice({ kind: 'error', text: result.message });
      return;
    }
    setDraft('');
    setNotice(result.pending ? { kind: 'info', text: 'Thanks! Your comment will appear once the business approves it.' } : null);
  };

  const toggleLike = async (reviewId: string) => {
    const message = await feed.toggleLike(reviewId);
    if (message) setNotice({ kind: 'error', text: message });
  };

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>

      <div className="px-margin pt-2 pb-3 flex items-center justify-between border-none">
        <div className="flex items-center gap-2">
          <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold tracking-tight">Comments</h2>
          <span className="bg-surface-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm text-primary font-bold">
            {feed.loading ? '…' : feed.total}
          </span>
        </div>
        <button
          aria-label="Close comments modal"
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-subtle text-text-secondary active:scale-95 transition-transform"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {deal?.title || deal?.business ? (
        <div className="px-margin pb-3">
          <div className="flex items-center justify-between bg-surface-tint-blue px-3.5 py-2.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon name="local_offer" className="text-primary text-[20px] shrink-0" />
              <div className="min-w-0">
                {deal.title ? <p className="font-label-sm text-label-sm text-primary font-semibold truncate">{deal.title}</p> : null}
                {deal.business || deal.location ? (
                  <p className="font-caption text-caption text-secondary truncate">{[deal.business, deal.location].filter(Boolean).join(' • ')}</p>
                ) : null}
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-badge-discount-text font-bold bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
              Active
            </span>
          </div>
        </div>
      ) : null}

      <div className="px-margin pt-2 pb-4 space-y-5">
        {feed.loading && feed.reviews.length === 0 ? (
          [0, 1, 2].map((key) => (
            <div key={key} role="status" aria-busy="true" className="flex items-start gap-3">
              <span className="sr-only">Loading comments</span>
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : feed.loadError ? (
          <div className="flex items-center justify-between gap-3 font-body-md text-body-md text-error">
            <span>Couldn’t load comments.</span>
            <button type="button" onClick={() => void feed.reload()} className="font-semibold underline">Retry</button>
          </div>
        ) : feed.reviews.length === 0 ? (
          <p className="font-body-md text-body-md text-text-secondary text-center py-4">No comments yet. Be the first to say something.</p>
        ) : (
          feed.reviews.map((comment) => (
            <article key={comment.id} className="flex flex-col gap-3">
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0 shadow-sm">
                  <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                    {reviewerInitials(comment.reviewerName)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-label-md text-label-md font-bold text-on-surface">{comment.reviewerName}</span>
                    {comment.rating != null ? (
                      <span className="inline-flex items-center gap-0.5 font-caption text-caption text-tertiary-container" aria-label={`${comment.rating} out of 5 stars`}>
                        <Icon name="star" filled className="text-[13px]" />
                        {comment.rating}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">{comment.comment}</p>
                  <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
                    <span>{reviewTimeLabel(comment.createdAt)}</span>
                    <span className="font-medium text-text-primary">
                      {comment.likesCount} like{comment.likesCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
                <LikeButton label={comment.isLiked ? 'Unlike comment' : 'Like comment'} size="text-[20px]" liked={comment.isLiked} onToggle={() => void toggleLike(comment.id)} />
              </div>

              {comment.merchantReply ? (
                <div className="ml-11 pl-3 bg-surface-subtle/80 rounded-2xl p-3 flex items-start gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary shrink-0 shadow-sm flex items-center justify-center text-on-primary">
                    <Icon name="storefront" className="text-[16px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface">{deal?.business ?? 'The business'}</span>
                      <span className="inline-flex items-center gap-0.5 bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                        <Icon name="verified" className="text-[12px] text-primary" filled />
                        Owner
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">{comment.merchantReply}</p>
                  </div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      <div className="sticky bottom-0 z-10 bg-surface-canvas">
        <div className="px-margin pt-2 pb-1.5 flex items-center justify-between bg-surface-canvas">
          <div className="flex items-center justify-around w-full max-w-sm mx-auto">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setDraft((prev) => prev + emoji)}
                className="text-2xl active:scale-125 transition-transform p-1 hover:bg-surface-subtle rounded-full"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-canvas px-margin pt-2 pb-5 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] space-y-2">
          {feed.offerId ? (
            <form className="flex flex-col gap-2" onSubmit={(event) => void postComment(event)}>
              {!feed.signedIn ? (
                <input
                  aria-label="Your name"
                  autoComplete="name"
                  maxLength={60}
                  className="w-full bg-surface-subtle rounded-full px-4 py-2 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              ) : null}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-fixed shrink-0 ring-2 ring-primary/20 flex items-center justify-center text-primary">
                  <Icon name="person" className="text-[20px]" />
                </div>
                <div className="flex-1 flex items-center bg-surface-subtle rounded-full px-4 py-1.5 focus-within:bg-surface-tint-blue focus-within:shadow-[0_0_0_2px_rgba(6,108,244,0.3)] transition-all">
                  <input
                    autoComplete="off"
                    aria-label="Your comment"
                    maxLength={1000}
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none py-1"
                    placeholder={deal?.business ? `Add a comment for ${deal.business}...` : 'Add a comment...'}
                    type="text"
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setNotice(null);
                    }}
                  />
                </div>
                <button
                  className="h-10 px-4 rounded-full bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold active:scale-95 shadow-[0_4px_14px_rgba(6,108,244,0.35)] transition-all flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary-container disabled:opacity-50"
                  type="submit"
                  disabled={!draft.trim() || feed.submitting}
                >
                  {feed.submitting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          ) : (
            <p className="font-caption text-caption text-text-secondary text-center">Comments aren’t available for this deal.</p>
          )}
          {notice ? (
            <p role={notice.kind === 'error' ? 'alert' : 'status'} className={`font-caption text-caption ${notice.kind === 'error' ? 'text-error' : 'text-badge-discount-text'}`}>
              {notice.text}
            </p>
          ) : null}
        </div>
      </div>
    </SheetShell>
  );
}
