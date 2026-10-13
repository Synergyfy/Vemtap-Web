import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';

interface MessagesSelectRecipientModalProps {
  onClose: () => void;
  onStartChat?: (name: string) => void;
}

type RecipientCategory = 'all' | 'customers' | 'staff' | 'segments';

interface Recipient {
  id: string;
  name: string;
  meta: string;
  avatar?: string;
  initials: string;
  chip: string;
}

const RECIPIENTS: Recipient[] = [
  { id: 'r1', name: 'Michael James', meta: '+234 803 221 7788 · 14 visits', initials: 'MJ', chip: 'VIP' },
  { id: 'r2', name: 'Dr. Chidi Okafor', meta: '+234 809 445 1122 · 8 visits', initials: 'CO', chip: 'Corporate' },
  { id: 'r3', name: 'Sarah Adams', meta: '+234 803 112 4455 · 11 visits', initials: 'SA', chip: 'Deal Active' },
  { id: 'r4', name: 'Amina Bello', meta: '+234 803 445 1122 · 12 visits', initials: 'AB', chip: 'VIP' },
  { id: 'r5', name: 'Zainab Musa', meta: '+234 806 112 3344 · 5 visits', initials: 'ZM', chip: 'Booking' },
  { id: 'r6', name: 'Front Desk Team', meta: '3 staff · Internal channel', initials: 'FD', chip: 'Staff' },
];

const CATEGORIES: Array<{ key: RecipientCategory; label: string }> = [
  { key: 'all', label: 'All Recipients' },
  { key: 'customers', label: 'Customers' },
  { key: 'staff', label: 'Staff' },
  { key: 'segments', label: 'Segments' },
];

export function MessagesSelectRecipientModal({ onClose, onStartChat }: MessagesSelectRecipientModalProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<RecipientCategory>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return RECIPIENTS.filter((r) => {
      if (category === 'customers' && r.chip === 'Staff') return false;
      if (category === 'staff' && r.chip !== 'Staff') return false;
      if (category === 'segments' && r.chip === 'Staff') return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.meta.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, search]);

  const selected = RECIPIENTS.find((r) => r.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md" role="dialog" aria-modal="true" aria-label="Select Recipient">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[580px] max-h-[90vh] bg-surface rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] border border-border overflow-hidden flex flex-col">
        <div className="p-space-md border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading-sm text-heading-sm text-on-surface">Select Recipient</h2>
            <p className="font-caption text-caption text-on-surface-variant">Start a blank message or pick a client</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-space-md border-b border-border space-y-space-sm">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or tag…"
              className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            <button type="button" className="flex items-center gap-space-xs px-space-sm h-11 rounded-xl border border-border bg-surface hover:bg-surface-subtle text-left">
              <Icon name="campaign" className="text-[18px] text-primary" filled />
              <span className="font-label-sm text-label-sm text-on-surface">Customer Blast</span>
            </button>
            <button type="button" className="flex items-center gap-space-xs px-space-sm h-11 rounded-xl border border-border bg-surface hover:bg-surface-subtle text-left">
              <Icon name="qr_code_scanner" className="text-[18px] text-primary" filled />
              <span className="font-label-sm text-label-sm text-on-surface">Scan VEMTAP QR</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-space-2xs">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm border transition-colors ${
                  category === c.key ? 'bg-surface-tint-blue border-primary text-primary font-semibold' : 'bg-surface border-border text-on-surface-variant hover:bg-surface-subtle'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md space-y-space-xs">
          {filtered.map((r) => {
            const active = selectedId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`w-full flex items-center gap-space-sm p-space-sm rounded-xl border text-left transition-colors ${
                  active ? 'border-primary bg-surface-tint-blue' : 'border-border bg-surface hover:bg-surface-subtle'
                }`}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md shrink-0 ${active ? 'bg-primary-container text-on-primary' : 'bg-surface-subtle text-on-surface-variant'}`}>
                  {r.initials}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-label-md text-label-md text-on-surface truncate">{r.name}</span>
                  <span className="block font-caption text-caption text-on-surface-variant truncate">{r.meta}</span>
                </span>
                <span className={`px-space-2xs py-space-2xs rounded font-caption text-caption shrink-0 ${r.chip === 'Staff' ? 'bg-surface-subtle text-on-surface-variant' : 'bg-badge-discount-bg text-badge-discount-text'}`}>
                  {r.chip}
                </span>
                <Icon name="chevron_right" className={`text-[18px] shrink-0 ${active ? 'text-primary' : 'text-text-tertiary'}`} />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-space-md text-center font-body-md text-body-md text-on-surface-variant">No recipients match.</p>
          )}
        </div>

        <div className="p-space-md border-t border-border bg-surface-subtle/40">
          <div className="flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-tint-blue/60 border border-primary/20 mb-space-sm">
            <Icon name="hub" className="text-[16px] text-primary shrink-0" filled />
            <p className="font-label-sm text-label-sm text-on-surface">Seamless Context Linking — order, booking and deal history load into the thread automatically.</p>
          </div>
          <div className="flex items-center justify-between gap-space-sm">
            <button type="button" onClick={onClose} className="h-11 px-space-md rounded-xl border border-border font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (selected) onStartChat?.(selected.name);
                else onStartChat?.('');
                onClose();
              }}
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-2xs"
            >
              <Icon name="chat_bubble" className="text-[18px]" />
              {selected ? `Message ${selected.name}` : 'Start Blank Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
