import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { BusinessOfferings } from '../context/BusinessOfferingsContext';

interface BusinessOfferingsScreenProps {
  businessName: string;
  initialOfferings?: BusinessOfferings;
  onBack: () => void;
  onNext: (offerings: BusinessOfferings) => void;
  onSaveDraft: () => void;
}

export function BusinessOfferingsScreen({
  businessName,
  initialOfferings = { hasProducts: true, hasServices: false },
  onBack,
  onNext,
  onSaveDraft,
}: BusinessOfferingsScreenProps) {
  const [hasProducts, setHasProducts] = useState(initialOfferings.hasProducts ?? true);
  const [hasServices, setHasServices] = useState(initialOfferings.hasServices ?? false);
  const [validationHint, setValidationHint] = useState<string | null>(null);

  const toggleProducts = () => {
    if (hasProducts && !hasServices) {
      setValidationHint('Please keep at least one offering selected (Products, Services, or Both).');
      window.setTimeout(() => setValidationHint(null), 3000);
      return;
    }
    setHasProducts((prev) => !prev);
    setValidationHint(null);
  };

  const toggleServices = () => {
    if (hasServices && !hasProducts) {
      setValidationHint('Please keep at least one offering selected (Products, Services, or Both).');
      window.setTimeout(() => setValidationHint(null), 3000);
      return;
    }
    setHasServices((prev) => !prev);
    setValidationHint(null);
  };

  const handleContinue = () => {
    if (!hasProducts && !hasServices) {
      setValidationHint('Please select Products, Services, or Both to continue.');
      return;
    }
    onNext({ hasProducts, hasServices });
  };

  // Dynamic button label based on selection
  const ctaLabel =
    hasProducts && hasServices
      ? 'Continue with Products & Services'
      : hasServices
      ? 'Continue with Services'
      : 'Continue with Products';

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center gap-space-2xs mb-1">
              <span className="w-6 h-1.5 rounded-full bg-primary-container transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container transition-all" />
            </div>
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">Business Offerings</h1>
          </div>
          <div className="w-11 h-11 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-12">
        <div className="flex flex-col px-margin pt-space-xs gap-space-lg">
          {/* Step Pill & Title */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-label-sm text-label-sm text-secondary font-medium">Step 3 of 4</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">
                {businessName || 'Your Business'}
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
              What does your business offer?
            </h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Select the options that apply to your business. You can change these later in your business profile.
            </p>
          </div>

          {/* Validation Alert */}
          {validationHint && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-error-container text-on-error-container text-caption font-caption animate-shake">
              <Icon name="info" className="text-[18px] shrink-0" />
              <span>{validationHint}</span>
            </div>
          )}

          {/* Offerings Selector Cards */}
          <div className="flex flex-col gap-space-sm">
            {/* Products Card */}
            <div
              role="checkbox"
              aria-checked={hasProducts}
              tabIndex={0}
              onClick={toggleProducts}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleProducts();
                }
              }}
              className={`group relative flex items-start gap-space-md p-space-md rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
                hasProducts
                  ? 'border-primary bg-surface-tint-blue/30 shadow-sm'
                  : 'border-border-subtle bg-surface-container-lowest hover:border-border-default'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  hasProducts
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-text-secondary group-hover:bg-surface-container-high'
                }`}
              >
                <Icon name="inventory_2" className="text-[24px]" />
              </div>

              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                    Products
                  </h2>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      hasProducts
                        ? 'bg-primary text-on-primary'
                        : 'border-2 border-border-default bg-surface-container-lowest'
                    }`}
                  >
                    {hasProducts && <Icon name="check" className="text-[16px]" />}
                  </div>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-1 leading-relaxed">
                  Clothing, groceries, electronics, furniture, cosmetics and other goods.
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                    Inventory &amp; Stock
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                    Product Deals
                  </span>
                </div>
              </div>
            </div>

            {/* Services Card */}
            <div
              role="checkbox"
              aria-checked={hasServices}
              tabIndex={0}
              onClick={toggleServices}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleServices();
                }
              }}
              className={`group relative flex items-start gap-space-md p-space-md rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
                hasServices
                  ? 'border-primary bg-surface-tint-blue/30 shadow-sm'
                  : 'border-border-subtle bg-surface-container-lowest hover:border-border-default'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  hasServices
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-text-secondary group-hover:bg-surface-container-high'
                }`}
              >
                <Icon name="content_cut" className="text-[24px]" />
              </div>

              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                    Services
                  </h2>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      hasServices
                        ? 'bg-primary text-on-primary'
                        : 'border-2 border-border-default bg-surface-container-lowest'
                    }`}
                  >
                    {hasServices && <Icon name="check" className="text-[16px]" />}
                  </div>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-1 leading-relaxed">
                  Barbing, repairs, tailoring, cleaning, consulting, healthcare and other services.
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                    Bookings &amp; Rates
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                    Service Deals
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Focused Tools Note */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle flex items-start gap-3">
            <Icon name="tune" className="text-primary text-[20px] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-caption">
              <span className="font-semibold text-text-primary">Tailored Experience</span>
              <span className="text-text-secondary leading-relaxed">
                VEMTAP only shows the tools you actually need on your dashboard. You can enable or disable offerings at any time from your Business Profile.
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <button
              className="w-full h-12 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              type="button"
              onClick={handleContinue}
            >
              <span>{ctaLabel}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <button
              className="h-11 px-6 rounded-xl text-text-secondary hover:text-on-surface active:bg-surface-container-high transition-colors font-button-secondary text-button-secondary inline-flex items-center gap-1.5"
              type="button"
              onClick={onSaveDraft}
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft</span>
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
