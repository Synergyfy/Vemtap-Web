import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface BusinessCustomerProfileScreenProps {
  customerName?: string;
  onBack: () => void;
  onMessage?: () => void;
}

const AVATARS: Record<string, string> = {
  'Michael James':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDa7q3nBZJ3uGvSGMu7L_jvAlVz0h4s1o_oxGwOETe8GdszBG8lIQpy--nM9G1EqUCc3qWrjo6dU7lvQtchrLsSmRh3S6sJsZe_1GQKiAc4DXpahE5sq4zs8w-8mQA1PwDNfuhk3BOfWWhg4---m8PwyD_npCqz0RMYF9LC-dyuKaGnJ44B1_XTCHf555T53022Y9r0Xg97JOxMTv_qBICVRSujl4GARLHePoZnha9rjPTj9w2lS2JZ5Q',
  'Sarah Adams':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB9MFxVPnXVp7i8k6sa3Dou2u5GhYILQh3hnwFQR4R2mnTHSCpQllITlpKvF9eATWP4dZUb9Y0zbniuQfjXGsfGlx8tQGMxA0pgITwjhF2LLarj6XpWLLxVYGSg1zEJ7aJEUtuJIxi2vq6mt7Dj8Bo8jI66IAjGYQBTE6Yo05xFkYVeGI8-6KzI8vSM9kSEH_ADpdUmsK5Qt4XhycBL_hkJHXOUE3kJ7ujYaLxTRW1-Xc9mtf_9Bk3Vgw',
};

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDp5xj4pR3MVJ7OYqKn1fJ6vVDwf_L0oMA9-wAYBIBQMuZSAnKG0sPo_FYYYrLNAv3IxIuWDWvYOjbUuPzMdLMGFKkJLJzg2ksm0traOeWPNuh-UG1tL8UoSstDJYSH8CvPE4FxGiuqeg1zy9HXz6jMvVvCo5P6swnaa9NmFmfLomgTmYyijBKYD3DYUrKBEzfgrs71aHV7ZSNRCMviW4oaq0JQS_zeRoP5D5pcHjjl7DKSVm3ol9CzBQ';

const RELATIONSHIP_METRICS = [
  { label: 'Total Spend', value: '₦318,500', icon: 'payments', tone: 'text-primary bg-surface-tint-blue' },
  { label: 'Visits', value: '14', icon: 'storefront', tone: 'text-on-surface bg-surface-container-low' },
  { label: 'Avg. Order', value: '₦22,750', icon: 'receipt_long', tone: 'text-on-surface bg-surface-container-low' },
  { label: 'Points', value: '2,450', icon: 'stars', tone: 'text-badge-discount-text bg-badge-discount-bg' },
];

const INTERACTIONS = [
  {
    icon: 'receipt_long',
    title: 'Order placed & paid',
    meta: 'Today, 9:24 AM · Order #VG-94021 · ₦28,400',
    tone: 'bg-surface-tint-blue text-primary',
  },
  {
    icon: 'loyalty',
    title: 'Redeemed 500 loyalty points',
    meta: 'Today, 9:26 AM · Free appetiser at Wuse 2',
    tone: 'bg-badge-discount-bg text-badge-discount-text',
  },
  {
    icon: 'chat',
    title: 'Replied to lunch combo offer',
    meta: 'Yesterday, 6:12 PM · 2 messages',
    tone: 'bg-surface-container-low text-on-surface-variant',
  },
  {
    icon: 'event_seat',
    title: 'Table booking confirmed',
    meta: 'Oct 04, 7:30 PM · 6 guests · Booking #BK-77402',
    tone: 'bg-surface-container-low text-on-surface-variant',
  },
];

const TRANSACTIONS = [
  { id: '#VG-94021', date: 'Today, 9:24 AM', amount: '₦28,400', status: 'Paid', tone: 'text-badge-discount-text bg-badge-discount-bg' },
  { id: '#VG-93877', date: 'Sep 28, 1:12 PM', amount: '₦19,900', status: 'Paid', tone: 'text-badge-discount-text bg-badge-discount-bg' },
  { id: '#VG-93514', date: 'Sep 21, 8:05 PM', amount: '₦41,200', status: 'Paid', tone: 'text-badge-discount-text bg-badge-discount-bg' },
  { id: '#VG-93102', date: 'Sep 14, 2:48 PM', amount: '₦12,600', status: 'Refunded', tone: 'text-error bg-error-container' },
];

