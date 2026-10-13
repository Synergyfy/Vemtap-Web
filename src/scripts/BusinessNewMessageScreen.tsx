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

const RECIPIENTS: Recipient[] = [
  {
    id: 'michael',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp9wIOf7dV37VydYMTjjIgoKYwSkhRJGoOu8nxGxPnVlUHvddoEnpra8-9J3YlCuQkYELJEdIz90dSsFZs74Q66vn5tA7dFzTH9pkhN6Bx4DPxcVRu1Zp6TI0eJ9wJO5ambAAm9weXp3XBwh8tJYZFHVWSFi_FV885dltx2DHAVPRXctclhhH4e0hMQNt8MB82dolNUCfiQdlPK04dGnW8t-dosllyuve9UsTS7yQ8anXGnvhEeThcgg',
    alt: 'Modern close up headshot portrait of a smiling young African male customer with warm studio lighting wearing a casual navy jacket against an elegant blurred background',
    name: 'Michael James',
    verified: true,
    tagIcon: 'receipt_long',
    tagLabel: 'Order #VG-94021 • Ribeye Steak',
    tagClass: 'bg-surface-tint-blue text-primary-container',
    phone: '+234 803 219 8831',
    status: 'Active 15m ago',
    statusPrimary: true,
    category: 'orders',
  },
  {
    id: 'sarah',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBryqAQ9o6KnQCxV2VoFSjIaIdatam1027D1atdZ3FhUCBUhPW5niR960DOMzIHpzkiEFBKG-wQgWK4XA__rx1Pudg8VkY08jpydlDmXqPe8pRlVpGsKCL78k0r5pKvQRJY3UefNeoqYC34vYnvdftTc7SCZzlm_GOrHSPgZH0ih8FupjOB_a92Ztx0w--YzyXqpPj4Wet4OWJwT0Ux0-J3ONBqG0AwgFY5i6hjNgG8az9_Yk8IqCb4AQ',
    alt: 'Vibrant daylight outdoor portrait of an energetic young professional woman with natural hair and bright genuine expression wearing minimal chic accessories',
    name: 'Sarah Adams',
    verified: true,
    tagIcon: 'local_offer',
    tagLabel: 'Claimed 20% Lunch Combo',
    tagClass: 'bg-badge-discount-bg text-badge-discount-text',
    phone: '+234 812 443 0912',
    status: 'Today, 10:15 AM',
    category: 'deals',
  },
  {
    id: 'chidi',
    initials: 'CO',
    initialsClass: 'bg-secondary-container text-on-secondary-container',
    name: 'Dr. Chidi Okafor',
    verified: true,
    tagIcon: 'calendar_month',
    tagLabel: 'Booking #BK-77402 • Table of 4',
    tagClass: 'bg-surface-container-high text-on-surface',
    phone: '+234 802 771 9044',
    status: 'Reserved: Sat Oct 19',
    category: 'bookings',
  },
  {
    id: 'amaka',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCH5ef6YqvI2KCikW9eTZwKvPltBvM5XVF45qSvdyzEnq51JZW3iDWn1TwaDphUHueTkrB1m3awi3aNLZajkqSWvLPcDFgnuDvZ0kY_KU3s_0HieUefg4C4GNYenJ4x7zu9H-HW8GaVbeKnIFOoJV-tVhE02igH5BYQ7117ELiRZ1ZmVrhpi_ih8l0Q_TLDbMNjkP8nC8_fLVYjusJDamMYMFjlhiH8aGlXxD1lEtsT2m9wxY_jdxI-w',
    alt: 'Minimalist clean aesthetics product display studio portrait of organic wellness items and warm skin cosmetics on soft pastel background with pleasant lighting',
    name: 'Amaka Beauty & Wellness',
    verified: true,
    tagIcon: 'inventory_2',
    tagLabel: 'Product Inquiry • Glow Serum',
    tagClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    phone: '+234 818 902 3341',
    status: 'Inquired 1h ago',
    category: 'inquiry',
  },
  {
    id: 'halima',
    initials: 'HY',
    initialsClass: 'bg-primary-fixed text-on-primary-fixed',
    name: 'Halima Yusuf',
    verified: true,
    tagIcon: 'star',
    tagLabel: 'Past Customer • 3 Orders',
    tagClass: 'bg-surface-subtle text-text-primary',
    tagIconFill: true,
    phone: '+234 805 112 7890',
    status: 'Repeat Patron',
    category: 'loyalty',
  },
  {
    id: 'tunde',
    initials: 'TB',
    initialsClass: 'bg-surface-dim text-on-surface-variant',
    name: 'Tunde Bakare',
    tagIcon: 'corporate_fare',
    tagLabel: 'Corporate Catering Inquiry',
    tagClass: 'bg-surface-tint-blue text-primary',
    phone: '+234 803 555 1204',
    status: 'New Lead',
    category: 'inquiry',
  },
];

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
                {recipient.id === 'michael' && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-badge-discount-text ring-2 ring-surface-canvas" />
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
