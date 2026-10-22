import { LiveReviewStep } from '../components/business/LiveItemSteps';
import { hasApiConfig } from '../services/api/client';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { isVariantProduct, getActiveVariants } from './productVariants';
import type { ProductDraft } from './productDraft';

interface BusinessProductReviewScreenProps {
  draft: ProductDraft;
  onBack: () => void;
  onEditBasics: () => void;
  onEditPricing: () => void;
  onEditBranches: () => void;
  onEditFulfillment: () => void;
  onEditDescription: () => void;
  /** Jumps to the dedicated image step; falls back to basics when unwired. */
  onEditImage?: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
}

const REVIEW_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbN3Wufie5py-b7XSc155BJ7NhglniGllFCsjuoFd-ekP7T4ahsYuXzvvfTy18Ui3EFkm3gd4scXah3GCjC-QsagD2HhCX33Fr-Ks0gYGu9ISK8bn0sLE9EM5beG0Ct5RFb_8HKUEbLDah4I2VqG_rC3KuWX-ksY53jVYOssDUtHzSlvLM_3KBOUt3h29fQBPJMoFRQL4jRYG4bakvie_npkultByxuHWpclTDtch-npKxedcCe0Dqjg',
    alt: 'A gourmet woodfire seared aged ribeye steak served on a dark rustic slate platter with melting herb garlic butter, crisp rosemary roasted potatoes, natural warm ambient restaurant lighting, high-contrast, premium culinary presentation with deep caramelization crust and fresh parsley garnish.',
  },
];

interface ReviewBranch {
  key: string;
  name: string;
  badge?: string;
  price: string;
  stock: string;
  note: string;
  noteClass: string;
}

