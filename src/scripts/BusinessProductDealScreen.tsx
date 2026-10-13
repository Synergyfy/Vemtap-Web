import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ProductDraft } from './productDraft';

interface BusinessProductDealScreenProps {
  draft: ProductDraft;
  onConfirmDeal: () => void;
  onViewCatalog: () => void;
  onBack: () => void;
}

const DEAL_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-SxxHZbMWVj9me5WMcariqjI-zZOPNZQZMZtx8nwuqgOOz_djUrBTbWPfshlzgGeVxmMOMGhYxrRvs66O5CLCN8-cXJu3xdHwZgja9mC1DXhEHSF39hLVKO1P-Gnu8C2gbZU2icwpKmWwggO_C-HOYhOEpp3NQj3Gdg9r_nBcTiKeywAPp-r7n64iVX9tzfZ_DcZoUEiM8w0tZNBi-hSp_np5vNlgyCDwQU1aVf_vJmPlT8gZaryaow',
    alt: 'Succulent prime cut woodfire grilled ribeye steak served on dark slate with fresh rosemary herb garnish, warm ember glow, warm moody cinematic culinary photography with soft ambient lighting.',
  },
];

const DEAL_PILLS = [15, 20, 25];

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function BusinessProductDealScreen({
  draft,
  onConfirmDeal,
  onViewCatalog,
  onBack,
}: BusinessProductDealScreenProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetUp, setSheetUp] = useState(false);
  const [selectedPct, setSelectedPct] = useState(15);
  const [voucherLimit, setVoucherLimit] = useState('25');
  const [publishing, setPublishing] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!modalOpen) {
      setSheetUp(false);
      return undefined;
    }
    const openTimer = window.setTimeout(() => setSheetUp(true), 10);
    return () => window.clearTimeout(openTimer);
  }, [modalOpen]);

  useEffect(
    () => () => {
      if (confirmTimer.current !== null) {
        window.clearTimeout(confirmTimer.current);
      }
    },
    [],
  );

  const regularVariant = draft.variants.find((variant) => variant.name === 'Regular') ?? draft.variants[0];
  const baseAmount = parseAmount(regularVariant?.price ?? draft.basePrice);
  const dealPrice = (pct: number) => `₦${formatAmount(Math.round(baseAmount * (1 - pct / 100)))}`;

  const variantPrices = draft.variants.map((variant) => variant.price);
  const lowPrice = variantPrices[0] ?? draft.basePrice;
  const highPrice = variantPrices[1] ?? lowPrice;
  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;
  const thumbnail = DEAL_IMAGES[0];

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    if (confirmTimer.current !== null) {
      window.clearTimeout(confirmTimer.current);
      confirmTimer.current = null;
    }
    setPublishing(false);
    setModalOpen(false);
  };

  const handleConfirm = () => {
    if (publishing) return;
    setPublishing(true);
    confirmTimer.current = window.setTimeout(() => {
      onConfirmDeal();
    }, 1200);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1 truncate px-space-xs">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
              Step 2 of 4
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Create Deal Offer</h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full px-margin pb-space-2xl space-y-space-lg">
        <div className="flex items-center justify-between pt-space-xs">
          <div className="flex items-center space-x-space-2xs">
            <div className="w-7 h-1.5 rounded-full bg-badge-discount-text" />
            <div className="w-7 h-1.5 rounded-full bg-badge-discount-text" />
            <div className="w-7 h-1.5 rounded-full bg-badge-discount-text" />
            <div className="w-10 h-1.5 rounded-full bg-badge-discount-text" />
          </div>
          <div className="inline-flex items-center space-x-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full shadow-sm">
            <Icon filled name="check_circle" className="text-label-sm" />
            <span className="font-label-sm text-label-sm font-semibold">100% Complete</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center space-x-space-xs">
            <div className="w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text flex-shrink-0">
              <Icon name="verified" className="text-[18px]" />
            </div>
            <div>
              <p className="font-caption text-caption text-badge-discount-text font-bold uppercase tracking-wider">
                Catalog Status
              </p>
              <h2 className="font-heading-sm text-heading-sm text-on-surface leading-tight">
                Product Live in Storefront Catalog!
              </h2>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center space-x-space-sm">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dim">
              <img className="w-full h-full object-cover" src={thumbnail.src} alt={thumbnail.alt} />
              <div className="absolute bottom-1 left-1 bg-on-surface/80 rounded px-1 text-[10px] text-surface-container-lowest font-medium">
                Active
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  {draft.title}
                </h3>
              </div>
              <p className="font-button-primary text-button-primary text-primary mt-0.5">
                ₦{lowPrice} - ₦{highPrice}
              </p>
              <div className="flex items-center space-x-space-xs text-text-secondary mt-1">
                <span className="inline-flex items-center font-caption text-caption">
                  <Icon name="storefront" className="text-[13px] mr-1 text-primary" />
                  {activeBranchCount} branches active
                </span>
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text mr-1" />
                  In Stock
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-space-xs text-left">
          <div className="inline-flex items-center space-x-1.5 text-tertiary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
            <Icon name="local_fire_department" className="text-[16px]" />
            <span>Growth Accelerator</span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
            Make this product a <span className="text-primary">VEMTAP Deal?</span>
          </h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Unlock foot traffic from nearby consumers actively scouting neighborhood offers right now.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="flex items-start space-x-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-text-secondary flex-shrink-0 mt-0.5">
              <Icon name="shopping_bag" className="text-[20px]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Regular Product
                </span>
                <span className="bg-surface-container-high text-text-secondary text-[11px] font-medium px-2 py-0.5 rounded-full">
                  Standard
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-snug">
                Listed in your standard menu catalog at full price. Reaches patrons already browsing your
                specific storefront profile.
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-surface-container" />
          <div className="flex items-start space-x-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <Icon name="radar" className="text-[20px]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="font-label-md text-label-md font-semibold text-primary">
                  VEMTAP Deal Offer
                </span>
                <span className="bg-badge-discount-bg text-badge-discount-text text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  Discovery Radar
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-snug">
                Featured on the <strong className="text-on-surface font-medium">Deals Feed</strong>,
                hyperlocal map pings, and real-time push alerts to drive walk-in customers into your
                branches.
              </p>
            </div>
          </div>
          <div className="bg-surface-tint-blue rounded-lg p-space-sm flex items-start space-x-space-xs">
            <Icon name="tips_and_updates" className="text-primary text-[18px] mt-0.5 flex-shrink-0" />
            <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
              <strong>Merchant Pro Tip:</strong> You do not have to discount everything. Pick signature
              dishes like this Ribeye Steak as magnet offers to pull first-time diners through your doors!
            </p>
          </div>
        </div>

        <div className="space-y-space-sm">
          <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-md shadow-primary/10 overflow-hidden space-y-space-sm transition-all active:scale-[0.99]">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-1 bg-surface-tint-blue text-primary px-2 py-0.5 rounded font-caption text-caption font-semibold">
                <Icon name="auto_awesome" className="text-[14px]" />
                <span>Fastest Setup</span>
              </div>
              <span className="text-badge-discount-text font-caption text-caption font-semibold">
                Ready in 30s
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-heading-sm text-heading-sm text-on-surface flex items-center">
                Turn into a Deal Now
                <span className="ml-1 text-tertiary">🔥</span>
              </h3>
              <p className="font-body-md text-body-md text-text-secondary leading-normal">
                We will automatically import your photos, description, and base pricing straight into the
                Deal Studio. Just choose your discount % and voucher quota!
              </p>
            </div>
            <button
              className="w-full h-[52px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center space-x-space-xs shadow-lg shadow-primary-container/30 active:bg-primary transition-transform active:scale-[0.98]"
              type="button"
              onClick={openModal}
            >
              <span>Convert to Deal Offer (Auto-Imported)</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
            <div>
              <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                Keep as Regular Product Only
              </h3>
              <p className="font-body-md text-body-md text-text-secondary leading-normal mt-0.5">
                Item remains active in your standard in-store and takeout menus without external deal radar
                highlights.
              </p>
            </div>
            <button
              className="w-full h-[48px] bg-surface-container-high text-on-surface font-button-secondary text-button-secondary rounded-xl flex items-center justify-center space-x-space-xs active:bg-surface-dim transition-all"
              type="button"
              onClick={onViewCatalog}
            >
              <Icon name="inventory_2" className="text-[18px] text-text-secondary" />
              <span>View in Catalog • Add Another</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-space-2xs text-text-tertiary text-center px-space-xs">
          <Icon name="info" className="text-[16px]" />
          <p className="font-caption text-caption text-text-secondary">
            Flexible control: you can switch or promote any item anytime directly from your Products tab.
          </p>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex flex-col justify-end items-center transition-opacity"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className={`w-full max-w-[430px] bg-surface-container-lowest rounded-t-[28px] p-margin pb-safe space-y-space-md shadow-2xl transition-transform duration-300 ${
              sheetUp ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                  Instant Deal Auto-Sync
                </span>
                <h3 className="font-heading-md text-heading-md text-on-surface">Quick Setup: Woodfire Ribeye</h3>
              </div>
              <button
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary"
                type="button"
                onClick={closeModal}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-text-secondary block">
                Select Targeted Discount
              </label>
              <div className="grid grid-cols-3 gap-space-xs">
                {DEAL_PILLS.map((pct) => {
                  const isActive = pct === selectedPct;
                  return (
                    <button
                      key={pct}
                      className={`deal-pill py-2.5 rounded-lg font-button-primary text-button-primary flex flex-col items-center transition-colors ${
                        isActive ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-high text-on-surface'
                      }`}
                      type="button"
                      onClick={() => setSelectedPct(pct)}
                    >
                      <span>{pct}% OFF</span>
                      <span className="font-caption text-caption text-text-secondary font-normal">
                        {dealPrice(pct)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="confirmation_number" className="text-primary text-[20px]" />
                <div>
                  <p className="font-label-sm text-label-sm font-semibold text-on-surface">Voucher Limit</p>
                  <p className="font-caption text-caption text-text-secondary">
                    Caps daily foot traffic redemption
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  aria-label="Voucher limit"
                  className="w-12 bg-transparent text-right font-button-secondary text-button-secondary text-primary font-bold focus:outline-none"
                  type="number"
                  min={1}
                  value={voucherLimit}
                  onChange={(event) => setVoucherLimit(event.target.value)}
                />
                <span className="font-button-secondary text-button-secondary text-primary font-bold">
                  Vouchers / Day
                </span>
              </div>
            </div>
            <button
              className="w-full h-[54px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center space-x-space-xs shadow-lg shadow-primary-container/30 active:scale-95 transition-all disabled:opacity-70"
              type="button"
              disabled={publishing}
              onClick={handleConfirm}
            >
              {publishing ? (
                <>
                  <Icon name="progress_activity" className="text-[20px] animate-spin" />
                  <span className="ml-2">Launching on Radar...</span>
                </>
              ) : (
                <>
                  <span>Publish VEMTAP Radar Deal</span>
                  <Icon name="bolt" className="text-[20px]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
