import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessOfferings } from '../../context/BusinessOfferingsContext';

interface DesktopBusinessOfferingsScreenProps {
  businessName: string;
  initialOfferings?: BusinessOfferings;
  onBack: () => void;
  onNext: (offerings: BusinessOfferings) => void;
  onSaveDraft: () => void;
}

export function DesktopBusinessOfferingsScreen({
  businessName,
  initialOfferings = { hasProducts: true, hasServices: false },
  onBack,
  onNext,
  onSaveDraft,
}: DesktopBusinessOfferingsScreenProps) {
  const [hasProducts, setHasProducts] = useState(initialOfferings.hasProducts ?? true);
  const [hasServices, setHasServices] = useState(initialOfferings.hasServices ?? false);
  const [validationHint, setValidationHint] = useState<string | null>(null);

  const toggleProducts = () => {
    if (hasProducts && !hasServices) {
      setValidationHint('Please keep at least one offering selected. Businesses must offer Products, Services, or Both.');
      window.setTimeout(() => setValidationHint(null), 3000);
      return;
    }
    setHasProducts((prev) => !prev);
    setValidationHint(null);
  };

  const toggleServices = () => {
    if (hasServices && !hasProducts) {
      setValidationHint('Please keep at least one offering selected. Businesses must offer Products, Services, or Both.');
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

  const ctaLabel =
    hasProducts && hasServices
      ? 'Continue with Products & Services'
      : hasServices
      ? 'Continue with Services'
      : 'Continue with Products';

  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-10 flex flex-col gap-8">
      {/* Step Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <span className="font-label-sm text-caption text-primary font-semibold uppercase tracking-wider">
            Step 4 of 8 • Business Offerings
          </span>
          <span className="text-text-tertiary">•</span>
          <span className="font-caption text-caption text-text-secondary">
            {businessName || 'Your Business'}
          </span>
        </div>
        <h1 className="font-heading-xl text-heading-xl text-text-primary font-bold tracking-tight">
          What does your business offer?
        </h1>
        <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl">
          Select the options that apply to your business. You can change these later in your business profile.
        </p>
      </div>

      {/* Validation Banner */}
      {validationHint && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md animate-shake">
          <Icon name="info" className="text-[20px] shrink-0" />
          <span>{validationHint}</span>
        </div>
      )}

      {/* 2-Column Offering Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          className={`group relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
            hasProducts
              ? 'border-primary bg-surface-tint-blue/20 shadow-md ring-2 ring-primary/20'
              : 'border-border-subtle bg-surface-canvas hover:border-primary/40 hover:bg-surface-subtle/40'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  hasProducts
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-text-secondary group-hover:bg-surface-container-high'
                }`}
              >
                <Icon name="inventory_2" className="text-[28px]" />
              </div>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  hasProducts
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border-2 border-border-default bg-surface-canvas'
                }`}
              >
                {hasProducts && <Icon name="check" className="text-[18px]" />}
              </div>
            </div>

            <h2 className="font-heading-md text-heading-md text-text-primary font-bold">
              Products
            </h2>
            <p className="font-body-md text-body-md text-text-secondary mt-2 leading-relaxed">
              Clothing, groceries, electronics, furniture, cosmetics and other goods.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle/80 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary font-caption text-caption font-medium">
              Inventory &amp; Stock
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary font-caption text-caption font-medium">
              Product Deals
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary font-caption text-caption font-medium">
              Barcode / SKU
            </span>
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
          className={`group relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
            hasServices
              ? 'border-primary bg-surface-tint-blue/20 shadow-md ring-2 ring-primary/20'
              : 'border-border-subtle bg-surface-canvas hover:border-primary/40 hover:bg-surface-subtle/40'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  hasServices
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-text-secondary group-hover:bg-surface-container-high'
                }`}
              >
                <Icon name="content_cut" className="text-[28px]" />
              </div>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  hasServices
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border-2 border-border-default bg-surface-canvas'
                }`}
              >
                {hasServices && <Icon name="check" className="text-[18px]" />}
              </div>
            </div>

            <h2 className="font-heading-md text-heading-md text-text-primary font-bold">
              Services
            </h2>
            <p className="font-body-md text-body-md text-text-secondary mt-2 leading-relaxed">
              Barbing, repairs, tailoring, cleaning, consulting, healthcare and other services.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle/80 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary font-caption text-caption font-medium">
              Service Menus
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary font-caption text-caption font-medium">
              Service Deals
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary font-caption text-caption font-medium">
              Duration &amp; Tiers
            </span>
          </div>
        </div>
      </div>

      {/* Guidance Callout */}
      <div className="flex items-start gap-4 bg-surface-canvas rounded-2xl p-5 shadow-sm border border-border-subtle">
        <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="tune" className="text-[22px]" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">
            Simple, Focused Dashboard
          </span>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Your VEMTAP dashboard adapts automatically to display only the sections you actually need. You can enable or disable offerings at any time later in your business profile without affecting existing data.
          </p>
        </div>
      </div>

      {/* Desktop Sticky Bottom Action Bar */}
      <div className="pt-6 flex items-center justify-between border-t border-border-subtle">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors"
          >
            <Icon name="save" className="text-[18px]" />
            <span>Save as Draft</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-surface-tint text-on-primary px-8 py-3 rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>{ctaLabel}</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
}