export function BusinessCustomerProfileScreen({
  customerName = 'Michael James',
  onBack,
  onMessage,
}: BusinessCustomerProfileScreenProps) {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ text: string; meta: string }[]>([
    { text: 'Prefers corner booth near the window. Allergic to shellfish.', meta: 'Added by Chidi (Manager) · Sep 30, 4:10 PM' },
    { text: 'Celebrates wedding anniversary every September — send a small treat.', meta: 'Added by You · Sep 12, 11:02 AM' },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const firstName = customerName.split(' ')[0];
  const avatar = AVATARS[customerName] ?? DEFAULT_AVATAR;

  const addNote = () => {
    const value = note.trim();
    if (!value) return;
    setNotes((current) => [{ text: value, meta: 'Added by You · Just now' }, ...current]);
    setNote('');
    showToast('Note added to customer record');
  };

  return (
    <AppScreen>
      <ScreenHeader title="Customer Profile" onBack={onBack} />

      <div className="flex flex-col w-full flex-1 pb-10">
        {/* Hero contact card */}
        <section className="px-margin pt-space-md">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex items-start gap-space-sm">
            <div className="relative shrink-0">
              <img
                alt={`${customerName} portrait`}
                className="w-16 h-16 rounded-full object-cover bg-surface-container shadow-sm"
                src={avatar}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center"
                title="Verified Customer"
              >
                <Icon name="verified" filled className="text-[12px]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">{customerName}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  <Icon name="diamond" className="text-[12px]" />
                  VIP Tier
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1.5">
                <Icon name="call" className="text-[13px] text-text-tertiary" />
                +234 803 219 8831
              </p>
              <p className="font-caption text-caption text-text-secondary mt-0.5 flex items-center gap-1.5">
                <Icon name="mail" className="text-[13px] text-text-tertiary" />
                michael.james@gmail.com
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded bg-surface-container-low text-text-secondary font-caption text-caption">
                  Frequent Patron
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-low text-text-secondary font-caption text-caption">
                  Top 5% Spender
                </span>
                <span className="px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Shellfish allergy
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Action strip */}
        <section className="px-margin pt-space-sm">
          <div className="grid grid-cols-4 gap-space-xs">
            {[
              { icon: 'chat', label: 'Message', onClick: () => (onMessage ? onMessage() : showToast('Opening conversation…')) },
              { icon: 'call', label: 'Call', onClick: () => showToast(`Calling ${firstName}…`) },
              { icon: 'card_giftcard', label: 'Offer', onClick: () => showToast('VIP offer sent successfully') },
              { icon: 'person_remove', label: 'Flag', onClick: () => showToast('Marked for review') },
            ].map((action) => (
              <button
                className="h-14 rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 text-on-surface-variant"
                key={action.label}
                type="button"
                onClick={action.onClick}
              >
                <Icon name={action.icon} className="text-[18px] text-primary" />
                <span className="font-caption text-caption leading-none">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Relationship summary */}
        <section className="px-margin pt-space-md">
          <h3 className="font-label-md text-label-md text-text-primary font-semibold">Relationship Summary</h3>
          <div className="grid grid-cols-2 gap-space-xs mt-space-xs">
            {RELATIONSHIP_METRICS.map((metric) => (
              <div className="bg-surface-canvas rounded-xl p-space-xs shadow-sm flex items-center gap-space-xs" key={metric.label}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${metric.tone}`}>
                  <Icon name={metric.icon} className="text-[16px]" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading-sm text-heading-sm text-text-primary leading-none">{metric.value}</p>
                  <p className="font-caption text-caption text-text-secondary mt-1 truncate">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent interactions */}
        <section className="px-margin pt-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-text-primary font-semibold">Recent Interactions</h3>
            <span className="font-caption text-caption text-text-tertiary">Last 7 days</span>
          </div>
          <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm mt-space-xs divide-y divide-border-subtle">
            {INTERACTIONS.map((item) => (
              <div className="flex items-start gap-space-xs py-2 px-1.5" key={item.title}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.tone}`}>
                  <Icon name={item.icon} className="text-[15px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-label-sm text-label-sm text-text-primary truncate">{item.title}</p>
                  <p className="font-caption text-caption text-text-tertiary truncate">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent transactions */}
        <section className="px-margin pt-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-text-primary font-semibold">Recent Transactions</h3>
            <button className="font-caption text-caption text-primary font-semibold" type="button" onClick={() => showToast('Opening full transaction history…')}>
              See all
            </button>
          </div>
          <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm mt-space-xs divide-y divide-border-subtle">
            {TRANSACTIONS.map((tx) => (
              <div className="flex items-center justify-between gap-space-xs py-2 px-1.5" key={tx.id}>
                <div className="min-w-0">
                  <p className="font-label-sm text-label-sm text-text-primary truncate">Order {tx.id}</p>
                  <p className="font-caption text-caption text-text-tertiary">{tx.date}</p>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">{tx.amount}</span>
                  <span className={`px-1.5 py-0.5 rounded font-caption text-caption font-semibold ${tx.tone}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Staff notes */}
        <section className="px-margin pt-space-md">
          <h3 className="font-label-md text-label-md text-text-primary font-semibold">Staff Notes & Preferences</h3>
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm mt-space-xs flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <input
                className="flex-1 h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle"
                placeholder="Add a quick note for the team…"
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addNote();
                }}
              />
              <button
                className="h-10 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold shrink-0 active:scale-95 transition-transform"
                type="button"
                onClick={addNote}
              >
                Add
              </button>
            </div>
            <div className="flex flex-col gap-space-xs">
              {notes.map((entry, index) => (
                <div className="rounded-xl bg-surface-container-low p-space-xs" key={`${entry.text}-${index}`}>
                  <p className="font-label-sm text-label-sm text-on-surface leading-relaxed">{entry.text}</p>
                  <p className="font-caption text-caption text-text-tertiary mt-1">{entry.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
