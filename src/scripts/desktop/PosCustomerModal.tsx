import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { POS_CUSTOMERS, naira, type PosCustomerRecord } from './posRegisterExtras';
import { hasApiConfig } from '../../services/api/client';
import { useDebounced, useLiveCustomerLookup } from '../posLive';

/**
 * Till-side customer picker.
 *
 * A walk-in can be rung up with **no** customer details at all (the caller
 * simply never opens this). When the cashier wants to attach one, this modal
 * offers the two required paths:
 *
 *  1. Search  — look up someone already in the business directory by name,
 *     phone or email.
 *  2. Add New — capture a new person (name + phone required, email optional).
 *     If the phone already belongs to a VEMTAP member they are matched and
 *     synced into the business directory; otherwise they are added to both the
 *     business directory and the VEMTAP network.
 */
export function PosCustomerModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (customer: PosCustomerRecord) => void;
}) {
  const [tab, setTab] = useState<'search' | 'add'>('search');
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = hasApiConfig();
  const search = useDebounced(query.trim());
  const lookup = useLiveCustomerLookup(search, false, 20);
  const liveResults = useMemo(() => lookup.rows.map((row) => row.record), [lookup.rows]);

  const results = useMemo(() => {
    if (live) return liveResults;
    const q = query.trim().toLowerCase();
    if (!q) return POS_CUSTOMERS;
    const digits = q.replace(/\D/g, '');
    return POS_CUSTOMERS.filter((customer) => {
      if (customer.name.toLowerCase().includes(q)) return true;
      if (customer.email?.toLowerCase().includes(q)) return true;
      // Phone match on digits so spacing/+/country code don't matter.
      if (digits && customer.phone.replace(/\D/g, '').includes(digits)) return true;
      return false;
    });
  }, [query, live, liveResults]);

  /** VEMTAP member already known by this phone — used to pick 2A vs 2B. */
  const vemtapMatch = useMemo(() => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) return null;
    return POS_CUSTOMERS.find((customer) => customer.onVemtap && customer.phone.replace(/\D/g, '').includes(digits)) ?? null;
  }, [phone]);

  const submitNew = () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 7) {
      setError('Enter a name and a valid phone number. Email is optional.');
      return;
    }
    if (live) {
      // There is no till-side create endpoint yet; customers join by invite.
      setError('Adding customers at the till is coming soon — invite them from Customers instead.');
      return;
    }
    setError(null);
    setSaving(true);
    window.setTimeout(() => {
      const digits = phone.replace(/\D/g, '');
      // Existing directory record by phone → reuse it (2A).
      const existing = POS_CUSTOMERS.find((customer) => customer.phone.replace(/\D/g, '').includes(digits));
      if (existing) {
        onSelect(existing);
        return;
      }
      // Brand new person → 2A (already on VEMTAP) or 2B (join VEMTAP too).
      const record: PosCustomerRecord = {
        id: `walkin-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        onVemtap: Boolean(vemtapMatch),
        tier: vemtapMatch?.tier ?? 'Member',
        tierClass: vemtapMatch?.tierClass ?? 'bg-surface-container text-text-secondary',
        points: vemtapMatch?.points ?? 0,
        spend: vemtapMatch?.spend ?? 0,
        visits: (vemtapMatch?.visits ?? 0) + 1,
      };
      POS_CUSTOMERS.unshift(record);
      onSelect(record);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Attach customer">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-canvas rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[86vh]">
        {/* Header */}
        <div className="px-space-lg pt-space-lg pb-space-sm border-b border-border-subtle">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Attach Customer</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Optional — a walk-in can be rung up without any details.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-space-sm flex items-center gap-1 p-1 rounded-xl bg-surface-subtle">
            <button
              type="button"
              onClick={() => setTab('search')}
              className={`flex-1 h-10 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'search' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="search" className="text-[16px]" />
              <span>Search Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('add')}
              className={`flex-1 h-10 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'add' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="person_add" className="text-[16px]" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {tab === 'search' ? (
          <>
            <div className="px-space-lg py-space-sm">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, phone or email…"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-space-lg pb-space-lg">
              {results.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-center gap-2">
                  <Icon name="person_search" className="text-[32px] text-text-tertiary" />
                  <p className="font-body-md text-body-md text-text-secondary">No customer matches that search.</p>
                  <button
                    type="button"
                    onClick={() => setTab('add')}
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  >
                    Add them as a new customer →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => onSelect(customer)}
                      className="w-full p-space-sm rounded-xl bg-surface hover:bg-surface-tint-blue text-left transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold text-label-sm flex items-center justify-center shrink-0">
                          {customer.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{customer.name}</span>
                            {customer.onVemtap && <Icon name="verified" filled className="text-[14px] text-primary shrink-0" />}
                          </div>
                          <span className="font-caption text-caption text-text-secondary truncate block">
                            {customer.phone} · {customer.points.toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${customer.tierClass}`}>
                        {customer.tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-space-lg py-space-md flex flex-col gap-space-sm">
            <p className="font-caption text-caption text-text-secondary">
              Capture the customer&apos;s details to add them to this business. Email is optional.
            </p>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Customer Name *</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chinedu Okafor"
                className="h-11 px-3 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Phone Number *</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="e.g. +234 803 000 0000"
                className="h-11 px-3 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Email (optional)</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                placeholder="name@example.com"
                className="h-11 px-3 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </label>

            {/* Live hint: existing VEMTAP member (2A) vs brand new (2B). */}
            {phone.replace(/\D/g, '').length >= 7 && (
              <div
                className={`p-space-sm rounded-xl flex items-start gap-2 ${
                  vemtapMatch ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                }`}
              >
                <Icon
                  name={vemtapMatch ? 'verified' : 'person_add'}
                  className={`text-[18px] shrink-0 mt-0.5 ${vemtapMatch ? 'text-primary' : 'text-text-secondary'}`}
                />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  {vemtapMatch ? (
                    <>
                      Existing VEMTAP member <strong className="text-text-primary">{vemtapMatch.name}</strong> — they&apos;ll be
                      linked to your business directory and keep their {vemtapMatch.points.toLocaleString()} points.
                    </>
                  ) : (
                    <>Not on VEMTAP yet — they&apos;ll be added to your business directory and the VEMTAP network.</>
                  )}
                </p>
              </div>
            )}

            {error && (
              <p className="font-caption text-caption text-error flex items-center gap-1">
                <Icon name="error" className="text-[14px]" />
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submitNew}
              disabled={saving}
              className="mt-1 h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary font-bold shadow-sm hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Icon name="progress_activity" className="text-[18px] animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Icon name="check" className="text-[18px]" />
                  <span>Add &amp; Attach</span>
                </>
              )}
            </button>
            <p className="font-caption text-caption text-text-tertiary text-center pb-2">
              {vemtapMatch ? `Syncs to VEMTAP member · ${naira(0)} due now` : 'Added to business directory + VEMTAP network'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
