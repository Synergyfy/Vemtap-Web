import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { ProgressDots } from '../components/ui/ProgressDots';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCc87dIWZXoYhV1EqCq_cUJ0zM-f1vyElen8qoDSeN4dvwyrRpjVPBtNiEpvzLGoleYZOLtjoKqN9Iglxieqzp-2ZqS9C2QIIY1izxjZcu12fTatCfUafORvLXHnY3ns_D96sPMagK8I7jV69zJSy1ieunAutXMlHrVA11j3Dn19OACuYmK224U653XPHtghyA1sY0r_gong1ABVkBuV4j2zrAg1UZiwXL3Exr-9BTZBSFH5Ei6E1fY1Q';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <AppScreen>
      <div className="flex flex-col w-full px-6 justify-between flex-1 pb-6 pt-2">
        <header className="w-full flex items-center justify-between pt-1">
          <Logo variant="full" className="h-6 w-auto" />
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high">
            <Icon name="bolt" filled className="text-[15px] text-primary" />
            <span className="font-caption text-caption font-semibold text-primary">Fast & Local</span>
          </div>
        </header>

        <div className="relative w-full my-auto py-4 flex flex-col items-center justify-center">
          <div className="absolute -top-6 w-64 h-64 rounded-full bg-surface-container blur-3xl opacity-70 pointer-events-none" />

          <div className="relative w-full h-[300px] rounded-[32px] bg-surface-canvas shadow-xl p-3 flex flex-col justify-between overflow-hidden">
            <div className="w-full flex items-center justify-between px-2 pt-1 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                <div className="h-2 w-16 bg-surface-container rounded-full" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-tint-blue">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
                </span>
                <span className="font-caption text-caption text-primary font-medium">Lagos Near You</span>
              </div>
            </div>

            <div className="relative w-full h-[130px] rounded-2xl overflow-hidden shadow-sm">
              <img className="w-full h-full object-cover" alt="Modern boutique storefront in Victoria Island, Lagos" src={HERO_IMAGE} />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-badge-discount-bg flex items-center gap-1 shadow-sm">
                <Icon name="local_offer" filled className="text-[14px] text-badge-discount-text" />
                <span className="font-caption text-caption font-semibold text-badge-discount-text">35% OFF TODAY</span>
              </div>
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-on-secondary">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-secondary leading-tight">
                    Artisan Gourmet & Co.
                  </span>
                  <span className="font-caption text-caption text-on-secondary/80 flex items-center gap-0.5 mt-0.5">
                    <Icon name="location_on" className="text-[13px]" />
                    0.4 km • Lekki Phase 1
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                  <Icon name="arrow_forward" className="text-on-primary text-[18px]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 rounded-xl bg-surface-subtle shadow-sm flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  <Icon name="storefront" filled className="text-primary text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                    Bakery & Cafe
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium">
                    Buy 1 Get 1
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-subtle shadow-sm flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                  <Icon name="shopping_bag" filled className="text-primary-container text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                    1,420+ Deals
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Updated 2m ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -top-1 -right-1 px-3 py-1.5 rounded-full bg-surface-canvas shadow-lg flex items-center gap-1.5 z-10 transform rotate-3">
            <Icon name="verified" filled className="text-[16px] text-badge-discount-text" />
            <span className="font-caption text-caption font-semibold text-text-primary">
              Verified Stores
            </span>
          </div>
          <div className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-full bg-surface-canvas shadow-lg flex items-center gap-1.5 z-10 transform -rotate-3">
            <Icon name="near_me" filled className="text-[16px] text-primary-container" />
            <span className="font-caption text-caption font-semibold text-text-primary">
              Instant Pickup
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col text-center mt-2">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Discover More.<br />Buy Smarter.
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-2 px-3">
            Find great deals, products and businesses around you — all in one place.
          </p>
          <div className="flex items-center justify-center gap-2 my-5">
            <ProgressDots activeIndex={0} label="Onboarding step 1 of 2" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-3.5 mb-1">
          <PrimaryButton onClick={onGetStarted} className="rounded-full shadow-md hover:bg-primary">
            <span>Get Started</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </PrimaryButton>
          <div className="flex items-center justify-center py-1">
            <p className="font-body-md text-body-md text-text-secondary">
              Already have an account?{' '}
              <button type="button" onClick={onSignIn} className="font-heading-sm text-label-md text-primary-container font-semibold ml-1 hover:underline active:opacity-75">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}