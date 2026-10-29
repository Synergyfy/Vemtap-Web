import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { ProgressDots } from '../components/ui/ProgressDots';

interface StartVemtapScreenProps {
  onBack: () => void;
  onGetStarted: () => void;
  onSkip: () => void;
  onBusinessSetup: () => void;
}

export function StartVemtapScreen({
  onBack,
  onGetStarted,
  onSkip,
  onBusinessSetup,
}: StartVemtapScreenProps) {
  return (
    <AppScreen fit>
      <div className="flex flex-col w-full px-6 justify-between flex-1 pb-4">
        <div className="flex items-center justify-between w-full pt-2">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary active:bg-surface-container-high transition-colors"
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <ProgressDots activeIndex={1} label="Onboarding step 2 of 2" />
          <button type="button" onClick={onSkip} className="font-button-secondary text-label-md text-text-secondary active:text-text-primary px-2 py-1">
            Skip
          </button>
        </div>

        <div className="relative w-full flex-1 min-h-0 max-h-[240px] flex items-center justify-center my-auto select-none overflow-hidden">
          <div className="relative w-[300px] h-[300px] shrink-0 scale-[0.68] [@media(max-height:700px)]:scale-[0.6] [@media(max-height:620px)]:scale-[0.54] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-surface-container-high/40 animate-ping opacity-20 duration-1000" />
            <div className="absolute w-[280px] h-[280px] rounded-full bg-surface-container-low" />
            <div className="absolute w-[210px] h-[210px] rounded-full bg-surface-container" />
            <div className="absolute w-[140px] h-[140px] rounded-full bg-surface-tint-blue" />

            <div className="absolute top-4 left-3 shadow-md bg-surface-canvas rounded-full px-3 py-1.5 flex items-center gap-1.5 transform -rotate-3 hover:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="font-label-sm text-label-sm text-text-primary">Cafes</span>
              <span className="font-caption text-caption text-badge-discount-bg px-1.5 py-0.5 rounded-full">20% off</span>
            </div>
            <div className="absolute top-6 right-2 shadow-md bg-surface-canvas rounded-full px-3 py-1.5 flex items-center gap-1.5 transform rotate-6 hover:scale-105 transition-transform">
              <Icon name="devices" className="text-primary text-[15px]" />
              <span className="font-label-sm text-label-sm text-text-primary">Electronics</span>
            </div>
            <div className="absolute bottom-16 right-0 shadow-md bg-surface-canvas rounded-full px-3 py-1.5 flex items-center gap-1.5 transform -rotate-2 hover:scale-105 transition-transform">
              <Icon name="checkroom" className="text-tertiary-container text-[15px]" />
              <span className="font-label-sm text-label-sm text-text-primary">Fashion</span>
            </div>
            <div className="absolute bottom-12 left-2 shadow-md bg-surface-canvas rounded-full px-3 py-1.5 flex items-center gap-1.5 transform rotate-3 hover:scale-105 transition-transform">
              <Icon name="local_mall" className="text-badge-discount-text text-[15px]" />
              <span className="font-label-sm text-label-sm text-text-primary">Groceries</span>
            </div>
            <div className="absolute bottom-1 -translate-x-1 shadow-md bg-surface-canvas rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:scale-105 transition-transform">
              <Icon name="spa" className="text-secondary text-[15px]" />
              <span className="font-label-sm text-label-sm text-text-primary">Services</span>
            </div>

            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-primary-container/20 rounded-full blur-md" />
              <div className="w-16 h-16 rounded-full bg-surface-canvas shadow-xl flex items-center justify-center p-1.5">
                <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-inner">
                  <Icon name="near_me" filled className="text-[28px]" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-badge-discount-text opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-badge-discount-text" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-6 [@media(max-height:700px)]:space-y-4 shrink-0">
          <div className="flex flex-col text-center space-y-2.5 px-2">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Let's find what's near you.
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-[320px] mx-auto leading-relaxed">
              Discover deals, products and businesses around your location.
            </p>
          </div>
          <div className="flex flex-col w-full items-center space-y-4 pt-2">
            <PrimaryButton onClick={onGetStarted} className="rounded-2xl shadow-lg shadow-primary-container/25">
              <span>Get Started</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </PrimaryButton>
            <a
              className="group inline-flex items-center justify-center py-2 px-3 text-center transition-colors"
              href="#business-onboarding"
              onClick={(e) => {
                e.preventDefault();
                onBusinessSetup();
              }}
            >
              <span className="font-caption text-label-md text-text-secondary">
                Own a business?{' '}
                <span className="text-primary-container font-label-md group-hover:underline">
                  Set up your business on VEMTAP →
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}