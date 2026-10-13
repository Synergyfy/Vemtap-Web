import { Icon } from './ui/Icon';

export function PosOwnerHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs min-w-0">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all shrink-0"
          >
            <Icon name="arrow_back" className="text-[23px]" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h1>
            <div className="flex items-center gap-space-2xs">
              <Icon name="verified_user" className="text-primary text-[13px]" />
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Owner Access
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-2xs shrink-0">
          <div className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-caption text-caption text-primary font-medium">POS Mode</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function PosToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`w-12 h-7 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        checked ? 'bg-primary-container' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`w-6 h-6 bg-on-primary rounded-full shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
