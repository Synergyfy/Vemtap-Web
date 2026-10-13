import type { ReactNode } from 'react';
import { Icon } from './ui/Icon';

export type AccountTarget =
  | 'dashboard'
  | 'my-deals'
  | 'messages'
  | 'orders'
  | 'savings'
  | 'saved'
  | 'settings'
  | 'support-legal'
  | 'notifications'
  | 'privacy'
  | 'addresses'
  | 'preferences'
  | 'help'
  | 'support'
  | 'terms'
  | 'edit-profile'
  | 'account-settings'
  | 'business-onboarding';

export interface AccountRow {
  icon: string;
  iconClass: string;
  label: string;
  sub?: string;
  badge?: { text: string; className: string };
  trail?: string;
  target: AccountTarget;
}

export function AccountRowButton({ row, onSelect }: { row: AccountRow; onSelect: (target: AccountTarget) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(row.target)}
      className="flex items-center justify-between w-full min-h-[54px] px-space-md py-space-xs text-left hover:bg-surface-subtle active:bg-surface-container-low transition-colors"
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${row.iconClass}`}>
          <Icon name={row.icon} className="text-[20px]" />
        </div>
        {row.sub ? (
          <div className="min-w-0">
            <span className="font-button-secondary text-button-secondary text-on-surface block truncate">{row.label}</span>
            <span className="font-caption text-caption text-text-tertiary block truncate">{row.sub}</span>
          </div>
        ) : (
          <span className="font-button-secondary text-button-secondary text-on-surface truncate">{row.label}</span>
        )}
      </div>
      <div className="flex items-center gap-space-xs shrink-0">
        {row.badge && (
          <span
            className={`px-space-xs py-0.5 rounded-full font-caption text-caption font-bold ${row.badge.className}`}
          >
            {row.badge.text}
          </span>
        )}
        {row.trail && (
          <span className="font-label-sm text-label-sm text-text-secondary truncate max-w-[90px]">{row.trail}</span>
        )}
        <Icon name="chevron_right" className="text-outline-variant text-[20px]" />
      </div>
    </button>
  );
}

export function RowGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-space-2xs">
      <h4 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider px-space-2xs">
        {title}
      </h4>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">{children}</div>
    </section>
  );
}
