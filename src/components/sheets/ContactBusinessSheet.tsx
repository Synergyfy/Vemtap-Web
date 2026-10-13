import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';
import { CLAIM_CODE } from '../../scripts/ClaimedDealScreen';

interface ContactBusinessSheetProps {
  open: boolean;
  onChat: () => void;
  onClose: () => void;
}

function ContactRow({
  icon,
  iconClass,
  title,
  badge,
  subtitle,
  onClick,
  href,
}: {
  icon: string;
  iconClass: string;
  title: string;
  badge?: string;
  subtitle: string;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-space-sm">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}
        >
          <Icon name={icon} className="text-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md font-semibold text-text-primary">{title}</span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-caption text-[10px] font-semibold tracking-wide uppercase">
                {badge}
              </span>
            )}
          </div>
          <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Icon name="chevron_right" className="text-text-tertiary text-[20px]" />
    </>
  );

  const className =
    'w-full bg-surface-subtle active:bg-surface-container-high border border-border-subtle rounded-xl p-space-sm flex items-center justify-between text-left transition-all';

  if (href) {
    return (
      <a className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function ContactBusinessSheet({ open, onChat, onClose }: ContactBusinessSheetProps) {
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-outline-variant/60" />
      </div>
      <div className="px-space-md pt-2 pb-space-sm border-b border-surface-container">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary w-fit">
              <Icon name="support_agent" className="text-[14px]" />
              <span className="font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                Contact Merchant
              </span>
            </div>
            <h3 className="font-heading-sm text-heading-sm text-text-primary mt-1">
              Contact Urban Grill &amp; Bistro
            </h3>
            <p className="font-caption text-caption text-text-secondary leading-snug">
              Choose how you'd like to reach out to inquire, make reservations, or coordinate redemption.
            </p>
          </div>
          <button
            aria-label="Close modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary active:bg-surface-container-high transition-colors flex-shrink-0 ml-2"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="px-space-md py-space-sm space-y-2.5 overflow-y-auto">
        <ContactRow
          icon="chat"
          iconClass="bg-primary/10 text-primary"
          title="In-App Chat"
          badge="Recommended"
          subtitle="Typical reply in under 5 mins"
          onClick={onChat}
        />
        <ContactRow
          icon="forum"
          iconClass="bg-badge-discount-bg text-badge-discount-text"
          title="Chat on WhatsApp"
          subtitle={'Quick order & table queries'}
          onClick={() => window.open('https://wa.me/2348000000000')}
        />
        <ContactRow
          icon="call"
          iconClass="bg-surface-container-high text-primary"
          title="Call Business"
          subtitle="Speak with front desk / host"
          href="tel:+2348000000000"
        />
        <ContactRow
          icon="mail"
          iconClass="bg-secondary-fixed text-secondary"
          title="Send Email"
          subtitle="For bulk inquiries"
          href="mailto:reservations@urbangrill.ng"
        />

        <div className="w-full bg-surface-subtle border border-border-subtle rounded-xl p-space-sm flex items-start gap-2 text-left">
          <Icon name="shield" className="text-[18px] text-secondary flex-shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-text-secondary leading-snug">
            Communications on external platforms (WhatsApp, phone calls, or email) take place outside VEMTAP.
            VEMTAP cannot record, manage, or moderate interactions conducted outside of In-App Chat.
          </p>
        </div>

        <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex items-start gap-2 text-left">
          <Icon name="schedule" className="text-[18px] text-badge-discount-text flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="font-caption text-caption font-semibold text-text-primary">
              <span className="text-badge-discount-text">Open Now</span> • Closes at 10:00 PM
            </p>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Mention voucher code <strong className="font-mono text-text-primary font-semibold">{CLAIM_CODE}</strong>{' '}
              when connecting with the merchant.
            </p>
          </div>
        </div>
      </div>

      <div className="px-space-md pt-2 pb-safe mb-space-sm">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 bg-surface-container-highest active:bg-surface-container text-on-surface font-button-primary text-button-primary rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </SheetShell>
  );
}
