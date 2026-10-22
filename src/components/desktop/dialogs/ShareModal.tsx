import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import type { ClaimDealSummary } from './ClaimIdentityModal';

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  deal?: ClaimDealSummary | null;
}

const DEAL_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBx2ioreKlV7zBNVSegnNOiYXQY3w8d0P1LIq3rfibQ2HWCyoP4shk_TyzWt6p376lQqtfvgXCZa_EAp1NKgCrrnhj2HdRvkzk4vx1GdBvmLu2ftuCJacDWRzENx37lBGQpSpegQV7m7xVuJ3cS4ct8s7MAiCvrVoTVv058xTw4ssMzgFAM5vF2fQhdP6hfuVL0YWWzz7ysnxf-64FBzE657_CIc-6_mGh_h5ml0UMaG9ngDBAE3CBRuw';

const DEAL_ALT =
  'Close-up of a stacked artisan bistro lunch burger and golden crispy fries beside a sparkling drink, studio warm lighting.';

const toSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'deal';

interface Friend {
  name: string;
  first: string;
  initial: string;
  avatarClass: string;
  online: boolean;
}

const FRIENDS: Friend[] = [
  { name: 'Amara O.', first: 'Amara', initial: 'A', avatarClass: 'bg-primary-fixed text-primary', online: true },
  { name: 'Samuel A.', first: 'Samuel', initial: 'S', avatarClass: 'bg-secondary-fixed text-secondary', online: true },
  { name: 'Tunde B.', first: 'Tunde', initial: 'T', avatarClass: 'bg-surface-container text-on-surface-variant', online: false },
  { name: 'Kemi D.', first: 'Kemi', initial: 'K', avatarClass: 'bg-tertiary-fixed text-tertiary', online: true },
];

const CHANNEL_CLASS: Record<string, string> = {
  whatsapp:
    'w-[52px] h-[52px] rounded-full bg-[#25D366]/15 text-[#25D366] group-hover:bg-[#25D366]/25 transition-colors flex items-center justify-center',
  messages:
    'w-[52px] h-[52px] rounded-full bg-primary-fixed text-primary group-hover:bg-primary-fixed-dim transition-colors flex items-center justify-center',
  instagram:
    'w-[52px] h-[52px] rounded-full bg-[#E1306C]/15 text-[#E1306C] group-hover:bg-[#E1306C]/25 transition-colors flex items-center justify-center',
  x: 'w-[52px] h-[52px] rounded-full bg-inverse-surface/10 text-inverse-surface group-hover:bg-inverse-surface/20 transition-colors flex items-center justify-center',
  more: 'w-[52px] h-[52px] rounded-full bg-surface-container-high text-on-surface-variant group-hover:bg-surface-container-highest transition-colors flex items-center justify-center',
};

