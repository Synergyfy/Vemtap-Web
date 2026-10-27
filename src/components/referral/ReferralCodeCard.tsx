import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { ReferralBenefitsModal } from './ReferralBenefitsModal';
import { ReferralQrArt } from './ReferralQrArt';
import { ReferralShareRow } from './ReferralShareRow';
import {
  copyTextToClipboard,
  referralShareMessage,
  shareViaWebShare,
  type ReferralAudience,
} from '../../scripts/referralData';

export interface ReferralCodeCardProps {
  /** Preview code. Always rendered with a "Preview" badge while backend-less. */
  code: string;
  link: string;
  /** Who the invitation is *for* — drives the share message wording. */
  audience: ReferralAudience;
  /**
   * Whose account owns this card. Used only to pick which benefits the popup
   * shows, so it is deliberately separate from `audience`: a customer inviting
   * a business must still see customer benefits.
   */
  accountType: ReferralAudience;
  /** Heading for the card. */
  title?: string;
  description?: string;
  /** Hides the QR + share channels (used where space is tight). */
  compact?: boolean;
  className?: string;
}

/**
 * The shared "your referral code & link" card: code, link preview, Copy Link,
 * Share, sharing channels, QR preview and the benefits popup.
 *
 * Every figure on this card is a preview generated in the browser — the card
 * says so, so nothing here reads as an active, trackable referral.
 */
export function ReferralCodeCard({
  code,
  link,
  audience,
  accountType,
  title,
  description,
  compact = false,
  className = '',
}: ReferralCodeCardProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [benefitsOpen, setBenefitsOpen] = useState(false);

  /** Copies the referral code or the referral link, depending on which control was used. */
  const handleCopy = async (what: 'code' | 'link' = 'link') => {
    const value = what === 'code' ? code : link;
    const ok = await copyTextToClipboard(value);
    setCopied(ok ? what : null);
    setNotice(
      ok
        ? what === 'code'
          ? 'Referral code copied to clipboard.'
          : 'Referral link copied to clipboard.'
        : 'Copy the value shown above to share it.',
    );
    window.setTimeout(() => setCopied(null), 2200);
  };

  const handleShare = async () => {
    const outcome = await shareViaWebShare({
      title: 'Join me on VEMTAP',
      text: referralShareMessage(audience, link),
      url: link,
    });
    if (outcome === 'unavailable') await handleCopy('link');
    else if (outcome === 'shared') setNotice(null);
  };

  return (
    <section className={`rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm ${className}`}>
      <div className="flex flex-col gap-space-2xs">
        <div className="flex items-center gap-space-2xs">
          <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <Icon name="group_add" className="text-[18px]" />
          </span>
          <h3 className="font-label-md text-label-md text-text-primary font-semibold">
            {title ?? 'Refer Others & Earn Rewards'}
          </h3>
        </div>
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          {description ??
            (audience === 'business'
              ? 'Invite other businesses to VEMTAP. Qualifying referrals may earn VEMTAP Credits.'
              : 'Invite businesses and friends to VEMTAP. Qualifying referrals may earn Points.')}
        </p>
      </div>

      {/* Code + link */}
      <div className="rounded-xl bg-surface-subtle border border-border-subtle p-space-sm flex flex-col gap-space-xs">
        <div className="flex items-center justify-between gap-space-xs">
          <span className="font-caption text-caption text-text-secondary">Referral code</span>
          <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption">
            <Icon name="visibility" className="text-[12px]" />
            <span>Preview</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-space-xs">
          <span className="font-heading-md text-heading-md text-primary font-bold tracking-[0.14em] truncate">
            {code}
          </span>
          <button
            type="button"
            onClick={() => void handleCopy('code')}
            className="inline-flex items-center gap-space-2xs h-9 px-space-xs rounded-lg bg-surface-canvas border border-border-subtle hover:bg-surface-container-low transition font-label-sm text-label-sm text-on-surface font-medium shrink-0"
          >
            <Icon
              name={copied === 'code' ? 'check' : 'content_copy'}
              className={`text-[15px] ${copied === 'code' ? 'text-badge-discount-text' : 'text-primary'}`}
            />
            <span>{copied === 'code' ? 'Copied' : 'Copy code'}</span>
          </button>
        </div>

        <div className="flex items-center gap-space-2xs pt-space-2xs">
          <Icon name="link" className="text-[15px] text-text-tertiary shrink-0" />
          <span className="font-caption text-caption text-text-secondary truncate" title={link}>
            {link}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-space-2xs">
        <button
          type="button"
          onClick={() => void handleCopy('link')}
          className="inline-flex items-center gap-space-2xs h-11 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition active:scale-[0.98]"
        >
          <Icon name={copied === 'link' ? 'check' : 'content_copy'} className="text-[18px]" />
          <span>Copy Link</span>
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex items-center gap-space-2xs h-11 px-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold transition active:scale-[0.98]"
        >
          <Icon name="share" className="text-[18px] text-primary" />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={() => setBenefitsOpen(true)}
          className="inline-flex items-center gap-space-2xs h-11 px-space-sm rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-primary font-label-sm text-label-sm font-semibold transition active:scale-[0.98]"
        >
          <Icon name="info" className="text-[18px]" />
          <span>See Referral Benefits</span>
        </button>
      </div>

      <p aria-live="polite" className="min-h-[16px] font-caption text-caption text-text-secondary">
        {notice ?? ''}
      </p>

      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-space-md pt-space-xs border-t border-border-subtle">
          <ReferralQrArt
            link={link}
            caption={audience === 'business' ? 'Scan to send this business invitation' : 'Scan to share this invitation'}
            size={152}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-label-sm text-label-sm text-text-primary font-semibold mb-space-2xs">Share it</p>
            <ReferralShareRow link={link} audience={audience} layout="inline" showNativeShare />
          </div>
        </div>
      )}

      <ReferralBenefitsModal accountType={accountType} open={benefitsOpen} onClose={() => setBenefitsOpen(false)} />
    </section>
  );
}
