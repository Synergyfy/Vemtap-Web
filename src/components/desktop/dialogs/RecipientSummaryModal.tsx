import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import { maskPhone } from '../../../utils/format';

export interface RecipientSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  /** Recipient details collected in the previous steps. */
  recipient?: { name: string; email: string; phone?: string } | null;
}

const VALIDITY: Array<{ label: string; value: string; note: string }> = [
  { label: 'Valid Period', value: '48 hours', note: 'From instant issue' },
  { label: 'Redemption Hours', value: 'Mon – Fri', note: '12:00 PM – 4:00 PM' },
  { label: 'Venue (0.8 km)', value: 'Plot 14 Apo Blvd', note: 'Apo District, Abuja' },
];

function ContactTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-surface-container-lowest flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-[16px]" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-caption text-caption text-text-tertiary">{label}</span>
        <span className="font-label-sm text-label-sm text-on-surface truncate font-medium">{value}</span>
      </div>
    </div>
  );
}

export function RecipientSummaryModal({ open, onClose, onConfirm, onEdit, recipient }: RecipientSummaryModalProps) {
  const recipientName = recipient?.name ?? 'Samuel Adeleke';
  const recipientEmail = recipient?.email ?? 'samuel.adeleke@example.com';
  const recipientPhoneDisplay = recipient?.phone ? maskPhone(recipient.phone) : '+234 802 345 6789';
  const initials =
    recipientName
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SA';
  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-xl"
      backdropClassName="bg-on-surface/40 backdrop-blur-md"
      cardClassName="bg-surface-container-lowest"
    >
      <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
          <Icon name="check_circle" filled className="text-[16px] leading-none" />
          <span className="font-caption text-caption font-bold tracking-wider uppercase">Recipient Confirmed</span>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="px-6 sm:px-8 pb-5 flex flex-col gap-1.5">
        <h2 className="font-heading-lg text-heading-lg text-on-surface font-semibold tracking-tight">
          Confirm Recipient Summary
        </h2>
        <p className="font-body-md text-body-md text-text-secondary">
          Review the verified recipient details before finalizing the deal claim on their behalf.
        </p>
      </div>

      <div className="px-6 sm:px-8 pb-6 flex flex-col gap-4 overflow-y-auto">
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low flex flex-col gap-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-heading-sm text-heading-sm font-bold tracking-tight shadow-sm">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-badge-discount-text text-on-primary flex items-center justify-center ring-2 ring-surface-container-lowest">
                  <Icon name="check" className="text-[13px] leading-none" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">
                    {recipientName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    <Icon name="verified" className="text-[13px]" />
                    Verified Contact
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Relation: <strong className="text-on-surface font-medium">Family / Friend</strong>
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <ContactTile icon="mail" label="Email Address" value={recipientEmail} />
            <ContactTile icon="phone_iphone" label="Mobile Number (masked)" value={recipientPhoneDisplay} />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container relative">
              <img
                className="w-full h-full object-cover"
                alt="Plated gourmet lunch dish at Urban Grill in Abuja with savory garnishes, grilled meats, and colorful seasonal sides"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRXg9PQzMVASST6uW5-xyjbVAWUt130eROKykVMAjqADiq69ANPpZstPrtMGjqBiPZ0GntBD-J6CQvBmWzW32gDHZnuNBONvAxv5D10rP0rAdlFP9VStnh2RQtZzWQBOAG70yWBr13IgD_BmDZxIk9okXh2Kw-qVcRT2OeNBK4Rm7DWdc8IX1ksyVs8YrMhA41T0q_Cjx1MOFW21rBfp80554HhJcy6l_OC6R4Okd0"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider truncate">
                  Urban Grill &amp; Bistro
                </span>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                  20% OFF
                </span>
              </div>
              <h3 className="font-label-md text-label-md font-semibold text-on-surface truncate">
                Prime 3-Course Lunch Combo &amp; Craft Beverage
              </h3>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-heading-sm text-heading-sm text-primary font-bold">₦9,600</span>
                <span className="font-caption text-caption text-text-tertiary line-through">₦12,000</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-high/60 flex items-start gap-2.5">
            <Icon name="info" className="text-[18px] shrink-0 mt-0.5 text-primary" />
            <p className="font-caption text-caption text-text-secondary leading-snug">
              Claim voucher will be generated in <strong className="text-on-surface font-semibold">Samuel Adeleke's</strong>{' '}
              name. Payment of <strong className="text-on-surface font-semibold">₦9,600</strong> is settled in-store upon
              redemption.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-on-surface">
            <Icon name="event_upcoming" className="text-primary text-[18px]" />
            <span className="font-label-sm text-label-sm font-semibold">Validity &amp; Operational Schedule</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-caption text-caption">
            {VALIDITY.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5 p-2 rounded-lg bg-surface-container-lowest">
                <span className="text-text-tertiary font-medium">{item.label}</span>
                <span className="text-on-surface font-semibold truncate">{item.value}</span>
                <span className="text-text-secondary">{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-5 bg-surface-container-lowest flex flex-col gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full h-[52px] px-6 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-button-primary text-button-primary shadow-lg shadow-primary-container/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Confirm &amp; Issue Voucher Pass</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="w-full h-11 px-4 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary transition-colors"
        >
          Edit Recipient Details
        </button>
        <div className="flex items-center justify-center gap-2 pt-1 text-center font-caption text-caption text-text-tertiary">
          <Icon name="security" filled className="text-[16px] text-badge-discount-text" />
          <span>Voucher will appear in Samuel Adeleke's VEMTAP app and be sent to his email &amp; WhatsApp.</span>
        </div>
      </div>
    </DesktopModal>
  );
}
