import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface PlaceholderScreenProps {
  title: string;
  message?: string;
  onBack: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function PlaceholderScreen({
  title,
  message = 'This screen is coming in the next design batch.',
  onBack,
  actionLabel,
  onAction,
}: PlaceholderScreenProps) {
  return (
    <AppScreen>
      <div className="flex flex-col w-full px-6 flex-1">
        <div className="flex items-center w-full h-12 pt-2">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary active:bg-surface-container-high transition-colors"
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 pb-16">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <p className="font-heading-sm text-heading-sm text-text-primary">{title}</p>
          <p className="font-body-md text-body-md text-text-secondary max-w-[280px]">
            {message}
          </p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 w-full h-12 bg-surface-container-low text-text-secondary hover:text-text-primary rounded-xl font-button-secondary text-button-secondary flex items-center justify-center active:bg-surface-container-high transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </AppScreen>
  );
}