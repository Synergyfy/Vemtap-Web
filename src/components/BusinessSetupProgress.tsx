import { Icon } from './ui/Icon';
import {
  BUSINESS_SETUP_SECTIONS,
  getSectionStates,
  type BusinessSetupProgressSnapshot,
  type BusinessSetupSectionId,
  type BusinessSetupSectionState,
} from '../scripts/businessSetup';

interface BusinessSetupProgressProps extends BusinessSetupProgressSnapshot {
  onSelectSection: (id: BusinessSetupSectionId) => void;
  variant?: 'mobile' | 'desktop';
}

const STATE_LABEL: Record<BusinessSetupSectionState, string> = {
  completed: 'Completed',
  active: 'In progress',
  available: 'Open',
  locked: 'Locked',
};

const ICON_BASE = 'w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors';

const iconTone: Record<BusinessSetupSectionState, string> = {
  active: 'bg-primary text-on-primary',
  completed: 'bg-badge-discount-bg text-badge-discount-text',
  available: 'bg-surface-tint-blue text-primary',
  locked: 'bg-surface-container-high text-text-tertiary',
};

const cardTone: Record<BusinessSetupSectionState, string> = {
  active: 'border-primary bg-surface-tint-blue/60',
  completed: 'border-border-subtle bg-surface-container-lowest',
  available: 'border-border-subtle bg-surface-container-lowest hover:border-primary/40',
  locked: 'border-transparent bg-surface-container-low/50 opacity-70 cursor-not-allowed',
};

/**
 * Interactive progress tracker for the three top-level setup sections. Shows
 * which section is active, which are complete, which can be opened, and which
 * are locked behind an unfinished prerequisite.
 */
export function BusinessSetupProgress({
  onSelectSection,
  variant = 'desktop',
  ...snapshot
}: BusinessSetupProgressProps) {
  const states = getSectionStates(snapshot);
  const compact = variant === 'mobile';

  return (
    <nav aria-label="Business setup progress" className="w-full">
      <ol className={`grid grid-cols-3 ${compact ? 'gap-1.5' : 'gap-space-sm'}`}>
        {BUSINESS_SETUP_SECTIONS.map((section, index) => {
          const state = states[section.id];
          const locked = state === 'locked';
          return (
            <li key={section.id} className="min-w-0">
              <button
                type="button"
                disabled={locked}
                aria-current={state === 'active' ? 'step' : undefined}
                aria-label={`${section.title}: ${STATE_LABEL[state]}`}
                title={section.summary}
                onClick={() => onSelectSection(section.id)}
                className={`w-full h-full flex items-center gap-2 rounded-xl border text-left transition-all ${
                  compact ? 'px-2 py-1.5' : 'px-space-sm py-space-xs'
                } ${locked ? '' : 'active:scale-[0.99]'} ${cardTone[state]}`}
              >
                <span className={`${ICON_BASE} ${iconTone[state]}`}>
                  {state === 'completed' ? (
                    <Icon name="check" className="text-[16px]" filled />
                  ) : locked ? (
                    <Icon name="lock" className="text-[15px]" />
                  ) : (
                    <Icon name={section.icon} className="text-[16px]" />
                  )}
                </span>
                <span className="min-w-0 flex flex-col">
                  <span className="flex items-center gap-1 min-w-0">
                    <span className="font-caption text-caption text-text-tertiary tabular-nums">{index + 1}.</span>
                    <span
                      className={`truncate ${
                        compact ? 'font-label-sm text-label-sm' : 'font-label-md text-label-md'
                      } ${state === 'locked' ? 'text-text-tertiary' : 'text-on-surface'} ${
                        state === 'active' ? 'font-semibold' : ''
                      }`}
                    >
                      {compact ? section.shortTitle : section.title}
                    </span>
                  </span>
                  <span
                    className={`font-caption text-caption truncate ${
                      state === 'active' ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {STATE_LABEL[state]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
