import { Icon } from '../ui/Icon';
import { CAMPAIGN_TIMEZONE, defaultScheduleValue } from '../../scripts/campaigns/campaignsData';

export type SendMode = 'now' | 'schedule';

interface ScheduleControlsProps {
  mode: SendMode;
  /** datetime-local value, only meaningful when mode === 'schedule'. */
  value: string;
  error?: string | null;
  onModeChange: (mode: SendMode) => void;
  onValueChange: (value: string) => void;
}

/** Send-now / schedule picker shared by both channel builders. */
export function ScheduleControls({ mode, value, error, onModeChange, onValueChange }: ScheduleControlsProps) {
  return (
    <div className="flex flex-col gap-space-sm">
      <div role="radiogroup" aria-label="When to send" className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'now'}
          onClick={() => onModeChange('now')}
          className={`flex items-start gap-space-xs rounded-xl border p-space-sm text-left transition-colors ${
            mode === 'now' ? 'border-primary bg-surface-tint-blue' : 'border-border-subtle hover:bg-surface-subtle'
          }`}
        >
          <Icon name="send" className={`text-[20px] shrink-0 ${mode === 'now' ? 'text-primary' : 'text-text-tertiary'}`} />
          <span className="flex flex-col min-w-0">
            <span className={`font-label-md text-label-md ${mode === 'now' ? 'text-primary font-semibold' : 'text-text-primary font-medium'}`}>
              Send now
            </span>
            <span className="font-caption text-caption text-text-secondary">Queued as soon as you confirm</span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'schedule'}
          onClick={() => onModeChange('schedule')}
          className={`flex items-start gap-space-xs rounded-xl border p-space-sm text-left transition-colors ${
            mode === 'schedule' ? 'border-primary bg-surface-tint-blue' : 'border-border-subtle hover:bg-surface-subtle'
          }`}
        >
          <Icon name="schedule" className={`text-[20px] shrink-0 ${mode === 'schedule' ? 'text-primary' : 'text-text-tertiary'}`} />
          <span className="flex flex-col min-w-0">
            <span className={`font-label-md text-label-md ${mode === 'schedule' ? 'text-primary font-semibold' : 'text-text-primary font-medium'}`}>
              Schedule
            </span>
            <span className="font-caption text-caption text-text-secondary">Pick a future date and time</span>
          </span>
        </button>
      </div>

      {mode === 'schedule' && (
        <div className="flex flex-col gap-space-2xs">
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-text-secondary">Send date and time</span>
            <input
              type="datetime-local"
              value={value || defaultScheduleValue()}
              onChange={(event) => onValueChange(event.target.value)}
              aria-invalid={!!error}
              className={`min-h-11 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                error ? 'ring-2 ring-error' : ''
              }`}
            />
          </label>
          <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
            <Icon name="public" className="text-[14px]" />
            Times use your business timezone — {CAMPAIGN_TIMEZONE.long}.
          </span>
          {error && (
            <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error">
              <Icon name="error" className="text-[15px]" />
              {error}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
