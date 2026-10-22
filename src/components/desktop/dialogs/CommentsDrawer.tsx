import { Icon } from '../../ui/Icon';
import { parsePrice } from '../../../utils/format';
import { DesktopDrawer } from '../DesktopModal';
import type { ClaimDealSummary } from './ClaimIdentityModal';

export interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
  deal?: ClaimDealSummary | null;
}

interface Reaction {
  emoji: string;
  count: number;
}

interface Comment {
  initials: string;
  name: string;
  handle: string;
  meta: string;
  body: string;
  reactions: Reaction[];
  reply?: { time: string; body: string };
}

const COMMENTS: Comment[] = [
  {
    initials: 'TB',
    name: 'Tunde Bakare',
    handle: '@tundeb',
    meta: '3h ago • Verified Diner',
    body: 'Saved for tomorrow’s team lunch! Is the craft beverage refillable or just a single glass?',
    reactions: [
      { emoji: '❤️', count: 14 },
      { emoji: '🔥', count: 6 },
      { emoji: '👏', count: 4 },
    ],
    reply: {
      time: '2h ago',
      body: 'Hi Tunde! The iced peach cooler is a 500ml craft bottle, and you can switch to freshly brewed iced latte upon request. Looking forward to hosting your team!',
    },
  },
  {
    initials: 'AO',
    name: 'Amara Okafor',
    handle: '@amara_k',
    meta: '5h ago • Apo Res.',
    body: 'Can this voucher be used for takeout or is it strictly dine-in?',
    reactions: [{ emoji: '❤️', count: 8 }],
    reply: {
      time: '4h ago',
      body: 'Both dine-in and curbside pickup are supported! Just show your claim pass to the cashier.',
    },
  },
  {
    initials: 'SA',
    name: 'Samuel Adeleke',
    handle: '@sam_ade',
    meta: 'Yesterday • Claimed Offer',
    body: 'Redeemed this yesterday, burger was 10/10 juicy and fries were super crispy. Totally worth it.',
    reactions: [
      { emoji: '❤️', count: 19 },
      { emoji: '🔥', count: 11 },
    ],
  },
];

export function CommentsDrawer({ open, onClose, onClaim, deal }: CommentsDrawerProps) {
  const merchantName = deal?.business?.trim() || 'This local partner';
  const dealTitle = deal?.title?.trim() || 'this deal';
  const dealPrice = parsePrice(deal?.price);

  return (
    <DesktopDrawer open={open} onClose={onClose}>
      <div className="px-space-lg py-space-md bg-surface-canvas shadow-[0_1px_6px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-space-xs">
            <Icon name="forum" className="text-primary-container text-[22px]" />
            <h2 className="font-heading-sm text-heading-sm text-on-surface tracking-tight">Community Discussion</h2>
            <span className="bg-surface-container-high text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
              32
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary">
            Ask questions about {dealTitle.toLowerCase()} and the nearby merchant experience.
          </p>
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
          <button
            type="button"
            className="px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold transition-all bg-surface-tint-blue text-primary shadow-xs"
          >
            Most Helpful
          </button>
          <button
            type="button"
            className="px-space-sm py-1 rounded-full font-label-sm text-label-sm font-medium transition-all text-text-secondary hover:text-on-surface hover:bg-surface-container"
          >
            Latest
          </button>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption">
          <span className="w-2 h-2 rounded-full bg-badge-discount-text inline-block animate-pulse" />
          <span>Replies in &lt; 15 mins</span>
        </div>
      </div>

      <div className="p-space-lg bg-surface-canvas shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-space-sm">
        <div className="flex items-start gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
            ZA
          </div>
          <div className="flex-1 space-y-space-xs">
            <div className="relative bg-surface-subtle rounded-xl p-space-sm focus-within:bg-surface-canvas focus-within:shadow-md transition-all">
              <textarea
                className="w-full bg-transparent border-0 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none resize-none"
                placeholder="Add a public comment or ask a question..."
                rows={2}
              />
              <div className="flex items-center justify-between pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    title="Insert Emoji"
                    aria-label="Insert Emoji"
                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-on-surface transition-colors"
                  >
                    <Icon name="sentiment_satisfied" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    title="Attach picture"
                    aria-label="Attach picture"
                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-on-surface transition-colors"
                  >
                    <Icon name="add_photo_alternate" className="text-[18px]" />
                  </button>
                </div>
                <button
                  type="button"
                  className="h-9 px-space-md bg-primary-container hover:bg-primary active:scale-95 text-on-primary font-button-secondary text-button-secondary rounded-lg transition-transform flex items-center gap-1 shadow-sm"
                >
                  <span>Post Comment</span>
                  <Icon name="send" className="text-[16px]" />
                </button>
              </div>
            </div>
            <p className="font-caption text-caption text-text-tertiary px-1">
              Visible to all Abuja foodies &amp; restaurant managers.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-space-lg py-space-sm space-y-space-lg">
        {COMMENTS.map((comment) => (
          <article
            key={comment.handle}
            className="bg-surface-subtle p-space-md rounded-xl space-y-space-sm shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-bold flex items-center justify-center">
                  {comment.initials}
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">{comment.name}</span>
                    <span className="font-caption text-caption text-text-tertiary">{comment.handle}</span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{comment.meta}</span>
                </div>
              </div>
              <button type="button" aria-label="Comment menu" className="text-text-tertiary hover:text-on-surface">
                <Icon name="more_horiz" className="text-[18px]" />
              </button>
            </div>

            <p className="font-body-md text-body-md text-on-surface">{comment.body}</p>

            <div className="flex items-center gap-space-xs pt-space-2xs">
              {comment.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  className="flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-canvas hover:bg-surface-container text-text-secondary font-label-sm text-label-sm shadow-2xs transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-semibold">{reaction.count}</span>
                </button>
              ))}
            </div>

            {comment.reply ? (
              <div className="bg-surface-canvas rounded-lg p-space-sm ml-space-xs shadow-2xs space-y-space-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="storefront" className="text-[16px] text-primary-container" />
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">{merchantName}</span>
                    <span className="bg-surface-tint-blue text-primary font-caption text-caption px-1.5 py-0.5 rounded-full font-semibold">
                      Verified Merchant
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{comment.reply.time}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">{comment.reply.body}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="px-space-lg py-space-md bg-surface-canvas shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-space-md">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm font-semibold">
            <Icon name="bolt" className="text-[16px]" />
            <span>Claiming this deal?</span>
          </div>
          <p className="font-caption text-caption text-text-secondary truncate">7 vouchers left today in Abuja</p>
        </div>
        <button
          type="button"
          onClick={onClaim}
          className="h-11 px-space-md bg-primary-container hover:bg-primary active:scale-95 text-on-primary font-button-primary text-button-primary rounded-xl flex items-center gap-space-xs shrink-0 shadow-md transition-all"
        >
          <span>{`Claim Deal (${new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
          }).format(dealPrice)})`}</span>
        </button>
      </div>
    </DesktopDrawer>
  );
}
