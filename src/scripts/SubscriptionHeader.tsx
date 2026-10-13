import { Icon } from '../components/ui/Icon';

interface SubscriptionHeaderProps {
  title: string;
  onBack: () => void;
}

export function SubscriptionHeader({ title, onBack }: SubscriptionHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-14 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-xs min-w-0">
          <button
            aria-label="Go back"
            className="w-11 h-11 -ml-space-xs rounded-full flex items-center justify-center text-text-primary hover:bg-surface-subtle active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[22px]" />
          </button>
          <h1 className="font-heading-sm text-heading-sm text-text-primary truncate max-w-[200px]">{title}</h1>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            aria-label="Help & Information"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle active:scale-95 transition-all"
            type="button"
          >
            <Icon name="help_outline" className="text-[22px]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </div>
    </header>
  );
}