export function ShareModal({ open, onClose, deal }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);
  const timers = useRef<Array<number>>([]);

  const dealTitle = deal?.title?.trim() || 'Local deal';
  const businessName = deal?.business?.trim() || 'This business';
  const dealLocation = deal?.location?.trim() || 'Nearby';
  const dealImage = deal?.image || DEAL_IMAGE;
  const dealImageAlt = `${dealTitle} at ${businessName}`;
  const dealPrice = typeof deal?.price === 'number' ? deal.price : 0;
  const dealOldPrice = typeof deal?.oldPrice === 'number' ? deal.oldPrice : dealPrice;
  const savings = Math.max(dealOldPrice - dealPrice, 0);
  const shareUrl = useMemo(
    () => `https://vemtap.com/d/${toSlug(businessName)}-${toSlug(dealTitle)}`,
    [businessName, dealTitle],
  );
  const shareDisplay = shareUrl.replace(/^https?:\/\//, '');
  const shareText = `${dealTitle}${deal?.discountLabel ? ` — ${deal.discountLabel}` : ''} at ${businessName}`;

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
      setCopied(false);
      setSentTo(null);
      setToast(null);
    }
  }, [open]);

  const showToast = (message: string, icon = 'check_circle') => {
    setToast({ message, icon });
    timers.current.push(window.setTimeout(() => setToast(null), 2200));
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    setCopied(true);
    showToast('Offer link copied to clipboard!');
    timers.current.push(window.setTimeout(() => setCopied(false), 2000));
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareMore = () => {
    if (typeof navigator.share === 'function') {
      navigator.share({ title: shareText, url: shareUrl }).catch(() => undefined);
      return;
    }
    copyLink();
  };

  const sendTo = (friend: Friend) => {
    if (sentTo) return;
    setSentTo(friend.first);
    showToast(`Shared with ${friend.first}!`, 'send');
    timers.current.push(window.setTimeout(() => setSentTo(null), 2500));
  };

  return (
    <>
      <DesktopModal open={open} onClose={onClose} maxWidth="max-w-xl">
        <div className="flex items-center justify-between gap-space-md p-space-lg border-b border-border-subtle">
          <div className="flex flex-col gap-space-2xs">
            <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary w-fit">
              <Icon name="share" className="text-[14px]" />
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Share &amp; Refer</span>
            </span>
            <h4 className="font-heading-sm text-heading-sm text-text-primary">Share Deal</h4>
          </div>
          <ModalCloseButton onClose={onClose} label="Close share dialog" />
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-space-lg space-y-space-md">
          <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-sm shadow-sm">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
              <img className="w-full h-full object-cover" alt={dealImageAlt || DEAL_ALT} src={dealImage} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                {dealTitle}
              </span>
              <span className="font-caption text-caption text-text-secondary truncate mt-0.5">
                {businessName} • {dealLocation}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold px-2 py-0.5 rounded-full inline-flex items-center">
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(dealPrice)}
                  {savings > 0 ? ` (Save ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(savings)})` : ''}
                </span>
                {dealOldPrice > dealPrice ? (
                  <span className="font-caption text-caption text-text-tertiary line-through">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(dealOldPrice)}
                  </span>
                ) : null}
                <span className="font-caption text-caption text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  <Icon name="verified" className="text-[12px]" />
                  {deal?.discountLabel || 'Vetted Deal'}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-subtle p-space-xs pl-space-sm rounded-xl flex items-center justify-between gap-space-xs shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0 flex-1">
              <Icon name="link" className="text-text-tertiary text-[20px] shrink-0" />
              <span className="font-caption text-caption text-text-secondary truncate select-all">{shareDisplay}</span>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className={`shrink-0 active:scale-95 font-label-sm text-label-sm font-semibold px-space-sm py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all ${
                copied
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary-container hover:bg-primary text-on-primary'
              }`}
            >
              <Icon name={copied ? 'done' : 'content_copy'} className="text-[16px]" />
              <span>{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-text-tertiary font-medium">Share via</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-sm">
              <button
                aria-label="Share to WhatsApp"
                type="button"
                onClick={() =>
                  openExternal(`https://wa.me/?text=${encodeURIComponent(`${shareText} — ${shareUrl}`)}`)
                }
                className="flex flex-col items-center gap-1.5 group p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
              >
                <div className={CHANNEL_CLASS.whatsapp}>
                  <svg aria-hidden="true" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
                  </svg>
                </div>
                <span className="font-caption text-caption text-text-primary font-medium text-center">WhatsApp</span>
              </button>

              <button
                aria-label="Share via Messages"
                type="button"
                className="flex flex-col items-center gap-1.5 group p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
              >
                <div className={CHANNEL_CLASS.messages}>
                  <Icon name="chat" filled className="text-[24px]" />
                </div>
                <span className="font-caption text-caption text-text-primary font-medium text-center">Messages</span>
              </button>

              <button
                aria-label="Share to Instagram"
                type="button"
                className="flex flex-col items-center gap-1.5 group p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
              >
                <div className={CHANNEL_CLASS.instagram}>
                  <svg aria-hidden="true" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className="font-caption text-caption text-text-primary font-medium text-center">Instagram</span>
              </button>

              <button
                aria-label="Share to X"
                type="button"
                onClick={() =>
                  openExternal(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                  )
                }
                className="flex flex-col items-center gap-1.5 group p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
              >
                <div className={CHANNEL_CLASS.x}>
                  <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="font-caption text-caption text-text-primary font-medium text-center">X</span>
              </button>

              <button
                aria-label="More native share options"
                type="button"
                onClick={shareMore}
                className="flex flex-col items-center gap-1.5 group p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
              >
                <div className={CHANNEL_CLASS.more}>
                  <Icon name="more_horiz" className="text-[22px]" />
                </div>
                <span className="font-caption text-caption text-text-primary font-medium text-center">More</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs pt-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-tertiary font-medium">
                Send directly to friends on VEMTAP
              </span>
              <span className="font-caption text-caption text-primary font-medium">Hyperlocal</span>
            </div>
            <div className="grid grid-cols-4 gap-space-xs pt-0.5">
              {FRIENDS.map((friend) => (
                <div key={friend.name} className="flex flex-col items-center gap-1.5">
                  <div className="relative">
                    <div
                      className={`w-[52px] h-[52px] rounded-full overflow-hidden flex items-center justify-center font-semibold shadow-sm ${friend.avatarClass}`}
                    >
                      <span>{friend.initial}</span>
                    </div>
                    {friend.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-surface-canvas flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                      </div>
                    )}
                  </div>
                  <span className="font-caption text-caption text-text-primary font-medium truncate w-full text-center">
                    {friend.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => sendTo(friend)}
                    className={`w-full py-1 rounded-full font-caption text-caption font-semibold active:scale-90 transition-all ${
                      sentTo === friend.first
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-surface-tint-blue text-primary hover:bg-primary hover:text-on-primary'
                    }`}
                  >
                    {sentTo === friend.first ? 'Sent ✓' : 'Send'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-space-lg pt-space-sm border-t border-border-subtle bg-surface-canvas">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[52px] bg-surface-container-low hover:bg-surface-container-highest active:scale-[0.98] rounded-xl text-text-primary font-button-secondary text-button-secondary font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </DesktopModal>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <Icon name={toast.icon} className="text-[18px] text-badge-discount-text" />
          <span className="font-caption text-caption font-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
