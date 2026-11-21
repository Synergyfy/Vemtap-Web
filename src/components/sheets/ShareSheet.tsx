import { useState } from 'react';
import { parsePrice } from '../../utils/format';
import { NO_IMAGE } from '../../utils/homeOffer';
import { Icon } from '../ui/Icon';
import type { ClaimDealSummary } from '../desktop/dialogs/ClaimIdentityModal';
import { SheetShell } from './SheetShell';

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

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  deal?: ClaimDealSummary | null;
}

export function ShareSheet({ open, onClose, deal }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);

  const dealTitle = deal?.title?.trim() ?? '';
  const businessName = deal?.business?.trim() ?? '';
  const dealPlace = [businessName, deal?.location?.trim()].filter(Boolean).join(' • ');
  const dealImage = deal?.image || NO_IMAGE;
  const dealImageAlt = `${dealTitle} at ${businessName}`;
  const dealPrice = parsePrice(deal?.price);
  const dealOldPrice = parsePrice(deal?.oldPrice) || dealPrice;
  const savings = Math.max(dealOldPrice - dealPrice, 0);
  const shareUrl = `${window.location.origin}/deals/${deal?.id ?? ''}`;
  const shareDisplay = shareUrl.replace(/^https?:\/\//, '');
  const shareText = `${dealTitle}${deal?.discountLabel ? ` — ${deal.discountLabel}` : ''}${businessName ? ` at ${businessName}` : ''}`;

  const showToast = (message: string, icon = 'check_circle') => {
    setToast({ message, icon });
    window.setTimeout(() => setToast(null), 2200);
  };

  const copyLink = (message = 'Offer link copied to clipboard!') => {
    if (!navigator.clipboard) {
      showToast('Could not copy the link', 'error');
      return;
    }
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied(true);
        showToast(message);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => showToast('Could not copy the link', 'error'),
    );
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

  /** Instagram has no web share link, so the link is copied for the customer to paste. */
  const shareToInstagram = () => copyLink('Link copied. Paste it into Instagram.');
  const shareBySms = () => {
    window.location.href = `sms:?&body=${encodeURIComponent(`${shareText} — ${shareUrl}`)}`;
  };

  // A share needs a real deal: without one there is no link to give.
  if (!deal?.id) return null;

  return (
    <>
      <SheetShell open={open} onClose={onClose}>
        <div className="w-full pt-3 pb-1 flex justify-center items-center">
          <div className="w-12 h-1.5 rounded-full bg-surface-container-highest" />
        </div>

        <div className="px-margin pt-1 pb-space-sm flex items-center justify-between">
          <h2 className="font-heading-md text-heading-md text-on-surface font-semibold tracking-tight">Share Deal</h2>
          <button
            aria-label="Close share sheet"
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-all"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="px-margin overflow-y-auto space-y-space-md pb-4">
          <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-sm shadow-sm">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
              <img className="w-full h-full object-cover" alt={dealImageAlt} src={dealImage} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {dealTitle}
              </span>
              <span className="font-caption text-caption text-text-secondary truncate mt-0.5">
                {dealPlace}
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
                {deal?.discountLabel ? (
                  <span className="font-caption text-caption text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    <Icon name="sell" className="text-[12px]" />
                    {deal.discountLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle p-space-xs pl-space-sm rounded-xl flex items-center justify-between gap-space-xs shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0 flex-1">
              <Icon name="link" className="text-text-tertiary text-[20px] shrink-0" />
              <span className="font-caption text-caption text-text-secondary truncate select-all">{shareDisplay}</span>
            </div>
            <button
              type="button"
              onClick={() => copyLink()}
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

          <div className="flex flex-col gap-space-2xs">
            <span className="font-label-sm text-label-sm text-text-tertiary font-medium">Share via</span>
            <div className="flex items-start justify-between pt-1 px-1">
              <button
                aria-label="Share to WhatsApp"
                type="button"
                onClick={() =>
                  openExternal(`https://wa.me/?text=${encodeURIComponent(`${shareText} — ${shareUrl}`)}`)
                }
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className={CHANNEL_CLASS.whatsapp}>
                  <Icon name="whatsapp" className="text-[24px]" />
                </div>
                <span className="font-caption text-caption text-on-surface font-medium text-center">WhatsApp</span>
              </button>

              <button
                aria-label="Share via Messages"
                type="button"
                onClick={shareBySms}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className={CHANNEL_CLASS.messages}>
                  <Icon name="chat" filled className="text-[24px]" />
                </div>
                <span className="font-caption text-caption text-on-surface font-medium text-center">Messages</span>
              </button>

              <button
                aria-label="Share to Instagram"
                type="button"
                onClick={shareToInstagram}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className={CHANNEL_CLASS.instagram}>
                  <svg aria-hidden="true" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className="font-caption text-caption text-on-surface font-medium text-center">Instagram</span>
              </button>

              <button
                aria-label="Share to X"
                type="button"
                onClick={() =>
                  openExternal(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                  )
                }
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className={CHANNEL_CLASS.x}>
                  <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="font-caption text-caption text-on-surface font-medium text-center">X</span>
              </button>

              <button
                aria-label="More native share options"
                type="button"
                onClick={shareMore}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
              >
                <div className={CHANNEL_CLASS.more}>
                  <Icon name="more_horiz" className="text-[22px]" />
                </div>
                <span className="font-caption text-caption text-on-surface font-medium text-center">More</span>
              </button>
            </div>
          </div>

          <div className="pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-[52px] bg-surface-container-low hover:bg-surface-container-highest active:scale-[0.98] rounded-xl text-on-surface font-button-secondary text-button-secondary font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetShell>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <Icon name={toast.icon} className="text-[18px] text-badge-discount-text" />
          <span className="font-caption text-caption font-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
