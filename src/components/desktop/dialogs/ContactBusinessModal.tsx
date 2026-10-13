import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import { CLAIM_CODE } from '../../../scripts/ClaimedDealScreen';

interface ContactBusinessModalProps {
  open: boolean;
  onChat: () => void;
  onClose: () => void;
}

interface ContactRowProps {
  icon: string;
  iconClass: string;
  title: string;
  badge?: string;
  subtitle: string;
  onClick?: () => void;
  href?: string;
}

function ContactRow({ icon, iconClass, title, badge, subtitle, onClick, href }: ContactRowProps) {
  const content = (
    <>
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon name={icon} className="text-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md font-semibold text-text-primary">{title}</span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold tracking-wide uppercase">
                {badge}
              </span>
            )}
          </div>
          <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Icon name="chevron_right" className="text-text-tertiary text-[20px] shrink-0" />
    </>
  );

  const className =
    'w-full bg-surface-subtle hover:bg-surface-container-high border border-border-subtle rounded-xl p-space-sm flex items-center justify-between text-left transition-colors';

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

export function ContactBusinessModal({ open, onChat, onClose }: ContactBusinessModalProps) {
  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-start justify-between gap-space-md p-space-lg border-b border-border-subtle">
        <div className="flex flex-col gap-space-xs">
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary w-fit">
            <Icon name="support_agent" className="text-[14px]" />
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Contact Merchant</span>
          </span>
          <h3 className="font-heading-sm text-heading-sm text-text-primary">Contact Urban Grill &amp; Bistro</h3>
          <p className="font-caption text-caption text-text-secondary leading-snug max-w-md">
            Choose how you&apos;d like to reach out to inquire, make reservations, or coordinate redemption.
          </p>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="p-space-lg flex flex-col gap-space-xs overflow-y-auto">
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
          subtitle="Quick order & table queries"
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

        <div className="mt-space-xs w-full bg-surface-subtle border border-border-subtle rounded-xl p-space-sm flex items-start gap-2">
          <Icon name="shield" className="text-[18px] text-secondary shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-text-secondary leading-snug">
            Communications on external platforms (WhatsApp, phone calls, or email) take place outside VEMTAP. VEMTAP
            cannot record, manage, or moderate interactions conducted outside of In-App Chat.
          </p>
        </div>

        <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex items-start gap-2">
          <Icon name="schedule" className="text-[18px] text-badge-discount-text shrink-0 mt-0.5" />
          <div>
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

      <div className="p-space-lg pt-0">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 bg-surface-container-highest hover:bg-surface-container text-on-surface font-button-primary text-button-primary rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </DesktopModal>
  );
}
