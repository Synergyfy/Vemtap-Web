import { AppScreen } from '../components/ui/AppScreen';
import {
  OnboardingWelcomeContent,
  type WelcomeAudience,
} from '../components/referral/OnboardingWelcomeContent';

interface OnboardingWelcomeScreenProps {
  audience: WelcomeAudience;
  business?: {
    profileCompleted: boolean;
    offeringsCompleted: boolean;
    verificationState: 'not-started' | 'in-progress' | 'complete';
  };
  onEnterDashboard: () => void;
}

/** Mobile shell for the post-onboarding welcome screen. */
export function OnboardingWelcomeScreen({ audience, business, onEnterDashboard }: OnboardingWelcomeScreenProps) {
  return (
    <AppScreen>
      <div className="px-margin pt-space-xl pb-space-3xl">
        <OnboardingWelcomeContent audience={audience} business={business} onEnterDashboard={onEnterDashboard} />
      </div>
    </AppScreen>
  );
}
