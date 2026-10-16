import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { FormDropdown, type DropdownOption } from '../ui/FormDropdown';
import {
  ACTIVITY_FILTER_LABELS,
  EXCLUSION_LABELS,
  SAVED_SEGMENTS,
  SPEND_FILTER_LABELS,
  countSegment,
  exclusionReason,
  formatNumber,
  type ActivityFilter,
  type AudienceMode,
  type AudienceOutcome,
  type AudienceSelection,
  type CampaignChannel,
  type CampaignContact,
  type SpendFilter,
} from '../../scripts/campaigns/campaignsData';

interface AudienceSelectorProps {
  channel: CampaignChannel;
  pool: CampaignContact[];
  selection: AudienceSelection;
  outcome: AudienceOutcome;
  onChange: (selection: AudienceSelection) => void;
}

const MODES: Array<{ key: AudienceMode; label: string; desc: string; icon: string }> = [
  { key: 'all', label: 'All customers', desc: 'Everyone on file', icon: 'groups' },
  { key: 'segment', label: 'Saved segment', desc: 'Reuse a cohort', icon: 'loyalty' },
  { key: 'individual', label: 'Pick customers', desc: 'Choose one by one', icon: 'person_search' },
  { key: 'filtered', label: 'Filters', desc: 'Narrow by activity', icon: 'tune' },
];

const ACTIVITY_OPTIONS: DropdownOption[] = (Object.keys(ACTIVITY_FILTER_LABELS) as ActivityFilter[]).map((value) => ({
  value,
  label: ACTIVITY_FILTER_LABELS[value],
  icon: 'repeat',
}));

const SPEND_OPTIONS: DropdownOption[] = (Object.keys(SPEND_FILTER_LABELS) as SpendFilter[]).map((value) => ({
  value,
  label: SPEND_FILTER_LABELS[value],
  icon: 'payments',
}));

const CONSENT_OPTIONS: DropdownOption[] = [
  { value: 'any', label: 'Any consent status', description: 'Ineligible contacts are still excluded', icon: 'how_to_reg' },
  { value: 'opted-in', label: 'Marketing opt-in only', description: 'Only customers who agreed to promotions', icon: 'verified_user' },
];

/**
 * Audience picker shared by the SMS and Email builders.
 *
 * Selected customers and sendable recipients are never treated as the same
 * number: every ineligible contact is counted and explained instead of being
 * silently dropped.
 */
