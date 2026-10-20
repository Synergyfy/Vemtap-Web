import { useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import {
  buildWhatsAppShareUrl,
  buildXShareUrl,
  copyTextToClipboard,
  shareViaWebShare,
  type ReferralAudience,
  referralShareMessage,
} from '../../scripts/referralData';

export interface ReferralShareRowProps {
  link: string;
  audience: ReferralAudience;
  /** Compact lays the four buttons out on one wrapping row (mobile). */
  layout?: 'stacked' | 'inline';
  /** Renders the primary "Share" button that uses the Web Share API. */
  showNativeShare?: boolean;
  className?: string;
}

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { key: 'x', label: 'X', icon: 'tag' },
  { key: 'instagram', label: 'Instagram', icon: 'photo_camera' },
  { key: 'copy', label: 'Copy Link', icon: 'content_copy' },
] as const;

type ChannelKey = (typeof CHANNELS)[number]['key'];

/**
 * WhatsApp / X / Instagram / Copy Link for a referral URL.
 *
 * WhatsApp and X open their own share intents with a prefilled message.
 * Instagram has no public web-share endpoint a website can use, so it copies
 * the link and shows an explicit instruction instead of implying the app can
 * post on the user's behalf.
 */
export function ReferralShareRow({
  link,
  audience,
  layout = 'stacked',
  showNativeShare = false,
  className = '',
}: ReferralShareRowProps) {
  const [copiedChannel, setCopiedChannel] = useState<ChannelKey | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const message = referralShareMessage(audience, link);

  const flash = (text: string, channel: ChannelKey) => {
    setNotice(text);
    setCopiedChannel(channel);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setNotice(null);
      setCopiedChannel(null);
    }, 3200);
  };

  const handleCopy = async (channel: ChannelKey, text: string) => {
    const copied = await copyTextToClipboard(link);
    flash(copied ? text : 'Copy the link shown above to share it.', channel);
  };

  const handleChannel = async (channel: ChannelKey) => {
    if (channel === 'copy') {
      await handleCopy('copy', 'Link copied to clipboard.');
      return;
    }
    if (channel === 'whatsapp') {
      window.open(buildWhatsAppShareUrl(message), '_blank', 'noopener,noreferrer');
      return;
    }
    if (channel === 'x') {
      window.open(buildXShareUrl(message, link), '_blank', 'noopener,noreferrer');
      return;
    }
    await handleCopy('instagram', 'Link copied — open Instagram and paste it into a story or message.');
  };

  const handleNativeShare = async () => {
    const outcome = await shareViaWebShare({
      title: 'Join me on VEMTAP',
      text: message,
      url: link,
    });
    if (outcome === 'unavailable') await handleCopy('copy', 'Sharing isn’t available here — link copied instead.');
    if (outcome === 'shared') setNotice(null);
  };

  const buttonClass =
    'inline-flex items-center justify-center gap-space-2xs h-11 px-space-sm rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle active:scale-[0.98] transition font-label-sm text-label-sm text-on-surface font-medium';

  return (
    <div className={`flex flex-col gap-space-xs ${className}`}>
      {showNativeShare && (
        <button type="button" onClick={() => void handleNativeShare()} className={`${buttonClass} bg-primary-container text-on-primary border-transparent hover:bg-primary`}>
          <Icon name="share" className="text-[18px]" />
          <span>Share</span>
        </button>
      )}

      <div className={layout === 'inline' ? 'grid grid-cols-2 sm:grid-cols-4 gap-space-2xs' : 'flex flex-col gap-space-2xs'}>
        {CHANNELS.map((channel) => (
          <button key={channel.key} type="button" onClick={() => void handleChannel(channel.key)} className={buttonClass}>
            <Icon
              name={channel.key === 'copy' && copiedChannel === 'copy' ? 'check' : channel.icon}
              className={`text-[18px] ${channel.key === 'copy' && copiedChannel === 'copy' ? 'text-badge-discount-text' : 'text-primary'}`}
            />
            <span>{channel.label}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="min-h-[16px] font-caption text-caption text-text-secondary">
        {notice ?? (audience === 'business' ? 'Business invitations open with a ready-made message.' : 'Messages are prefilled — you can edit them before sending.')}
      </p>
    </div>
  );
}
