import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessReferralsContent } from '../components/referral/BusinessReferralsContent';

interface BusinessReferralsScreenProps {
  onBack: () => void;
}

/**
 * Mobile Business → Referrals page.
 *
 * Sits immediately after "Business Profile" in the business menu and renders
 * the same `BusinessReferralsContent` body as the desktop page.
 */
export function BusinessReferralsScreen({ onBack }: BusinessReferralsScreenProps) {
  return (
    <AppScreen>
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Referrals</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="group_add" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-32">
        <div className="px-margin pt-space-sm">
          <BusinessReferralsContent />
        </div>
      </div>
    </AppScreen>
  );
}