const REVIEW_BRANCHES: ReviewBranch[] = [
  {
    key: 'wuse',
    name: 'Wuse Branch',
    badge: 'Flagship',
    price: '₦12,000',
    stock: 'In Stock (30 units)',
    note: 'Standard Base Rate',
    noteClass: 'text-text-tertiary',
  },
  {
    key: 'garki',
    name: 'Garki Branch',
    price: '₦12,500',
    stock: 'In Stock (18 units)',
    note: 'Customized Price (+₦500)',
    noteClass: 'text-tertiary font-medium',
  },
];

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function DemoBusinessProductReviewScreen({
  draft,
  onBack,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onEditFulfillment,
  onEditDescription,
  onEditImage,
  onPublish,
  onSaveDraft,
}: BusinessProductReviewScreenProps) {
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published'>('idle');
  const publishTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (publishTimer.current !== null) {
        window.clearTimeout(publishTimer.current);
      }
    },
    [],
  );

  const handlePublish = () => {
    if (publishStatus !== 'idle') return;
    setPublishStatus('publishing');
    publishTimer.current = window.setTimeout(() => {
      setPublishStatus('published');
      publishTimer.current = window.setTimeout(() => {
        onPublish();
      }, 900);
    }, 1200);
  };

  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;
  const visibleBranches = REVIEW_BRANCHES.filter((branch) => draft.branches[branch.key]);
  const basePrice = parseAmount(draft.basePrice);
  const comparePrice = parseAmount(draft.comparePrice);
  const savings = comparePrice - basePrice;
  const activeVariants = getActiveVariants(draft);
  const variantMode = isVariantProduct(draft);
  const totalStock = activeVariants.reduce((sum, variant) => sum + parseAmount(variant.inventory), 0);
  const heroImage = REVIEW_IMAGES[0];

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">
                Review Product Summary
              </h1>
              <span className="font-caption text-caption text-text-secondary truncate">
                Merchant Portal · Product Setup
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <div className="inline-flex items-center px-space-sm py-1 rounded-full bg-surface-tint-blue">
              <span className="font-label-sm text-label-sm text-primary font-semibold">Step 5 of 5</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-56">
        <div className="sticky top-16 z-20 bg-surface/95 backdrop-blur-md px-margin py-space-xs flex flex-col gap-space-2xs shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <Icon filled name="task_alt" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                Step 5 of 5: Final Review
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold">100% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-full transition-all duration-500" />
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-lg pt-space-md pb-space-3xl">
          <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm shadow-sm">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="verified" className="text-primary text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="font-heading-sm text-heading-sm text-text-primary">Ready for customers</p>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                All regulatory labels and branch logistics match VEMTAP Instant Commerce standards.
              </p>
            </div>
          </div>

          <section className="bg-surface-canvas rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="relative w-full h-56 bg-surface-container-high">
              <img className="w-full h-full object-cover" src={heroImage.src} alt={heroImage.alt} />
              <div className="absolute top-3 left-3 flex flex-wrap gap-space-2xs items-center">
                <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Icon name="local_fire_department" className="text-[14px]" />
                  Fresh / Made to order
                </span>
                <span className="bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Icon name="photo_camera" className="text-[14px]" />
                  4 Photos
                </span>
              </div>
              <button
                aria-label="Quick edit media"
                className="absolute bottom-3 right-3 bg-surface-canvas/90 backdrop-blur-md text-text-primary px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                type="button"
                onClick={onEditImage ?? onEditBasics}
              >
                <Icon name="edit" className="text-[16px] text-primary" />
                Edit Media
              </button>
            </div>
            <div className="p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full">
                  <Icon name="storefront" className="text-primary text-[15px]" />
                  <span className="font-caption text-caption text-text-secondary font-medium">
                    {draft.producer}
                  </span>
                </div>
                <button
                  className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-0.5 active:opacity-70"
                  type="button"
                  onClick={onEditBasics}
                >
                  Edit Basics
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading-md text-heading-md text-text-primary leading-tight">
                  {draft.title}
                </h2>
                <p className="font-caption text-caption text-text-tertiary mt-1">
                  {draft.primaryCategory} &gt; {draft.subCategory}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface-canvas rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="payments" className="text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Pricing &amp; Variants</h3>
                  <span className="font-caption text-caption text-text-secondary">
                    {variantMode ? `${activeVariants.length} sizes configured` : 'Standard single-size item'}
                  </span>
                </div>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm font-semibold px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditPricing}
              >
                Edit
              </button>
            </div>
            <div className="bg-surface-subtle p-space-sm rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-secondary">Display Base Price</span>
                <div className="flex items-baseline gap-space-xs mt-0.5">
                  <span className="font-heading-lg text-heading-lg font-bold text-text-primary">
                    ₦{draft.basePrice}
                  </span>
                  <span className="font-body-md text-body-md text-text-tertiary line-through">
                    ₦{draft.comparePrice}
                  </span>
                </div>
              </div>
              {savings > 0 && (
                <div className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full">
                  Save ₦{formatAmount(savings)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                {variantMode ? 'Active Portions' : 'Sold As'}
              </span>
              {variantMode ? (
                activeVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        {variant.name} ({variant.cut})
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        {variant.inventory} units in stock
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-label-md text-label-md font-bold text-text-primary">
                        ₦{variant.price}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2.5 p-space-sm bg-surface-container-low rounded-lg">
                  <Icon name="inventory_2" className="text-[20px] text-text-tertiary" />
                  <span className="font-caption text-caption text-text-secondary">
                    Standard product — customers pick no size or option.
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-space-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Icon name="inventory_2" className="text-[16px] text-primary" />
                <span className="font-caption text-caption font-medium">
                  {variantMode ? (
                    <>
                      Total Stock: <strong className="text-text-primary">{totalStock} units</strong>
                    </>
                  ) : (
                    'Stock tracked per standard unit'
                  )}
                </span>
              </div>
              <span className="font-caption text-caption bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-mono">
                SKU: {draft.skuCode}
              </span>
            </div>
          </section>

          <section className="bg-surface-canvas rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="hub" className="text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Availability</h3>
                  <span className="font-caption text-caption text-text-secondary">
                    {activeBranchCount} Outlets serving this item
                  </span>
                </div>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm font-semibold px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditBranches}
              >
                Edit
              </button>
            </div>
            <div
              className="w-full h-28 bg-surface-container-high bg-cover bg-center rounded-lg shadow-sm relative overflow-hidden flex items-end p-space-xs"
              data-location="Abuja, Nigeria"
            >
              <div className="bg-surface-canvas/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Icon name="pin_drop" className="text-primary text-[14px]" />
                <span className="font-caption text-caption font-semibold text-text-primary">
                  Abuja Central Metros
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              {visibleBranches.map((branch) => (
                <div
                  key={branch.key}
                  className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        {branch.name}
                      </span>
                      {branch.badge && (
                        <span className="bg-primary/10 text-primary font-caption text-caption px-2 py-0.5 rounded-full font-semibold">
                          {branch.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-label-md text-label-md font-bold text-text-primary">
                      {branch.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="font-caption text-caption flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                      {branch.stock}
                    </span>
                    <span className={`font-caption text-caption ${branch.noteClass}`}>{branch.note}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-surface-tint-blue/70 p-2.5 rounded-lg flex items-center gap-2">
              <Icon name="tune" className="text-primary text-[18px]" />
              <span className="font-caption text-caption text-on-surface-variant">
                <strong>Dynamic Mode:</strong> Prices are independently adjusted by branch operational
                costs.
              </span>
            </div>
          </section>

          <section className="bg-surface-canvas rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="local_shipping" className="text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    Fulfillment &amp; Dispatch
                  </h3>
                  <span className="font-caption text-caption text-text-secondary">
                    Delivery rules for this item
                  </span>
                </div>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm font-semibold px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditFulfillment}
              >
                Edit
              </button>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between p-space-sm bg-surface-subtle rounded-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="check" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      In-Store Pickup / Dine-In Walk
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Ready in 15 mins upon confirmation
                    </span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-badge-discount-text">
                  Instant
                </span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-subtle rounded-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="check" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Local Delivery / Express Dispatch
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Hot insulated bike courier
                    </span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-primary">20 - 30 mins</span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low/70 rounded-lg opacity-80">
                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-full bg-error-container text-error flex items-center justify-center">
                    <Icon name="block" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-medium text-text-secondary">
                      Interstate Cargo Waybill
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">
                      Fresh cooked items cannot travel interstate
                    </span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm font-semibold text-error">Perishable</span>
              </div>
            </div>
          </section>

          <section className="bg-surface-canvas rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="menu_book" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Description &amp; Story
                </h3>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm font-semibold px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditDescription}
              >
                Edit
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed bg-surface-subtle p-space-sm rounded-xl">
              “{draft.description}”
            </p>
            <div className="flex flex-wrap gap-space-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">
                <Icon name="eco" className="text-primary text-[15px]" />
                Gluten-free
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">
                <Icon filled name="stars" className="text-badge-discount-text text-[15px]" />
                Halal certified
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">
                <Icon name="recycling" className="text-tertiary text-[15px]" />
                Eco packaging
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-br from-primary-fixed/30 to-surface-tint-blue rounded-xl p-space-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <Icon name="visibility" className="text-[22px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-text-primary">
                  Consumer View Preview
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Simulate live tap-to-order screen
                </span>
              </div>
            </div>
            <button
              className="bg-surface-canvas text-primary font-label-sm text-label-sm font-bold px-3.5 py-2 rounded-lg shadow-sm active:scale-95 transition-all"
              type="button"
            >
              Inspect
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-md px-margin py-space-sm shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
        <div className="flex flex-col gap-space-sm">
          <button
            className={`w-full h-[52px] rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              publishStatus === 'published'
                ? 'bg-badge-discount-text text-on-primary'
                : 'bg-primary hover:bg-on-primary-fixed-variant text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)]'
            }`}
            type="button"
            disabled={publishStatus !== 'idle'}
            onClick={handlePublish}
          >
            {publishStatus === 'idle' && (
              <>
                <span>Publish Product to Storefront</span>
                <span className="text-base">🚀</span>
              </>
            )}
            {publishStatus === 'publishing' && (
              <>
                <Icon name="sync" className="text-[20px] animate-spin" />
                <span>Broadcasting to VEMTAP...</span>
              </>
            )}
            {publishStatus === 'published' && (
              <>
                <Icon name="check_circle" className="text-[20px]" />
                <span>Published Live! 🎉</span>
              </>
            )}
          </button>
          <button
            className="w-full h-[48px] bg-surface-container text-text-primary hover:bg-surface-container-high active:scale-[0.98] rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 transition-all"
            type="button"
            onClick={onSaveDraft}
          >
            <Icon name="bookmark_border" className="text-[18px]" />
            <span>Save as Draft</span>
          </button>
          <p className="font-caption text-caption text-text-tertiary text-center px-space-md pt-1">
            You can edit details or convert this item into a promotional deal anytime from your merchant
            dashboard.
          </p>
        </div>
      </div>
    </AppScreen>
  );
}

/** Live: the business's real branches and item; demo keeps the designed screen. */
export function BusinessProductReviewScreen(props: BusinessProductReviewScreenProps) {
  if (!hasApiConfig()) return <DemoBusinessProductReviewScreen {...props} />;
  return (
    <BusinessSubScreen title="Review & publish" onBack={props.onBack}>
      <LiveReviewStep
        item={{
    kind: 'product',
    title: props.draft.title,
    image: props.draft.mainImage,
    category: props.draft.subCategory,
    description: props.draft.description,
    price: props.draft.basePrice,
    was: props.draft.comparePrice,
    details: props.draft.lowStock ? [['Low-stock alert', `${props.draft.lowStock} units`]] : [],
  }}
        branchIds={Object.keys(props.draft.branches ?? {}).filter((id) => props.draft.branches[id])}
        onBack={props.onBack}
        onEditBasics={props.onEditBasics}
        onEditPricing={props.onEditPricing}
        onEditBranches={props.onEditBranches}
        onPublish={props.onPublish}
        onSaveDraft={props.onSaveDraft}
      />
    </BusinessSubScreen>
  );
}
