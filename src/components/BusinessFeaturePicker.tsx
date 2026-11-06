import { Icon } from './ui/Icon';
import {
  BUSINESS_FEATURES,
  FEATURE_CATEGORIES,
  isFeatureLocked,
  LOCKED_SYSTEM_FEATURES,
  type FeatureId,
  type FeatureState,
} from '../scripts/businessFeatures';

interface BusinessFeaturePickerProps {
  /** Pending selection — the parent owns it and only saves explicitly. */
  selected: FeatureState;
  onToggle: (id: FeatureId) => void;
  /** Controls are inert while a save is in flight. */
  busy?: boolean;
  /** Features locked ON by the platform that cannot be switched off */
  lockedIds?: readonly FeatureId[];
}

/** Compact PalmPay / OPay mobile style toggle switch */
function ToggleVisual({ checked, locked = false }: { checked: boolean; locked?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
        checked ? (locked ? 'bg-primary/50' : 'bg-primary') : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
          checked ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </span>
  );
}

/**
 * Shared feature list used by the first-run "Set Up Your Business Dashboard"
 * screen and by Business Settings › Manage Features, styled with compact
 * PalmPay/OPay mobile density.
 *
 * System defaults (Messages: Chat, SMS, Email) are faded out with a lock badge
 * to clearly communicate they cannot be disabled.
 */
export function BusinessFeaturePicker({
  selected,
  onToggle,
  busy = false,
  lockedIds = LOCKED_SYSTEM_FEATURES,
}: BusinessFeaturePickerProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {FEATURE_CATEGORIES.map((category) => (
        <section key={category.key} className="flex flex-col gap-1">
          <h2 className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold px-1">
            {category.label}
          </h2>
          <div className="rounded-xl bg-surface-canvas shadow-xs border border-border-subtle/50 divide-y divide-border-subtle/40 overflow-hidden">
            {category.features.map((id) => {
              const feature = BUSINESS_FEATURES[id];
              const isLocked = isFeatureLocked(id, lockedIds);
              const enabled = isLocked ? true : Boolean(selected[id]);

              return (
                <button
                  key={id}
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={feature.name}
                  disabled={busy || isLocked}
                  onClick={() => !isLocked && onToggle(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    isLocked
                      ? 'opacity-50 cursor-not-allowed bg-surface-subtle/50'
                      : busy
                      ? 'cursor-not-allowed opacity-75'
                      : enabled
                      ? 'bg-surface-canvas hover:bg-surface-subtle/60 active:bg-surface-subtle'
                      : 'bg-surface-subtle/40 hover:bg-surface-subtle active:bg-surface-container'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      enabled ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    <Icon name={feature.icon} className="text-[16px]" />
                  </span>
                  <span className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`text-[13px] leading-tight truncate ${
                          enabled ? 'text-text-primary font-semibold' : 'text-text-secondary font-medium'
                        }`}
                      >
                        {feature.name}
                      </span>
                      {isLocked && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-surface-container text-text-tertiary text-[9px] font-semibold tracking-tight">
                          <Icon name="lock" className="text-[10px]" />
                          Always on
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] leading-tight text-text-secondary truncate mt-0.5">
                      {feature.description}
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider shrink-0 w-6 text-right ${
                      enabled ? 'text-primary' : 'text-text-tertiary'
                    }`}
                  >
                    {enabled ? 'On' : 'Off'}
                  </span>
                  <ToggleVisual checked={enabled} locked={isLocked} />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
