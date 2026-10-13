import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import { DesktopFooter, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopWelcomeScreenProps {
  onNav: (key: DesktopNavKey) => void;
}

const SHOWCASE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUW5wOa1aqAfyJoAL6ZOA4_V-sav4SCukW6USxTQISnKso0osFdmGM8DtBolpz8cIVIozCg53Xu_Je3_L1I7YC0GbbgNfFMEBVyTQEjdnWGkB3zNMSFfv93ruZfDfXzHkRtnQLhJn_402Yd54mfoUUdkk-QcUoi3gHytuqD1INEOy8hto-_nBwUHN-q-3d0zCu8T-f89-1zoRzot5tdgWb-klzncm6qhfAUacTuHYi';

export function DesktopWelcomeScreen({ onNav }: DesktopWelcomeScreenProps) {
  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col antialiased">
      <main className="w-full flex-1 flex items-center py-space-xl">
        <div className="flex flex-col w-full max-w-7xl mx-auto px-margin space-y-16">
          <header className="w-full flex items-center justify-between py-space-xs">
            <div className="flex items-center gap-space-xs">
              <Logo variant="full" className="h-9 w-auto" />
            </div>

            <div className="hidden md:flex items-center gap-space-md">
              <div className="flex items-center gap-space-2xs bg-surface-subtle px-space-sm py-space-2xs rounded-full">
                <Icon name="verified" filled className="text-label-sm text-badge-discount-text" />
                <span className="font-label-sm text-label-sm text-text-secondary">CAC Certified Platform</span>
              </div>
              <button
                type="button"
                onClick={() => onNav('sign-in')}
                className="font-button-secondary text-button-secondary text-text-primary hover:text-primary transition-colors px-space-sm py-space-xs"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNav('for-business')}
                className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-space-2xs"
              >
                Own a business? <Icon name="arrow_forward" className="text-label-sm" />
              </button>
            </div>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            <div className="lg:col-span-6 flex flex-col items-start space-y-space-lg">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue shadow-sm">
                <Icon name="bolt" filled className="text-primary text-label-md" />
                <span className="font-label-md text-label-md text-primary font-semibold tracking-tight">
                  Fast &amp; Local • Zero Take Rate
                </span>
              </div>

              <div className="flex flex-col space-y-space-xs">
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Discover More. <br />
                  <span className="text-primary-container">Buy Smarter.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
                  Find great deals, products, and verified local businesses around you — all in one unified place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onNav('get-started')}
                  className="group relative px-8 py-4 bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl shadow-lg shadow-primary-container/25 transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-space-xs cursor-pointer"
                >
                  <span>Get Started</span>
                  <Icon name="arrow_forward" className="text-heading-sm group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => onNav('sign-in')}
                  className="inline-flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary transition-colors py-space-sm px-space-xs"
                >
                  Already have an account?{' '}
                  <span className="text-primary font-semibold ml-1.5 underline decoration-primary/30 underline-offset-4">
                    Sign In
                  </span>
                </button>
              </div>

              <div className="w-full pt-space-xs">
                <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-xs py-space-md px-space-lg rounded-2xl bg-surface-subtle">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="local_offer" filled className="text-primary text-heading-sm" />
                    <div className="flex flex-col">
                      <span className="font-heading-sm text-heading-sm text-text-primary leading-tight font-bold">
                        1,420+
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">Active Deals</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="verified_user" filled className="text-badge-discount-text text-heading-sm" />
                    <div className="flex flex-col">
                      <span className="font-heading-sm text-heading-sm text-text-primary leading-tight font-bold">
                        100%
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">CAC Verified</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="location_on" filled className="text-tertiary text-heading-sm" />
                    <div className="flex flex-col">
                      <span className="font-heading-sm text-heading-sm text-text-primary leading-tight font-bold">
                        Lagos &amp; Abuja
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">Prime Zones</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-space-2xs pt-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary">Own a business?</span>
                <button
                  type="button"
                  onClick={() => onNav('for-business')}
                  className="font-label-sm text-label-sm text-primary-container font-semibold hover:underline flex items-center gap-1"
                >
                  Set up your business on VEMTAP
                  <Icon name="trending_flat" className="text-label-sm" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative w-full flex justify-center items-center py-space-md">
              <div className="absolute -inset-2 bg-gradient-to-tr from-surface-tint-blue via-primary/10 to-transparent rounded-3xl blur-2xl -z-10 opacity-70" />

              <div className="w-full max-w-lg bg-surface-canvas rounded-2xl shadow-xl overflow-hidden relative">
                <div className="relative h-64 sm:h-72 w-full overflow-hidden group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt="A sunny contemporary artisan bakery and cafe storefront in Lekki Phase 1"
                    src={SHOWCASE_IMAGE}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-transparent to-text-primary/20" />

                  <div className="absolute top-4 left-4 flex items-center gap-space-2xs">
                    <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm">
                      35% OFF TODAY
                    </span>
                    <span className="px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-sm text-text-primary font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                      Live Deal
                    </span>
                  </div>

                  <button
                    aria-label="Save Deal"
                    type="button"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center justify-center text-text-primary hover:text-primary shadow-sm transition-colors cursor-pointer"
                  >
                    <Icon name="bookmark" className="text-heading-sm" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-on-primary">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="check_circle" filled className="text-label-sm text-badge-discount-bg" />
                        <span className="font-caption text-caption text-surface-subtle font-medium uppercase tracking-wider">
                          Premium Merchant
                        </span>
                      </div>
                      <h2 className="font-heading-md text-heading-md font-bold tracking-tight text-surface-bright">
                        Artisan Gourmet &amp; Co.
                      </h2>
                      <p className="font-caption text-caption text-surface-container-high flex items-center gap-1">
                        <Icon name="location_pin" className="text-caption" />
                        Admiralty Way, Lekki Phase 1
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-caption text-caption line-through text-outline-variant">₦12,500</span>
                      <span className="font-heading-sm text-heading-sm font-bold text-surface-canvas">₦8,125</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md flex flex-col space-y-space-sm bg-surface-canvas">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-2xs">
                      <span className="px-space-xs py-1 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                        <Icon name="storefront" className="text-label-sm" />
                        Instant Pickup
                      </span>
                      <span className="px-space-xs py-1 rounded-lg bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
                        Bakery &amp; Bistro
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-semibold">
                      <Icon name="star" filled className="text-label-md" />
                      <span>4.9</span>
                      <span className="text-text-tertiary font-caption">(348)</span>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                        <Icon name="local_cafe" className="text-heading-sm" />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md font-semibold text-text-primary">
                          Signature Brunch Tasting Menu
                        </p>
                        <p className="font-caption text-caption text-text-secondary">
                          Valid for dining in or curbside collection
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNav('get-started')}
                      className="px-space-sm py-1.5 rounded-lg bg-primary-container text-on-primary font-button-secondary text-label-sm font-semibold shadow hover:bg-primary transition-colors cursor-pointer"
                    >
                      Claim
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex absolute -top-3 -left-4 items-center gap-space-xs bg-surface-canvas py-space-xs px-space-sm rounded-xl shadow-lg animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                  <Icon name="verified" className="text-label-md font-bold" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold text-text-primary leading-tight">
                    Verified Stores
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">Real physical locations</span>
                </div>
              </div>

              <div className="hidden sm:flex absolute -bottom-4 -left-6 items-center gap-space-xs bg-surface-canvas py-space-xs px-space-sm rounded-xl shadow-lg">
                <div className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="near_me" className="text-label-md font-bold" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold text-text-primary leading-tight">Near You</span>
                  <span className="font-caption text-caption text-primary font-medium">0.4 km away</span>
                </div>
              </div>

              <div className="hidden sm:flex absolute bottom-0 -right-6 items-center gap-space-xs bg-inverse-surface text-inverse-on-surface py-space-xs px-space-sm rounded-xl shadow-xl">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <Icon name="touch_app" filled className="text-label-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-semibold leading-tight">Deal Claimed!</span>
                  <span className="font-caption text-caption text-outline-variant">1 tap to redeem</span>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full pt-space-xl">
            <div className="w-full py-space-lg px-space-xl rounded-2xl bg-surface-subtle flex flex-col md:flex-row items-center justify-between gap-space-lg">
              <div className="flex flex-col space-y-1 text-center md:text-left">
                <p className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-bold">
                  Verified Neighborhood Commerce
                </p>
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  Supporting local heroes across Nigeria
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md w-full md:w-auto">
                <div className="flex items-center gap-space-xs py-space-xs px-space-sm rounded-xl bg-surface-canvas shadow-sm">
                  <Icon name="payments" className="text-primary text-heading-sm" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">0% Fee</span>
                    <span className="font-caption text-caption text-text-tertiary">Direct Pay</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs py-space-xs px-space-sm rounded-xl bg-surface-canvas shadow-sm">
                  <Icon name="domain_verification" className="text-badge-discount-text text-heading-sm" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">CAC Check</span>
                    <span className="font-caption text-caption text-text-tertiary">Real Registry</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs py-space-xs px-space-sm rounded-xl bg-surface-canvas shadow-sm">
                  <Icon name="electric_bolt" className="text-primary text-heading-sm" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">Tap &amp; Save</span>
                    <span className="font-caption text-caption text-text-tertiary">Zero Waiting</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs py-space-xs px-space-sm rounded-xl bg-surface-canvas shadow-sm">
                  <Icon name="shield_with_heart" className="text-tertiary-container text-heading-sm" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">Community</span>
                    <span className="font-caption text-caption text-text-tertiary">Locally Owned</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <DesktopFooter onNav={onNav} />
    </div>
  );
}
