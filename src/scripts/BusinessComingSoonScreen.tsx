import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessComingSoonScreenProps {
  title: string;
  message?: string;
  onBack: () => void;
}

export function BusinessComingSoonScreen({ title, message, onBack }: BusinessComingSoonScreenProps) {
  return (
    <AppScreen>
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 px-margin items-center justify-center text-center pb-24">
        <div className="relative w-24 h-24 mb-space-md flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-surface-tint-blue blur-md opacity-70 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-md">
            <Icon name="construction" filled className="text-primary text-[38px]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
            <Icon name="schedule" className="text-badge-discount-text text-[16px]" />
          </div>
        </div>
        <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Coming soon</h2>
        <p className="font-label-sm text-label-sm text-text-secondary mt-1 max-w-[320px] leading-relaxed">
          {message ?? `The ${title} module is being crafted right now. You'll see it here the moment it ships.`}
        </p>
        <button
          className="mt-space-lg h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold shadow-md active:scale-95 transition-transform flex items-center gap-2"
          type="button"
          onClick={onBack}
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Go back</span>
        </button>
      </div>
    </AppScreen>
  );
}
