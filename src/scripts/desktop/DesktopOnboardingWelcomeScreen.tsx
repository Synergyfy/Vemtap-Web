import { Icon } from '../../components/ui/Icon';
import {
  OnboardingWelcomeContent,
  type WelcomeAudience,
} from '../../components/referral/OnboardingWelcomeContent';

interface DesktopOnboardingWelcomeScreenProps {
  audience: WelcomeAudience;
  business?: {
    profileCompleted: boolean;
    offeringsCompleted: boolean;
    verificationState: 'not-started' | 'in-progress' | 'complete';
  };
  onEnterDashboard: () => void;
}

/** Desktop shell for the post-onboarding welcome screen. */
export function DesktopOnboardingWelcomeScreen({
  audience,
  business,
  onEnterDashboard,
}: DesktopOnboardingWelcomeScreenProps) {
  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md sm:p-space-xl bg-surface-subtle">
      <main className="w-full flex items-center justify-center">
        <div className="w-full max-w-3xl py-space-xl">
          <header className="flex items-center gap-space-sm pb-space-lg mb-space-lg">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
              <Icon name="celebration" filled className="text-xl" />
            </div>
            <div>
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary block">
                Welcome to VEMTAP
              </span>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">You’re all set</h2>
            </div>
          </header>

          <div className="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-md">
            <OnboardingWelcomeContent audience={audience} business={business} onEnterDashboard={onEnterDashboard} />
          </div>
        </div>
      </main>
    </div>
  );
}
