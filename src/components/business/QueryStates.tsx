import { Icon } from '../ui/Icon';
import { planErrorMessage } from '../../services/planErrors';
import { BUSINESS_NAV_EVENT } from '../../utils/appEvents';

export function LoadingRows({ rows = 3, label = 'Loading…' }: { rows?: number; label?: string }) {
  return (
    <div className="flex flex-col gap-space-sm" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-20 rounded-xl bg-surface-container-low animate-pulse" />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, body }: { icon: string; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-space-xs py-space-2xl px-space-md">
      <span className="w-12 h-12 rounded-full bg-surface-container text-text-tertiary flex items-center justify-center">
        <Icon name={icon} className="text-[24px]" />
      </span>
      <p className="font-heading-sm text-heading-sm text-text-primary">{title}</p>
      {body ? <p className="font-body-md text-body-md text-text-secondary max-w-sm">{body}</p> : null}
    </div>
  );
}

export function ErrorState({ title, error, onRetry }: { title: string; error?: unknown; onRetry?: () => void }) {
  const planMessage = planErrorMessage(error);
  if (planMessage) return <PlanRequiredState message={planMessage} />;
  const detail = error instanceof Error && error.message ? error.message : 'Please try again in a moment.';
  return (
    <div role="alert" className="flex flex-col items-center text-center gap-space-xs py-space-2xl px-space-md">
      <span className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
        <Icon name="error" className="text-[24px]" />
      </span>
      <p className="font-heading-sm text-heading-sm text-text-primary">{title}</p>
      <p className="font-body-md text-body-md text-text-secondary max-w-sm">{detail}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-space-xs px-space-md h-9 rounded-lg bg-surface-container text-text-primary font-label-md text-label-md hover:bg-surface-container-high"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export interface ChipOption<T extends string> {
  key: T;
  label: string;
  count?: number;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-space-2xs overflow-x-auto no-scrollbar" role="tablist">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
            className={`shrink-0 h-8 px-space-sm rounded-full font-label-sm text-label-sm transition-colors ${
              active
                ? 'bg-primary-container text-on-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
            }`}
          >
            {option.label}
            {typeof option.count === 'number' ? <span className="ml-1 opacity-80">{option.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/** A plan refusal (403 with a plan slug or guard message): explain it and offer the plans page. */
export function PlanRequiredState({ message }: { message: string }) {
  return (
    <div role="alert" className="flex flex-col items-center text-center gap-space-xs py-space-2xl px-space-md">
      <span className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
        <Icon name="workspace_premium" className="text-[24px]" />
      </span>
      <p className="font-heading-sm text-heading-sm text-text-primary">Upgrade to continue</p>
      <p className="font-body-md text-body-md text-text-secondary max-w-sm">{message}</p>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent(BUSINESS_NAV_EVENT, { detail: 'more-subscription' }))}
        className="mt-space-xs px-space-md h-9 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md"
      >
        View plans
      </button>
    </div>
  );
}
