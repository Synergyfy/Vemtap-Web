import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal } from '../DesktopModal';

export interface GiftRecipientValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  channel: 'whatsapp' | 'email' | 'sms';
}

export interface GiftRecipientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  /** Receives the collected recipient details so the review step and gift record can use them. */
  onContinue: (values: GiftRecipientValues) => void;
}

type Channel = 'whatsapp' | 'email' | 'sms';
type Theme = 'celebration' | 'treat' | 'thankyou';

const CHANNELS: Array<{ value: Channel; label: string; icon: string }> = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'sms', label: 'SMS Pass', icon: 'sms' },
];

const THEMES: Array<{ value: Theme; emoji: string; label: string }> = [
  { value: 'celebration', emoji: '🎉', label: 'Celebration' },
  { value: 'treat', emoji: '🍽️', label: 'Treat a Friend' },
  { value: 'thankyou', emoji: '❤️', label: 'Thank You' },
];

const CHANNEL_FIELDS: Record<Channel, { label: string; placeholder: string; type: string; pill: boolean }> = {
  whatsapp: { label: "Recipient's WhatsApp Phone Number", placeholder: '0802 345 6789', type: 'tel', pill: true },
  email: { label: "Recipient's Email Address", placeholder: 'samuel.adeleke@example.com', type: 'email', pill: false },
  sms: { label: "Recipient's Mobile Number (SMS)", placeholder: '0802 345 6789', type: 'tel', pill: true },
};

const DEFAULT_MESSAGE = 'Enjoy this lunch on me! Hope you love the woodfire steaks at Urban Grill.';

