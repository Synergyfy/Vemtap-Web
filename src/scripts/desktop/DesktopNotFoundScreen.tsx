import { Icon } from '../../components/ui/Icon';

interface DesktopNotFoundScreenProps {
  onHome: () => void;
}

/** Shown for a URL that matches no page (desktop view). */
export function DesktopNotFoundScreen({ onHome }: DesktopNotFoundScreenProps) {
  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col items-center justify-center text-center gap-space-md px-space-lg antialiased">
      <div className="w-20 h-20 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
        <Icon name="search_off" className="text-[40px]" />
      </div>
      <div className="space-y-space-xs">
        <h1 className="font-heading-sm text-heading-sm text-text-primary">Page not found</h1>
        <p className="font-body-md text-body-md text-text-secondary">This link is broken or the page has moved.</p>
      </div>
      <button
        type="button"
        onClick={onHome}
        className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary hover:bg-primary-container transition-colors"
      >
        Back to VEMTAP
      </button>
    </div>
  );
}
