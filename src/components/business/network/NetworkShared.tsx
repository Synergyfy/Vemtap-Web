import { useState, type ReactNode } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal } from '../../desktop/DesktopModal';
import type { ReferralCard, ReferralStatus } from '../../../services/businessNetworkService';
import { formatRelativeTime } from '../../../utils/format';

export const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  registered: 'Registered',
  pending: 'In review',
  verified: 'Verified',
  notQualified: 'Not qualified',
};

const REFERRAL_STATUS_BADGE: Record<ReferralStatus, string> = {
  registered: 'bg-surface-tint-blue text-primary',
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  verified: 'bg-badge-discount-bg text-badge-discount-text',
  notQualified: 'bg-surface-container text-text-secondary',
};

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${REFERRAL_STATUS_BADGE[status]}`}>
      {REFERRAL_STATUS_LABEL[status]}
    </span>
  );
}

export function BusinessAvatar({ name, logoUrl }: { name: string | null; logoUrl: string | null }) {
  if (logoUrl) return <img src={logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />;
  return (
    <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
      {(name ?? '?').charAt(0).toUpperCase()}
    </span>
  );
}

export function ReferralRow({ referral, onOpen }: { referral: ReferralCard; onOpen?: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(referral.id)}
      className="w-full flex items-center gap-space-sm p-space-sm rounded-xl text-left hover:bg-surface-subtle transition-colors"
    >
      <BusinessAvatar name={referral.name} logoUrl={referral.logoUrl} />
      <span className="flex flex-col flex-1 min-w-0">
        <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{referral.name ?? 'New business'}</span>
        <span className="font-caption text-caption text-text-secondary truncate">
          {[referral.category, referral.location].filter(Boolean).join(' · ') || '—'} · joined {formatRelativeTime(referral.joinedAt)}
        </span>
      </span>
      <ReferralStatusBadge status={referral.status} />
      <Icon name="chevron_right" className="text-[20px] text-text-tertiary" />
    </button>
  );
}

export function Card({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={`h-2 rounded-full bg-surface-container-low overflow-hidden ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary-container transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Invite a business: share the referral link by copy, WhatsApp, SMS or email. */
export function InviteBusinessDialog({
  open,
  onClose,
  referralCode,
  referralLink,
}: {
  open: boolean;
  onClose: () => void;
  referralCode: string;
  referralLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const message = `Join me on VemTap — get your business discovered by nearby customers. Sign up with my code ${referralCode}: ${referralLink}`;
  const encoded = encodeURIComponent(message);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const channels = [
    { key: 'whatsapp', label: 'WhatsApp', icon: 'chat', href: `https://wa.me/?text=${encoded}` },
    { key: 'sms', label: 'SMS', icon: 'sms', href: `sms:?&body=${encoded}` },
    { key: 'email', label: 'Email', icon: 'mail', href: `mailto:?subject=${encodeURIComponent('Join me on VemTap')}&body=${encoded}` },
  ];

  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-[460px]">
      <div className="p-space-lg flex flex-col gap-space-md">
        <header className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading-md text-heading-md text-text-primary">Invite a business</h2>
            <p className="font-body-md text-body-md text-text-secondary">
              Businesses that join with your code and get verified count toward your network milestones.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-container">
            <Icon name="close" className="text-[20px]" />
          </button>
        </header>

        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-text-secondary">Your referral code</span>
          <span className="font-heading-md text-heading-md tracking-widest text-text-primary font-mono">{referralCode}</span>
        </div>

        <div className="flex items-center gap-space-xs rounded-lg bg-surface-container-low p-space-xs">
          <span className="flex-1 min-w-0 truncate font-body-md text-body-md text-text-secondary px-space-xs">{referralLink}</span>
          <button type="button" onClick={copy} className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 shrink-0">
            <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-space-xs">
          {channels.map((channel) => (
            <a
              key={channel.key}
              href={channel.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low font-label-sm text-label-sm text-text-primary"
            >
              <Icon name={channel.icon} className="text-[22px] text-primary" />
              {channel.label}
            </a>
          ))}
        </div>
      </div>
    </DesktopModal>
  );
}