export function GiftRecipientDetailsModal({ open, onClose, onContinue }: GiftRecipientDetailsModalProps) {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [theme, setTheme] = useState<Theme>('celebration');
  const [scheduled, setScheduled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [fullName, setFullName] = useState('Samuel Adeleke');
  const [email, setEmail] = useState('samuel.adeleke@example.com');
  const [phone, setPhone] = useState('0802 345 6789');

  const field = CHANNEL_FIELDS[channel];
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.join(' ');

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[620px]"
      backdropClassName="bg-on-surface/45 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-2xl"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container" />

      <div className="px-6 pt-6 pb-4 bg-surface-canvas flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-primary font-medium tracking-wide uppercase">
              Step 1 of 2
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-caption text-caption text-text-secondary">Recipient Details</span>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="w-full grid grid-cols-2 gap-2">
          <div className="h-1.5 rounded-full bg-primary-container" />
          <div className="h-1.5 rounded-full bg-surface-container-high" />
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <h2 className="font-heading-lg text-heading-lg text-on-surface flex items-center gap-2">
            Gift this Deal to Someone Special
            <span className="inline-block transform hover:rotate-12 transition-transform">🎁</span>
          </h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Send a voucher pass for <span className="font-medium text-on-surface">Prime 3-Course Lunch Combo</span> at
            Urban Grill &amp; Bistro.
          </p>
        </div>
      </div>

      <div className="mx-6 p-3 rounded-xl bg-surface-container-low flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
          <img
            className="w-full h-full object-cover"
            alt="Plated gourmet grilled steak with roasted rosemary vegetables and artisanal garnish on a rustic slate plate inside Urban Grill restaurant, warm Nigerian hospitality ambiance, soft warm overhead bistro lighting."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJMHIARfSRdfmLjooNWrnoGUTZ6S-X-jLmnOg-Yq6LUQXHL9VZRrdMdsIwVV1MnZI6KXGPg-o_JVXHQ7ziQ4WiIfdhJKMjAx7uNK6Phr3p715JBX-rFxFy3vIdKME6C500V8Os_OUkDa7-WBQLg3Ok_5u6aoU4oP18dg7KvlFXL9pU5SNXArhRWWK1tHPerh7nf9YFsjUtdq-ZTWRoIxfOy8KB7FO-t0Ztojlpy6On"
          />
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            20%
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
              Urban Grill &amp; Bistro
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">₦9,600</span>
          </div>
          <p className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1 mt-0.5">
            <Icon name="format_image_left" className="text-[14px]" />
            No payment charged now — recipient pays ₦9,600 at the counter upon visit.
          </p>
        </div>
      </div>

      <form
        className="px-6 py-5 flex flex-col gap-4 overflow-y-auto"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            channel,
          });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-between">
            <span>Recipient Full Name</span>
            <span className="font-caption text-caption text-text-tertiary font-normal">Required</span>
          </label>
          <div className="relative flex items-center">
            <Icon name="badge" className="absolute left-3.5 text-text-tertiary text-[20px]" />
            <input
              className="w-full h-[50px] pl-11 pr-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none transition-all"
              placeholder="e.g. Samuel Adeleke"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-sm text-label-sm text-on-surface font-semibold">Delivery Method</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-xl text-center">
            {CHANNELS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setChannel(item.value)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-label-sm text-label-sm transition-all ${
                  channel === item.value
                    ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-semibold">{field.label}</label>
          <div className="flex items-center gap-2">
            {field.pill ? (
              <div className="h-[50px] px-3.5 rounded-xl bg-surface-subtle flex items-center gap-2 shrink-0 select-none">
                <span className="text-[18px]">🇳🇬</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">+234</span>
              </div>
            ) : null}
            <div className="relative flex-1 flex items-center">
              <input
                className="w-full h-[50px] px-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none transition-all tracking-wide"
                placeholder={field.placeholder}
                type={field.type}
                required
                value={channel === 'email' ? email : phone}
                onChange={(event) =>
                  channel === 'email' ? setEmail(event.target.value) : setPhone(event.target.value)
                }
              />
              <span className="absolute right-3.5 flex items-center text-badge-discount-text">
                <Icon name="check_circle" filled className="text-[18px]" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">Gift Card Theme</label>
            <span className="font-caption text-caption text-text-tertiary">Select greeting style</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all text-center ${
                  theme === item.value
                    ? 'bg-surface-tint-blue text-primary'
                    : 'bg-surface-subtle text-text-secondary hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="text-xl mb-0.5">{item.emoji}</span>
                <span
                  className={`font-label-sm text-label-sm ${
                    theme === item.value ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">
              Personal Gift Note <span className="font-normal text-text-tertiary">(Optional)</span>
            </label>
            <span className="font-caption text-caption text-text-tertiary">{message.length}/140</span>
          </div>
          <textarea
            className="w-full p-3.5 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none transition-all resize-none leading-relaxed"
            placeholder="Add a warm note for the recipient..."
            rows={2}
            maxLength={140}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
              <Icon name={scheduled ? 'calendar_today' : 'bolt'} className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {scheduled ? 'Schedule Delivery Date' : 'Deliver Immediately'}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                {scheduled
                  ? 'Choose an upcoming birthday, anniversary, or surprise day'
                  : 'Voucher link unlocks right after confirmation'}
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={scheduled}
            aria-label="Schedule delivery"
            onClick={() => setScheduled((value) => !value)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
              scheduled ? 'bg-primary-container' : 'bg-outline-variant'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-canvas shadow-sm transition duration-200 ease-in-out ${
                scheduled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 hover:bg-surface-tint active:scale-[0.99] transition-all"
          >
            <span>Continue to Gift Review</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 py-1 transition-colors"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span>Change claim method</span>
            </button>
            <div className="flex items-center gap-1.5 text-center text-text-tertiary">
              <Icon name="verified_user" filled className="text-[15px] text-badge-discount-text shrink-0" />
              <p className="font-caption text-caption">
                Zero-risk gifting: Your recipient receives a verified VEMTAP pass with redemption instructions.
              </p>
            </div>
          </div>
        </div>
      </form>
    </DesktopModal>
  );
}