export function AudienceSelector({ channel, pool, selection, outcome, onChange }: AudienceSelectorProps) {
  const [query, setQuery] = useState('');

  const setMode = (mode: AudienceMode) => onChange({ ...selection, mode });

  const eligibleKeys = useMemo(() => new Set(outcome.eligible.map((contact) => contact.key)), [outcome.eligible]);

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pool;
    const digits = needle.replace(/\D/g, '');
    return pool.filter((contact) => {
      if (contact.name.toLowerCase().includes(needle)) return true;
      if (contact.email?.toLowerCase().includes(needle)) return true;
      if (digits.length >= 3 && (contact.phone ?? '').replace(/\D/g, '').includes(digits)) return true;
      return false;
    });
  }, [pool, query]);

  const toggleContact = (key: string) => {
    const selected = new Set(selection.selectedKeys);
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    onChange({ ...selection, mode: 'individual', selectedKeys: [...selected] });
  };

  const selectedSet = useMemo(() => new Set(selection.selectedKeys), [selection.selectedKeys]);

  return (
    <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-space-sm px-space-lg pt-space-lg pb-space-md">
        <div className="flex flex-col gap-space-2xs">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">Choose your audience</h2>
          <p className="font-caption text-caption text-text-secondary">
            Only customers who can receive {channel === 'sms' ? 'SMS' : 'email'} are counted as recipients.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
          <Icon name={channel === 'sms' ? 'sms' : 'mail'} className="text-[15px]" />
          {channel === 'sms' ? 'SMS eligible' : 'Email eligible'}
        </span>
      </div>

      {/* Selection method */}
      <div className="px-space-lg">
        <div role="radiogroup" aria-label="Audience selection method" className="grid grid-cols-2 lg:grid-cols-4 gap-space-xs">
          {MODES.map((mode) => {
            const active = selection.mode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(mode.key)}
                className={`flex items-start gap-space-xs rounded-xl border p-space-sm text-left transition-colors ${
                  active
                    ? 'border-primary bg-surface-tint-blue'
                    : 'border-border-subtle hover:border-border-active hover:bg-surface-subtle'
                }`}
              >
                <Icon name={mode.icon} className={`text-[20px] shrink-0 ${active ? 'text-primary' : 'text-text-tertiary'}`} />
                <span className="flex flex-col min-w-0">
                  <span className={`font-label-md text-label-md truncate ${active ? 'text-primary font-semibold' : 'text-text-primary font-medium'}`}>
                    {mode.label}
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">{mode.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Method detail */}
      <div className="px-space-lg pt-space-md">
        {selection.mode === 'segment' && (
          <div className="flex flex-col gap-space-xs">
            {SAVED_SEGMENTS.map((segment) => {
              const active = selection.segmentKey === segment.key;
              const matched = countSegment(pool, segment.key);
              return (
                <button
                  key={segment.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ ...selection, mode: 'segment', segmentKey: segment.key })}
                  className={`flex items-center gap-space-sm rounded-xl border p-space-sm text-left transition-colors ${
                    active ? 'border-primary bg-surface-tint-blue' : 'border-border-subtle hover:bg-surface-subtle'
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-primary' : 'border-border'}`}>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </span>
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="font-label-md text-label-md text-text-primary font-medium truncate">{segment.label}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">{segment.desc}</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-text-secondary whitespace-nowrap">
                    {formatNumber(matched)} customers
                  </span>
                </button>
              );
            })}
            <p className="font-caption text-caption text-text-tertiary">
              Segments mirror the definitions on your Segments screen. Deal- and branch-specific cohorts are hidden because
              contact records do not carry those fields yet.
            </p>
          </div>
        )}

        {selection.mode === 'filtered' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary">Purchase activity</span>
              <FormDropdown
                ariaLabel="Filter by purchase activity"
                options={ACTIVITY_OPTIONS}
                value={selection.filters.activity}
                onChange={(value) =>
                  onChange({ ...selection, mode: 'filtered', filters: { ...selection.filters, activity: value as ActivityFilter } })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary">Total spend</span>
              <FormDropdown
                ariaLabel="Filter by total spend"
                options={SPEND_OPTIONS}
                value={selection.filters.spend}
                onChange={(value) =>
                  onChange({ ...selection, mode: 'filtered', filters: { ...selection.filters, spend: value as SpendFilter } })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary">Marketing consent</span>
              <FormDropdown
                ariaLabel="Filter by marketing consent"
                options={CONSENT_OPTIONS}
                value={selection.filters.consent}
                onChange={(value) =>
                  onChange({
                    ...selection,
                    mode: 'filtered',
                    filters: { ...selection.filters, consent: value as 'any' | 'opted-in' },
                  })
                }
              />
            </label>
          </div>
        )}

        {selection.mode === 'individual' && (
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <div className="flex flex-1 items-center gap-space-xs bg-surface-container-low px-space-md py-2.5 rounded-xl shadow-sm">
                <Icon name="search" className="text-text-secondary text-[18px]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, phone or email…"
                  aria-label="Search customers"
                  className="bg-transparent flex-1 min-w-0 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...selection, mode: 'individual', selectedKeys: searched.map((contact) => contact.key) })
                }
                className="h-11 px-space-sm rounded-xl border border-border-subtle font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle whitespace-nowrap"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...selection, mode: 'individual', selectedKeys: [] })}
                className="h-11 px-space-sm rounded-xl border border-border-subtle font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle whitespace-nowrap"
              >
                Clear
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto rounded-xl border border-border-subtle divide-y divide-border-subtle">
              {searched.length === 0 && (
                <p className="p-space-md font-body-md text-body-md text-text-secondary text-center">
                  No customers match that search.
                </p>
              )}
              {searched.map((contact) => {
                const reason = exclusionReason(contact, channel);
                const checked = selectedSet.has(contact.key);
                return (
                  <button
                    key={contact.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleContact(contact.key)}
                    className={`w-full flex items-center gap-space-sm px-space-sm py-2.5 text-left transition-colors ${
                      checked ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                        checked ? 'border-primary bg-primary' : 'border-border'
                      }`}
                    >
                      {checked && <Icon name="check" className="text-[13px] text-on-primary" />}
                    </span>
                    <span className="flex flex-col min-w-0 flex-1">
                      <span className="font-label-md text-label-md text-text-primary font-medium truncate">{contact.name}</span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        {[contact.phone || 'No phone', contact.email || 'No email'].join(' · ')}
                      </span>
                    </span>
                    {reason ? (
                      <span
                        title={EXCLUSION_LABELS[reason]}
                        className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-error-container text-on-error font-caption text-caption"
                      >
                        <Icon name="warning" className="text-[13px]" />
                        <span className="hidden sm:inline">Excluded</span>
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption">
                        Eligible
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recipient summary — selected customers are never assumed sendable. */}
      <div className="mt-space-md px-space-lg pb-space-lg">
        <div className="rounded-xl bg-surface-subtle p-space-md space-y-space-sm">
          <div className="flex flex-wrap items-end justify-between gap-space-sm">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary">Eligible recipients</span>
              <span className="font-heading-lg text-heading-lg text-text-primary font-bold leading-none">
                {formatNumber(outcome.eligible.length)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm font-label-sm text-label-sm text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Icon name="person" className="text-[15px]" />
                {formatNumber(outcome.matched.length)} selected
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="block" className="text-[15px]" />
                {formatNumber(outcome.excludedCount)} excluded
              </span>
            </div>
          </div>

          {eligibleKeys.size === 0 && (
            <p className="flex items-start gap-space-2xs font-label-sm text-label-sm text-on-error bg-error-container/50 rounded-lg px-space-sm py-2">
              <Icon name="error" className="text-[16px] shrink-0 mt-0.5" />
              No one in this audience can receive {channel === 'sms' ? 'an SMS' : 'an email'} yet. Adjust the audience or ask
              customers to opt in.
            </p>
          )}

          {outcome.exclusionCounts.length > 0 && (
            <div className="flex flex-col gap-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Why contacts are excluded</span>
              <div className="flex flex-wrap gap-space-2xs">
                {outcome.exclusionCounts.map((entry) => (
                  <span
                    key={entry.reason}
                    className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-canvas border border-border-subtle font-caption text-caption text-text-secondary"
                  >
                    <span className="font-semibold text-text-primary">{formatNumber(entry.count)}</span>
                    {entry.label}
                  </span>
                ))}
              </div>
              <p className="font-caption text-caption text-text-tertiary">
                Excluded contacts are never sent to and are never counted as recipients.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
