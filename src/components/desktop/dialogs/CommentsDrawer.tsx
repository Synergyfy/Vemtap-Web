import { useMemo, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { Skeleton } from '../../ui/Skeleton';
import { parsePrice } from '../../../utils/format';
import { DesktopDrawer } from '../DesktopModal';
import { reviewTimeLabel, reviewerInitials, useDealReviews } from '../../../hooks/useDealReviews';
import type { ClaimDealSummary } from './ClaimIdentityModal';

export interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
  deal?: ClaimDealSummary | null;
}

/**
 * Deal discussion — live from `GET /deals/:id/reviews`, posted with `POST /deals/:id/reviews`,
 * likes via `POST /deals/:id/reviews/:reviewId/like`. Nothing here is stand-in data.
 */
export function CommentsDrawer({ open, onClose, onClaim, deal }: CommentsDrawerProps) {
  const merchantName = deal?.business?.trim() || 'This business';
  const dealTitle = deal?.title?.trim() || 'this deal';
  const dealPrice = parsePrice(deal?.price);
  const feed = useDealReviews(deal?.id, open);
  const [draft, setDraft] = useState('');
  const [name, setName] = useState('');
  const [sort, setSort] = useState<'helpful' | 'latest'>('helpful');
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const comments = useMemo(() => {
    const list = [...feed.reviews];
    if (sort === 'helpful') list.sort((a, b) => b.likesCount - a.likesCount);
    else list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    return list;
  }, [feed.reviews, sort]);

  const handlePostComment = async () => {
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
    <DesktopDrawer open={open} onClose={onClose}>
      <div className="px-space-lg py-space-md bg-surface-canvas shadow-[0_1px_6px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-space-xs">
            <Icon name="forum" className="text-primary-container text-[22px]" />
            <h2 className="font-heading-sm text-heading-sm text-on-surface tracking-tight">Community Discussion</h2>
            <span className="bg-surface-container-high text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
              {feed.loading ? '…' : feed.total}
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary">Ask questions about {dealTitle.toLowerCase()} and {merchantName}.</p>
        </div>
        <button
          type="button"
          aria-label="Close Drawer"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="px-space-lg py-space-xs bg-surface-subtle flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          {(['helpful', 'latest'] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => setSort(key)}
              className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-all ${
                sort === key ? 'font-semibold bg-surface-tint-blue text-primary shadow-xs' : 'font-medium text-text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {key === 'helpful' ? 'Most Helpful' : 'Latest'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-space-lg bg-surface-canvas shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-space-sm">
        {feed.offerId ? (
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
              <Icon name="person" className="text-[20px]" />
            </div>
            <div className="flex-1 space-y-space-xs">
              {!feed.signedIn ? (
                <input
                  aria-label="Your name"
                  autoComplete="name"
                  maxLength={60}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full bg-surface-subtle rounded-xl px-space-sm py-2 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
                />
              ) : null}
              <div className="relative bg-surface-subtle rounded-xl p-space-sm focus-within:bg-surface-canvas focus-within:shadow-md transition-all">
                <textarea
                  aria-label="Your comment"
                  maxLength={1000}
                  className="w-full bg-transparent border-0 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none resize-none"
                  placeholder="Add a public comment or ask a question..."
                  rows={2}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setNotice(null);
                  }}
                />
                <div className="flex items-center justify-between pt-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      title="Insert Emoji"
                      aria-label="Insert Emoji"
                      className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-on-surface transition-colors"
                      onClick={() => setDraft((value) => `${value} 😊`)}
                    >
                      <Icon name="sentiment_satisfied" className="text-[18px]" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={!draft.trim() || feed.submitting}
                    onClick={() => void handlePostComment()}
                    className="h-9 px-space-md bg-primary-container hover:bg-primary active:scale-95 text-on-primary font-button-secondary text-button-secondary rounded-lg transition-transform flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{feed.submitting ? 'Posting…' : 'Post Comment'}</span>
                    <Icon name="send" className="text-[16px]" />
                  </button>
                </div>
              </div>
              {notice ? (
                <p role={notice.kind === 'error' ? 'alert' : 'status'} className={`font-caption text-caption px-1 ${notice.kind === 'error' ? 'text-error' : 'text-badge-discount-text'}`}>
                  {notice.text}
                </p>
              ) : (
                <p className="font-caption text-caption text-text-tertiary px-1">Visible to everyone viewing this deal on VEMTAP.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="font-caption text-caption text-text-secondary">Comments aren’t available for this deal.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-space-lg py-space-sm space-y-space-lg">
        {feed.loading && feed.reviews.length === 0 ? (
          [0, 1, 2].map((key) => (
            <div key={key} role="status" aria-busy="true" className="bg-surface-subtle p-space-md rounded-xl space-y-2">
              <span className="sr-only">Loading comments</span>
              <div className="flex items-center gap-space-sm">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))
        ) : feed.loadError ? (
          <div className="flex items-center justify-between gap-3 font-body-md text-body-md text-error">
            <span>Couldn’t load comments.</span>
            <button type="button" onClick={() => void feed.reload()} className="font-semibold underline">Retry</button>
          </div>
        ) : comments.length === 0 ? (
          <p className="font-body-md text-body-md text-text-secondary text-center py-space-lg">No comments yet. Be the first to ask or share.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="bg-surface-subtle p-space-md rounded-xl space-y-space-sm shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-bold flex items-center justify-center">
                    {comment.reviewerAvatar ? (
                      <img className="w-full h-full rounded-full object-cover bg-surface-canvas" alt="" src={comment.reviewerAvatar} />
                    ) : (
                      reviewerInitials(comment.reviewerName)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{comment.reviewerName}</span>
                      {comment.rating != null ? (
                        <span className="inline-flex items-center gap-0.5 font-caption text-caption text-tertiary-container" aria-label={`${comment.rating} out of 5 stars`}>
                          <Icon name="star" filled className="text-[13px]" />
                          {comment.rating}
                        </span>
                      ) : null}
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">{reviewTimeLabel(comment.createdAt)}</span>
                  </div>
                </div>
              </div>

              <p className="font-body-md text-body-md text-on-surface break-words whitespace-pre-line">{comment.comment}</p>

              <div className="flex items-center gap-space-xs pt-space-2xs">
                <button
                  type="button"
                  aria-pressed={comment.isLiked}
                  aria-label={comment.isLiked ? 'Unlike comment' : 'Like comment'}
                  onClick={() => void toggleLike(comment.id)}
                  className={`flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-canvas hover:bg-surface-container font-label-sm text-label-sm shadow-2xs transition-colors ${comment.isLiked ? 'text-error' : 'text-text-secondary'}`}
                >
                  <span>❤️</span>
                  <span className="font-semibold">{comment.likesCount}</span>
                </button>
              </div>

              {comment.merchantReply ? (
                <div className="bg-surface-canvas rounded-lg p-space-sm ml-space-xs shadow-2xs space-y-space-2xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="storefront" className="text-[16px] text-primary-container" />
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">{merchantName}</span>
                    <span className="bg-surface-tint-blue text-primary font-caption text-caption px-1.5 py-0.5 rounded-full font-semibold">Business reply</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant break-words">{comment.merchantReply}</p>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      <div className="px-space-lg py-space-md bg-surface-canvas shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-space-md">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm font-semibold">
            <Icon name="bolt" className="text-[16px]" />
            <span>Claiming this deal?</span>
          </div>
          <p className="font-caption text-caption text-text-secondary truncate">{merchantName}</p>
        </div>
        <button
          type="button"
          onClick={onClaim}
          className="h-11 px-space-md bg-primary-container hover:bg-primary active:scale-95 text-on-primary font-button-primary text-button-primary rounded-xl flex items-center gap-space-xs shrink-0 shadow-md transition-all"
        >
          <span>
            {dealPrice > 0
              ? `Claim Deal (${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(dealPrice)})`
              : 'Claim Deal'}
          </span>
        </button>
      </div>
    </DesktopDrawer>
  );
}
