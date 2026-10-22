import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessNewMessageScreenProps {
  onBack: () => void;
  onRecipientSelected: (name: string, context: string) => void;
}

type AudienceChipKey = 'recent' | 'orders' | 'bookings' | 'deals' | 'all';

const AUDIENCE_CHIPS: { key: AudienceChipKey; label: string }[] = [
  { key: 'recent', label: 'Recent Customers' },
  { key: 'orders', label: 'Active Orders' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'deals', label: 'Deal Claimers' },
  { key: 'all', label: 'All Contacts' },
];

interface Recipient {
  id: string;
  img?: string;
  alt?: string;
  initials?: string;
  initialsClass?: string;
  name: string;
  verified?: boolean;
  tagIcon: string;
  tagLabel: string;
  tagClass: string;
  tagIconFill?: boolean;
  phone: string;
  status: string;
  statusPrimary?: boolean;
  category: 'orders' | 'bookings' | 'deals' | 'loyalty' | 'inquiry';
}

const RECIPIENTS: Recipient[] = [];

export function BusinessNewMessageScreen({ onBack, onRecipientSelected }: BusinessNewMessageScreenProps) {
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<AudienceChipKey>('recent');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const selectTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (selectTimer.current !== null) window.clearTimeout(selectTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const handleSelect = (recipient: Recipient) => {
    showToast(`Connecting to ${recipient.name}...`);
    if (selectTimer.current !== null) window.clearTimeout(selectTimer.current);
    selectTimer.current = window.setTimeout(() => onRecipientSelected(recipient.name, recipient.tagLabel), 1200);
  };

  const matchesChip = (recipient: Recipient) => {
    if (chip === 'recent' || chip === 'all') return true;
    if (chip === 'orders') return recipient.category === 'orders';
    if (chip === 'bookings') return recipient.category === 'bookings';
    if (chip === 'deals') return recipient.category === 'deals';
    return true;
  };

  const visibleRecipients = RECIPIENTS.filter(
    (recipient) =>
      matchesChip(recipient) &&
      (query.trim() === '' || recipient.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <AppScreen>
      {/* Select Recipient Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface">Select Recipient</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-8">
        {/* Search Surface */}
        <div className="px-margin pt-space-xs pb-space-sm bg-surface">
          <div className="relative flex items-center w-full">
            <Icon name="search" className="absolute left-4 text-outline text-[20px] pointer-events-none select-none" />
            <input
              className="w-full h-[50px] bg-surface-container-low pl-11 pr-10 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all duration-200"
              placeholder="Search customer, phone, order #..."
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query.length > 0 && (
              <button
                aria-label="Clear search input"
                className="absolute right-3 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface active:bg-surface-container transition-colors"
                type="button"
                onClick={() => setQuery('')}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Dispatch Actions */}
        <div className="px-margin grid grid-cols-1 gap-space-xs pt-space-xs pb-space-md">
          <button
            className="group relative flex items-center gap-space-sm p-3.5 bg-surface-canvas rounded-xl text-left shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden"
            type="button"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center shrink-0">
              <Icon name="campaign" className="text-primary-container text-[24px]" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                  Send Customer Announcement
                </span>
                <span className="inline-flex px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-medium tracking-tight shrink-0">
                  Blast
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                Reach recent visitors & deal claimers instantly
              </p>
            </div>
            <Icon name="arrow_forward_ios" className="text-outline-variant group-hover:text-primary-container text-[20px] transition-colors shrink-0" />
          </button>
          <button
            className="group relative flex items-center gap-space-sm p-3.5 bg-surface-canvas rounded-xl text-left shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden"
            type="button"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
              <Icon name="qr_code_scanner" className="text-on-surface-variant text-[24px]" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <span className="font-label-md text-label-md font-semibold text-text-primary block truncate">
                Scan Customer VEMTAP QR
              </span>
              <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                Open active chat directly from in-store pass
              </p>
            </div>
            <Icon name="arrow_forward_ios" className="text-outline-variant group-hover:text-primary-container text-[20px] transition-colors shrink-0" />
          </button>
        </div>

        {/* Recipient Filter Rail */}
        <div className="w-full overflow-x-auto no-scrollbar py-space-xs px-margin flex items-center gap-space-xs">
          {AUDIENCE_CHIPS.map((audienceChip) => {
            const active = audienceChip.key === chip;
            return (
              <button
                className={`shrink-0 px-3.5 py-2 rounded-full font-label-md text-label-md transition-all ${
                  active
                    ? 'bg-surface-tint-blue text-primary-container font-semibold shadow-sm'
                    : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                }`}
                key={audienceChip.key}
                type="button"
                onClick={() => setChip(audienceChip.key)}
              >
                {audienceChip.label}
              </button>
            );
          })}
        </div>

        {/* Customer List Section Header */}
        <div className="px-margin pt-space-md pb-space-xs flex items-center justify-between">
          <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
            Suggested Customers
          </span>
          <span className="font-caption text-caption text-text-secondary">{visibleRecipients.length} contacts ready</span>
        </div>

        {/* Recipient List Stack */}
        {visibleRecipients.length === 0 ? (
          <div className="px-margin pt-space-sm">
            <div className="w-full bg-surface-container-low rounded-xl p-space-lg text-center shadow-sm">
              <div className="w-14 h-14 mx-auto mb-space-sm rounded-full bg-surface-tint-blue flex items-center justify-center">
                <Icon name="people" className="text-primary text-[28px]" />
              </div>
              <h4 className="font-heading-sm text-heading-sm text-on-surface mb-1">No customer threads yet</h4>
              <p className="font-body-md text-body-md text-text-secondary max-w-xs mx-auto">
                Customer conversations and live leads will appear here once the backend starts returning real chat data.
              </p>
            </div>
          </div>
        ) : (
          <div className="px-margin flex flex-col gap-space-xs">
            {visibleRecipients.map((recipient) => (
              <button
                className="customer-card relative flex items-center gap-space-sm p-3.5 bg-surface-canvas rounded-xl shadow-sm hover:shadow-md active:bg-surface-subtle transition-all cursor-pointer text-left w-full"
                key={recipient.id}
                type="button"
                onClick={() => handleSelect(recipient)}
              >
                <div className="relative w-12 h-12 shrink-0">
                  {recipient.img ? (
                    <img alt={recipient.alt} className="w-12 h-12 rounded-full object-cover shadow-sm" src={recipient.img} />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-label-md font-semibold shadow-sm ${recipient.initialsClass}`}
                    >
                      {recipient.initials}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                      {recipient.name}
                    </span>
                    {recipient.verified && (
                      <Icon name="verified" filled className="text-primary-container text-[16px] shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-caption text-caption font-medium max-w-full ${recipient.tagClass}`}
                    >
                      <Icon name={recipient.tagIcon} filled={recipient.tagIconFill} className="text-[13px] shrink-0" />
                      <span className="truncate">{recipient.tagLabel}</span>
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1.5 truncate">
                    <span>{recipient.phone}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0" />
                    <span className={recipient.statusPrimary ? 'text-primary-container font-medium' : ''}>
                      {recipient.status}
                    </span>
                  </p>
                </div>
                <Icon name="chevron_right" className="text-outline-variant text-[20px] shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Smart Helper Floating Card */}
        <div className="px-margin pt-space-lg">
          <div className="relative overflow-hidden p-4 rounded-xl bg-surface-tint-blue flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="lightbulb" className="text-primary-container text-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-label-sm text-label-sm font-semibold text-text-primary">Seamless Context Linking</h4>
              <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                Starting a conversation automatically pins the customer's live cart, reservation, or redeemed promo
                inside the staff chat view.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[340px] w-full px-4 z-50">
          <div className="bg-inverse-surface text-inverse-on-surface py-3 px-4 rounded-xl shadow-xl flex items-center gap-3">
            <Icon name="chat" className="text-primary-fixed text-[20px] shrink-0" />
            <p className="font-label-sm text-label-sm text-inverse-on-surface truncate flex-1">{toast}</p>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
