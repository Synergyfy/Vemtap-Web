import { Icon } from '../ui/Icon';

export type CampaignStepKey = 'audience' | 'message' | 'review';

interface StepDefinition {
  key: CampaignStepKey;
  label: string;
  hint: string;
  icon: string;
}

const STEPS: StepDefinition[] = [
  { key: 'audience', label: 'Audience', hint: 'Choose recipients', icon: 'groups' },
  { key: 'message', label: 'Message', hint: 'Compose content', icon: 'edit' },
  { key: 'review', label: 'Review & Send', hint: 'Confirm and send', icon: 'send' },
];

interface CampaignStepperProps {
  active: CampaignStepKey;
  /** Steps already completed get a check mark instead of their number. */
  completed: CampaignStepKey[];
  onSelect?: (step: CampaignStepKey) => void;
  /** Explains what is blocking a step that cannot be opened yet. */
  blockedReason?: Partial<Record<CampaignStepKey, string>>;
  /** Called when a locked step is tapped, so the tap is never a dead end. */
  onBlocked?: (reason: string) => void;
}

/**
 * Three-step progress indicator shared by the SMS and Email builders.
 * Selecting an already-reached step keeps the user on one screen (no routing).
 */
export function CampaignStepper({ active, completed, onSelect, blockedReason, onBlocked }: CampaignStepperProps) {
  return (
    <nav aria-label="Campaign steps" className="w-full">
      <ol className="flex items-stretch gap-space-2xs sm:gap-space-sm">
        {STEPS.map((step, index) => {
          const isActive = step.key === active;
          const isDone = completed.includes(step.key) && !isActive;
          const blocked = blockedReason?.[step.key];
          const canSelect = !!onSelect && !blocked && (isDone || isActive || index <= completed.length);
          const lockReason = blocked ?? (!canSelect ? 'Finish the earlier steps first.' : undefined);
          return (
            <li key={step.key} className="flex-1 min-w-0">
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                aria-disabled={!canSelect}
                title={lockReason}
                onClick={() => {
                  if (canSelect) onSelect?.(step.key);
                  else if (lockReason) onBlocked?.(lockReason);
                }}
                className={`w-full flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition-colors ${
                  isActive ? 'bg-surface-tint-blue' : canSelect ? 'hover:bg-surface-subtle' : 'hover:bg-error-container/40'
                } ${canSelect ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex items-center gap-space-2xs w-full justify-center">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-label-sm text-label-sm font-bold ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : isDone
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    {isDone ? <Icon name="check" className="text-[14px]" /> : index + 1}
                  </span>
                  <span
                    className={`truncate font-label-md text-label-md ${
                      isActive ? 'text-primary font-semibold' : isDone ? 'text-text-primary font-medium' : 'text-text-tertiary'
                    }`}
                  >
                    {step.label}
                  </span>
                </span>
                <span className="hidden sm:block font-caption text-caption text-text-tertiary truncate">{step.hint}</span>
                <span
                  className={`block w-full h-0.5 rounded-full ${isActive ? 'bg-primary' : isDone ? 'bg-badge-discount-text' : 'bg-surface-container'}`}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
