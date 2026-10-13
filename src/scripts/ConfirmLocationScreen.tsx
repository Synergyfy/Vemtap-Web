import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface ConfirmLocationScreenProps {
  onBack: () => void;
  onChangeLocation: () => void;
  onContinue: () => void;
  onBusinessSetup: () => void;
}

const MAP_PREVIEW =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3Eip6-YwMGMr2STXR6NjlkIqAII-LD6sDRlFtXw1cLegLNfxlrmjWW3_R4ir5If1ILMCOKRblbw-mPNO5b4ZqiYtRZTW4fx3DfV3OJP1xkSpbZi-3n4nhrNamAFwmWpn6j-iMdtSwNtst62BEsQIhY-iFIHUFeoVlc1WMw6MXAFuRMlfE5nRb9_W9qU-SugFifXcvYXdLR_4slYxxsMxl-XAzfoS4_q9U0gzdusyvc5fnBJBGBHcTMQ';

export function ConfirmLocationScreen({
  onBack,
  onChangeLocation,
  onContinue,
  onBusinessSetup,
}: ConfirmLocationScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader title="Confirm Location" onBack={onBack} />

      <div className="flex flex-col w-full px-margin pb-space-lg flex-1">
        <div className="flex flex-col pt-space-xs mb-space-md">
          <div className="flex items-center gap-space-2xs mb-space-2xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
              Location Confirmed
            </span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
            You're exploring around
          </h2>
        </div>

        <div className="w-full bg-surface-canvas rounded-xl p-space-md shadow-sm mb-space-md">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-space-xs min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="location_on" filled className="text-primary text-[22px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-heading-md text-heading-md text-on-surface truncate">Apo, Abuja</h3>
                <p className="font-body-md text-body-md text-text-secondary line-clamp-1">Federal Capital Territory</p>
                <div className="flex items-center gap-space-2xs mt-space-2xs">
                  <span className="font-caption text-caption text-text-tertiary">5 km discovery radius</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg shrink-0">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption text-badge-discount-text font-medium">Active Area</span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-sm mb-space-md bg-surface-container-low">
          <div
            className="w-full h-full bg-cover bg-center opacity-70"
            data-location="Apo District, Abuja, Nigeria"
            style={{ backgroundImage: `url('${MAP_PREVIEW}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-canvas/20 via-transparent to-surface-canvas/40 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-48 h-48 rounded-full bg-primary-fixed/40 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-primary/15" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="px-space-xs py-0.5 mb-1 rounded-full bg-surface-canvas shadow-md">
                  <span className="font-caption text-caption text-primary font-semibold">Apo Hub</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform -translate-y-1">
                  <Icon name="storefront" className="text-[24px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-3 left-3 pointer-events-none">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm">
              <Icon name="local_offer" className="text-primary text-[14px]" />
              <span className="font-caption text-caption text-on-surface font-medium">48 Deals</span>
            </div>
          </div>
          <div className="absolute top-12 right-3 pointer-events-none">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm">
              <Icon name="coffee" className="text-tertiary-container text-[14px]" />
              <span className="font-caption text-caption text-on-surface font-medium">12 Cafes</span>
            </div>
          </div>
          <div className="absolute bottom-9 left-4 pointer-events-none">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm">
              <Icon name="shopping_bag" className="text-secondary text-[14px]" />
              <span className="font-caption text-caption text-on-surface font-medium">18 Stores</span>
            </div>
          </div>
          <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-surface-canvas/95 backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <Icon name="radar" className="text-primary text-[14px]" />
              <span className="font-caption text-caption text-text-secondary">Deals &amp; Stores within 5km</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-space-lg">
          <button
            className="h-11 px-space-md rounded-full flex items-center gap-space-2xs text-primary hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onChangeLocation}
          >
            <Icon name="edit_location_alt" className="text-[18px]" />
            <span className="font-button-secondary text-button-secondary">Change location</span>
          </button>
        </div>

        <div className="flex flex-col gap-space-sm mt-auto">
          <div className="flex items-center justify-center gap-2 mb-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
            <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
            <span className="w-6 h-1.5 rounded-full bg-primary" />
          </div>
          <button
            className="w-full h-[54px] rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-150"
            type="button"
            onClick={onContinue}
          >
            <span>Continue</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <div className="flex items-center justify-center pt-space-2xs pb-space-xs">
            <p className="font-caption text-caption text-text-secondary">
              Own a business?{' '}
              <button
                className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                type="button"
                onClick={onBusinessSetup}
              >
                Set up on VEMTAP
                <Icon name="chevron_right" className="text-[12px]" />
              </button>
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
