import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface NotFoundScreenProps {
  onHome: () => void;
}

/** Shown for a URL that matches no page (mobile view). */
export function NotFoundScreen({ onHome }: NotFoundScreenProps) {
  return (
    <AppScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-margin gap-space-md">
        <div className="w-16 h-16 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
          <Icon name="search_off" className="text-[32px]" />
        </div>
        <div className="space-y-space-xs">
          <h1 className="font-heading-sm text-heading-sm text-text-primary">Page not found</h1>
          <p className="font-body-md text-body-md text-text-secondary">This link is broken or the page has moved.</p>
        </div>
        <button
          type="button"
          onClick={onHome}
          className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary active:scale-95 transition-transform"
        >
          Back to VEMTAP
        </button>
      </div>
    </AppScreen>
  );
}
