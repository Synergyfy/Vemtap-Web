import { useState, type ReactNode } from 'react';
import { Icon } from './ui/Icon';

export type AnalyticsTabKey = 'business' | 'customers' | 'deals' | 'locations' | 'pos';

export interface AnalyticsHeaderProps {
  active: AnalyticsTabKey;
  onTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
}

const TABS: { key: AnalyticsTabKey; label: string }[] = [
  { key: 'business', label: 'Business' },
  { key: 'customers', label: 'Customers' },
  { key: 'deals', label: 'Deals' },
  { key: 'locations', label: 'Locations' },
  { key: 'pos', label: 'POS' },
];

const BRANCHES = ['Wuse Branch / All Locations', 'Maitama Heights / All Locations', 'Garki Express / All Locations'];

export function AnalyticsHeader({ active, onTab, onOpenFilter, onOpenExport }: AnalyticsHeaderProps) {
  const [branch, setBranch] = useState(0);

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="px-margin pt-space-xs flex flex-col gap-space-2xs">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Select location"
              className="h-9 px-space-sm rounded-full bg-surface-container-low flex items-center gap-space-2xs text-on-surface hover:bg-surface-container transition-colors min-w-0"
              type="button"
              onClick={() => setBranch((current) => (current + 1) % BRANCHES.length)}
            >
              <Icon name="storefront" className="text-primary text-[17px] shrink-0" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold max-w-[128px] truncate">
                {BRANCHES[branch]}
              </span>
              <Icon name="expand_more" className="text-on-surface-variant text-[16px] shrink-0" />
            </button>
            <button
              aria-label="Select date range"
              className="h-9 px-space-sm rounded-full bg-surface-container-low flex items-center gap-space-2xs text-on-surface hover:bg-surface-container transition-colors shrink-0"
              type="button"
              onClick={onOpenFilter}
            >
              <Icon name="calendar_today" className="text-text-secondary text-[15px]" />
              <span className="font-label-sm text-label-sm font-semibold">30 Days</span>
            </button>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Analytics filters"
              className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              type="button"
              onClick={onOpenFilter}
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
            <button
              aria-label="Export analytics report"
              className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              type="button"
              onClick={onOpenExport}
            >
              <Icon name="ios_share" className="text-[18px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[17px]" />
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-space-md overflow-x-auto no-scrollbar" aria-label="Analytics sections">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={`h-9 shrink-0 font-label-md text-label-md whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'text-primary font-semibold border-primary'
                    : 'text-text-secondary border-transparent hover:text-on-surface'
                }`}
                key={tab.key}
                type="button"
                onClick={() => onTab(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function AnalyticsSection({
  title,
  meta,
  action,
  children,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-space-sm">
      <div className="flex items-end justify-between gap-space-sm px-space-2xs">
        <div className="flex flex-col min-w-0">
          <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">{title}</h2>
          {meta && <div className="font-caption text-caption text-text-secondary mt-0.5">{meta}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
