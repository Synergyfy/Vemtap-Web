import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { RadioCard, SettingsSection } from './FormPrimitives';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { analyticsRange } from '../../hooks/business/useBusinessAnalytics';
import { businessAnalyticsService, type ExportModule } from '../../services/businessAnalyticsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { downloadBase64 } from '../../utils/exportCsv';

const SECTIONS: { key: ExportModule; label: string; body: string }[] = [
  { key: 'overview', label: 'Business overview', body: 'Revenue, orders, visits and trends' },
  { key: 'customers', label: 'Customers', body: 'New vs returning, loyalty and top spenders' },
  { key: 'deals', label: 'Deals', body: 'Claims, redemptions and best performers' },
  { key: 'locations', label: 'Locations', body: 'Branch-by-branch comparison' },
  { key: 'pos', label: 'POS', body: 'Sales, payment methods and best sellers' },
  { key: 'audit', label: 'Audit trail', body: 'Who changed what, and when' },
];

const RANGES = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
];

/** Live analytics export: pick period, scope, sections and format, then download. */
export function AnalyticsExportPanel() {
  const { activeBranchId, branch } = useBusinessBranch();
  const [days, setDays] = useState(30);
  const [format, setFormat] = useState<'csv' | 'pdf'>('pdf');
  const [scope, setScope] = useState<'branch' | 'all'>('all');
  const [sections, setSections] = useState<ExportModule[]>(SECTIONS.map((s) => s.key).filter((k) => k !== 'audit'));
  const [done, setDone] = useState<string | null>(null);

  const run = useMutation({
    mutationFn: () =>
      businessAnalyticsService.export({
        ...analyticsRange(days),
        branchId: scope === 'branch' ? activeBranchId : undefined,
        format,
        modules: sections,
      }),
    onSuccess: (file) => {
      downloadBase64(file.filename, file.mimeType, file.contentBase64);
      setDone(`Downloaded ${file.filename}${file.records !== undefined ? ` · ${file.records} records` : ''}`);
    },
  });

  const toggle = (key: ExportModule) => setSections((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      <SettingsSection title="Period" icon="date_range">
        <div role="radiogroup" aria-label="Period" className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
          {RANGES.map((r) => (
            <RadioCard key={r.days} title={r.label} selected={days === r.days} onSelect={() => setDays(r.days)} />
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="Branches" icon="store">
        <div role="radiogroup" aria-label="Branches" className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
          <RadioCard title="All branches" selected={scope === 'all'} onSelect={() => setScope('all')} />
          <RadioCard
            title={branch?.name ?? 'This branch'}
            body="Only the branch you have selected"
            selected={scope === 'branch'}
            onSelect={() => setScope('branch')}
          />
        </div>
      </SettingsSection>
      <SettingsSection title="Sections" icon="checklist">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
          {SECTIONS.map((section) => {
            const on = sections.includes(section.key);
            return (
              <button
                key={section.key}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(section.key)}
                className={`flex items-start gap-space-xs p-space-sm rounded-lg text-left border ${
                  on ? 'bg-surface-tint-blue border-primary/40' : 'bg-surface-subtle border-transparent'
                }`}
              >
                <Icon name={on ? 'check_box' : 'check_box_outline_blank'} className={`text-[20px] ${on ? 'text-primary' : 'text-text-tertiary'}`} />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary font-medium">{section.label}</span>
                  <span className="font-caption text-caption text-text-secondary">{section.body}</span>
                </span>
              </button>
            );
          })}
        </div>
      </SettingsSection>
      <SettingsSection title="Format" icon="description">
        <div role="radiogroup" aria-label="Format" className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
          <RadioCard title="PDF report" body="For sharing and printing" selected={format === 'pdf'} onSelect={() => setFormat('pdf')} />
          <RadioCard title="CSV spreadsheet" body="For Excel or Google Sheets" selected={format === 'csv'} onSelect={() => setFormat('csv')} />
        </div>
      </SettingsSection>
      <div className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col sm:flex-row sm:items-center gap-space-sm justify-between">
        <span className={`font-caption text-caption ${run.isError ? 'text-red-600' : 'text-text-secondary'}`} aria-live="polite">
          {run.isError
            ? planErrorMessage(run.error) ?? apiErrorMessage(run.error, 'Could not build the report.')
            : !sections.length
              ? 'Pick at least one section.'
              : done ?? `${sections.length} section${sections.length === 1 ? '' : 's'} · ${format.toUpperCase()}`}
        </span>
        <button
          type="button"
          disabled={!sections.length || run.isPending}
          onClick={() => {
            setDone(null);
            run.mutate();
          }}
          className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Icon name="download" className="text-[18px]" />
          {run.isPending ? 'Building…' : 'Download report'}
        </button>
      </div>
    </div>
  );
}
