import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { reviewService } from '../../services';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

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

interface PostedComment {
  id: number;
  text: string;
}

const toSheetComments = (payload: unknown): PostedComment[] => {
  if (!Array.isArray(payload)) return [];

  return payload.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return { id: index + 1, text: 'Helpful review from a verified customer.' };
    }

    const entry = item as Record<string, unknown>;
    const text = typeof entry.comment === 'string'
      ? entry.comment
      : typeof entry.message === 'string'
        ? entry.message
        : 'Helpful review from a verified customer.';

    return {
      id: Number(entry.id ?? index + 1),
      text,
    };
  });
};

function LikeButton({ label, size }: { label: string; size: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <button
      aria-label={label}
      type="button"
      onClick={() => setLiked((value) => !value)}
      className="p-1.5 rounded-full text-text-tertiary hover:text-error active:scale-125 transition-transform flex flex-col items-center"
    >
      <Icon
        name="favorite"
        filled={liked}
        className={`${size} transition-colors ${liked ? 'text-error' : ''}`}
      />
    </button>
  );
}

export function CommentsSheet({ open, onClose, deal }: CommentsSheetProps) {
  const [draft, setDraft] = useState('');
  const [posted, setPosted] = useState<PostedComment[]>([]);
  const [loadedComments, setLoadedComments] = useState<PostedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const offerId = deal?.id ? String(deal.id) : '';

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!open || !offerId) {
        setLoadedComments([]);
        return;
      }

      try {
        setLoading(true);
        const next = await reviewService.listByOffer(offerId);
        if (!ignore) {
          setLoadedComments(toSheetComments(next));
        }
      } catch {
        if (!ignore) setLoadedComments([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [open, offerId]);

  const postComment = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !offerId) return;

    try {
      await reviewService.create(offerId, { rating: 5, comment: text, tags: ['Community comment'] });
      const refreshed = await reviewService.listByOffer(offerId);
      setLoadedComments(toSheetComments(refreshed));
      setDraft('');
    } catch {
      setPosted((prev) => [...prev, { id: Date.now(), text }]);
      setDraft('');
    }
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
            {loadedComments.length}
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

      <div className="px-margin pb-3">
        <div className="flex items-center justify-between bg-surface-tint-blue px-3.5 py-2.5 rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon name="lunch_dining" className="text-primary text-[20px] shrink-0" />
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm text-primary font-semibold truncate">Lunch Combo — 20% Off</p>
              <p className="font-caption text-caption text-secondary truncate">Urban Grill &amp; Bistro • Abuja, NG</p>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-badge-discount-text font-bold bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
            Active
          </span>
        </div>
      </div>

      <div className="px-margin pt-2 pb-4 space-y-5">
        {loading ? <p className="font-body-md text-body-md text-text-secondary">Loading discussion…</p> : null}
        {loadedComments.length ? loadedComments.map((comment) => (
          <article key={comment.id} className="flex items-start gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0 shadow-sm">
              <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                Y
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-label-md text-label-md font-bold text-on-surface">You</span>
                <span className="font-caption text-caption text-text-tertiary">@you</span>
              </div>
              <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">{comment.text}</p>
              <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
                <span>Just now</span>
                <span className="font-medium text-text-primary">0 likes</span>
                <button type="button" className="font-semibold text-text-secondary">Reply</button>
              </div>
            </div>
            <LikeButton label="Like comment" size="text-[20px]" />
          </article>
        )) : null}
        <article className="flex items-start gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0 shadow-sm">
            <img
              className="w-full h-full object-cover"
              alt="Portrait photo of a stylish young Nigerian man smiling warmly with stylish eyeglasses, wearing a casual navy polo shirt against clean soft background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBow__SLkkc3clmtWfb2JZ-jIHqV3oalIi5TDrnAznOBwkBrz_PRX3cILYiX1Hqg9C0MLcrFoJFhz5dRhi37Ol6UHaOPaBE0TaWdkdUUofuc88N-r-1BwEsW3Zx86VWgUxt18DQ35oIBNPezazp4SzXNCCAN2ZQxSl5gC8beF4ttl4DFljEGLycF8fLxwSQVaFbE9Ol6MFeIfozAZOdA9pWctmm349ZorFl-dZ7e7dwZE7dv2gsBnP5DQ"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-label-md text-label-md font-bold text-on-surface">Samuel A.</span>
              <span className="font-caption text-caption text-text-tertiary">@sam_adeleke</span>
            </div>
            <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">
              Just claimed this yesterday! The burger is massive and the fries were super fresh. Definitely worth the
              ₦9,600 🔥
            </p>
            <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
              <span>2h ago</span>
              <span className="font-medium text-text-primary">14 likes</span>
              <button
                type="button"
                className="font-semibold text-text-secondary hover:text-primary active:scale-95 transition-all"
              >
                Reply
              </button>
            </div>
          </div>
          <LikeButton label="Like comment" size="text-[20px]" />
        </article>

        <article className="flex flex-col gap-3">
          <div className="flex items-start gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0 shadow-sm">
              <img
                className="w-full h-full object-cover"
                alt="Close up lifestyle portrait of a happy smiling woman in a yellow sundress sitting at a sunny cafe terrace with braided hairstyle"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaU82xbNW3ebz8VgpiaMvEgTjNLc5NFA3jjdtwiEgqmMTJzaXYOT5cAO0A0E8oO6oCZtNMO6gdelfoqZhYR8U9qv1uRnkC6AzzOSw2RQOfPCX_DV4Meyz6gDXcKQg1Fbm3sh1BTNro0QAtWKrvczfWtP1l6zswlyHMV_C7fVs_wuz-UdQXfgjp-3_G9A5fckdAeOtWkkGTUH4o_LiAEx9Nd4yZw2sDZYjSbAaBuGMTyF3U_PVffUFPPA"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-label-md text-label-md font-bold text-on-surface">Chioma N.</span>
                <span className="font-caption text-caption text-text-tertiary">@chioma_eats</span>
              </div>
              <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">
                Can this voucher be used on Sunday afternoon or strictly weekdays?
              </p>
              <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
                <span>5h ago</span>
                <span className="font-medium text-text-primary">3 likes</span>
                <button
                  type="button"
                  className="font-semibold text-text-secondary hover:text-primary active:scale-95 transition-all"
                >
                  Reply
                </button>
              </div>
            </div>
            <LikeButton label="Like comment" size="text-[20px]" />
          </div>

          <div className="ml-11 pl-3 bg-surface-subtle/80 rounded-2xl p-3 flex items-start gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary shrink-0 shadow-sm">
              <img
                className="w-full h-full object-cover"
                alt="High contrast professional restaurant brand logo featuring a stylized flame and grill fork in crisp clean deep blue and white"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlDzMcKnfv-WwNWHN1AhQJo5KBJqfX1lCfcMQPg_3SJJRyfn6oPFBxFjX9okiA-UbWUyZGjeyBQG19tkD6nzz5k8n7A0Kcn_IyHh8A2rH74zudz48c_g8csrwsonKShoOTFjzphppN-myomrhBOoLP4iwnBPnwZkmniVNV4erUhjpY4E-TVMSYHcXXbxRfWJQmt-UxeQOQlMP0_yIACTolADnoAffoCrFtfp-ScuGf_Wzplc5uX9WC0Q"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="font-label-sm text-label-sm font-bold text-on-surface">Urban Grill &amp; Bistro</span>
                <span className="inline-flex items-center gap-0.5 bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Icon name="verified" className="text-[12px] text-primary" filled />
                  Owner
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">
                <span className="text-primary font-semibold">@chioma_eats</span> Hi Chioma! This lunch deal is valid
                Monday to Friday 12 PM - 4 PM. We hope to host you!
              </p>
              <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
                <span>3h ago</span>
                <span className="font-medium text-text-primary">6 likes</span>
                <button
                  type="button"
                  className="font-semibold text-text-secondary hover:text-primary active:scale-95 transition-all"
                >
                  Reply
                </button>
              </div>
            </div>
            <LikeButton label="Like reply" size="text-[18px]" />
          </div>
        </article>

        <article className="flex items-start gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0 shadow-sm">
            <img
              className="w-full h-full object-cover"
              alt="Outdoor profile photo of an African professional man wearing a smart collared shirt standing against a modern urban architectural facade"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaaIV2M2OHI0ipauQo3aquKiOmVbxDYVH6C60uwSrzKUqmGwIIALOPrzIXDaC6LJOXuoR3t5vn-2NxkuU8KCUBe8aI9EETO7oxdW67o1RsvR5Kb3Ptc-PsjTI_QHuWFkcqopWdBW1t0iljm3kWL9yn25sU3cUyd89vinS-9RqRgPxXZS7zgsRhzM-VuNde-NUdBAfg0NrBhGBQfp6zPZ49emYuv77kDp2muvEbMY_R5549dbTVVX_13A"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-label-md text-label-md font-bold text-on-surface">Tunde Bakare</span>
              <span className="font-caption text-caption text-text-tertiary">@tundeb</span>
            </div>
            <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">
              Saved for tomorrow’s team lunch in Apo. Seamless reservation!
            </p>
            <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
              <span>1d ago</span>
              <span className="font-medium text-text-primary">5 likes</span>
              <button
                type="button"
                className="font-semibold text-text-secondary hover:text-primary active:scale-95 transition-all"
              >
                Reply
              </button>
            </div>
          </div>
          <LikeButton label="Like comment" size="text-[20px]" />
        </article>

        {posted.map((comment) => (
          <article key={comment.id} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-fixed shrink-0 shadow-sm">
              <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                You
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-label-md text-label-md font-bold text-on-surface">You</span>
                <span className="font-caption text-caption text-text-tertiary">@you</span>
              </div>
              <p className="font-body-md text-body-md text-text-primary mt-1 leading-snug break-words">
                {comment.text}
              </p>
              <div className="flex items-center gap-4 mt-2 font-caption text-caption text-text-secondary">
                <span>Just now</span>
                <span className="font-medium text-text-primary">0 likes</span>
                <button type="button" className="font-semibold text-text-secondary">
                  Reply
                </button>
              </div>
            </div>
            <LikeButton label="Like comment" size="text-[20px]" />
          </article>
        ))}
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

        <div className="bg-surface-canvas px-margin pt-2 pb-5 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
          <form className="flex items-center gap-3" onSubmit={postComment}>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-fixed shrink-0 ring-2 ring-primary/20">
              <img
                className="w-full h-full object-cover"
                alt="Minimalist professional headshot photo of an upbeat creative user with gentle smile and casual urban style"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYtQpXntbbiGSSJmVaSCtLokHkMKw2v4MlZflGPLts1oTXm-zh-fRxS15Iydb6iAw1GlauCybUuKGh6qdZYfv62MTnxB-oW3bUi3gnjsBqm88nLSL6LJPi99I2a6vcykOZH4T1MLVDprxI_Jr3UVmIhqCvP6xzaMEdtIe2MncM-GzCpKizdRJyfcb6j3zau8PWPooHnLyKi2m6Agan3u2qHrCSsS1cMdZX-NzFTEEsZcPfDTgNemJOIQ"
              />
            </div>
            <div className="flex-1 flex items-center bg-surface-subtle rounded-full px-4 py-1.5 focus-within:bg-surface-tint-blue focus-within:shadow-[0_0_0_2px_rgba(6,108,244,0.3)] transition-all">
              <input
                autoComplete="off"
                className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none py-1"
                placeholder="Add a comment for Urban Grill..."
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </div>
            <button
              className="h-10 px-4 rounded-full bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold active:scale-95 shadow-[0_4px_14px_rgba(6,108,244,0.35)] transition-all flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary-container"
              type="submit"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </SheetShell>
  );
}
