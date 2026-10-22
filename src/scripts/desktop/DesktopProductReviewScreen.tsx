import { LiveReviewStep } from '../../components/business/LiveItemSteps';
import { hasApiConfig } from '../../services/api/client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { isVariantProduct, getActiveVariants } from '../productVariants';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';

interface DesktopProductReviewScreenProps {
  draft: ProductDraft;
  onBack: () => void;
  onEditBasics: () => void;
  onEditPricing: () => void;
  onEditBranches: () => void;
  onEditFulfillment: () => void;
  onEditDescription: () => void;
  /** Jumps to the dedicated image step; falls back to basics when unwired. */
  onEditImage?: () => void;
  onEditSteps: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const REVIEW_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvGGHboDjJsH8_7cZUJnacSTsVHYk54qOmYZzX6Hs_k2vF8tuO13DXaWFugEnJBR83HDysqm34S7VVOfusatfGKIyFCs3Loj73zzmgm2rb8rfqnvqS5WuvSZPT9KXN8u4R-fWcTaKZt287X3-D9Y7KSWqHiY6yXvzamdRQE4Bc6m8lYxuIMEKfAH7JfQXZSgiOmEZbXIEOVH_Twues0RGj4LsyvhLtL4OVr04ewCIu',
    alt: 'Gourmet prime woodfire aged ribeye steak sizzling on rustic black iron slate board with fresh rosemary herb sprig, smoked sea salt crystals, and glowing ember highlights in clean commercial studio lighting with warm mahogany wood tones.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY8MZE0giTu5bDYmRtAV7ZWwBT04hNPBZhyyq0Lb0PC8stg3xf7IADH-YOPYO6qBjLeVI1wpM_qmec_GEX3ZYgxxsXLeWgOHCST7LIJTlOG9sjino2gMkcRrm3g8LQ9_9IP4z-FNMFvoE_k0MC81Yk6lVDjrLnd16S8f-Evt627bIhbEOYHT1jmjM-7cnu9tiCKgUl-31qocGjYEurYTNVX-L4gi_WRUCROBmSlbwT',
    alt: 'Appetizing top-down macro shot of freshly sliced woodfire medium rare ribeye steak surrounded by sea salt flakes and roasted garlic cloves ready for consumer ordering.',
  },
];

const EDIT_BUTTON_CLASS =
  'px-space-xs py-1 rounded-lg bg-surface-container-high hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm transition-colors cursor-pointer';

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

function DemoDesktopProductReviewScreen({
  draft,
  onBack,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onEditFulfillment,
  onEditDescription,
  onEditImage,
  onEditSteps,
  onPublish,
  onSaveDraft,
  onNav,
}: DesktopProductReviewScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'success'>('idle');
  const [simIndex, setSimIndex] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;
  const activeVariants = getActiveVariants(draft);
  const variantMode = isVariantProduct(draft);
  const totalStock = activeVariants.reduce((sum, variant) => sum + toNumber(variant.inventory), 0);
  const regularVariantPrice = toNumber(
    activeVariants.find((variant) => variant.name === 'Regular')?.price ??
      activeVariants[0]?.price ??
      draft.basePrice,
  );
  const comparePrice = toNumber(draft.basePrice);
  const savingAmount = comparePrice - regularVariantPrice;
  const simVariant = activeVariants[simIndex] ?? activeVariants[0];

  const handlePublish = () => {
    if (publishState !== 'idle') return;
    setPublishState('publishing');
    timers.current.push(window.setTimeout(() => setPublishState('success'), 1200));
    timers.current.push(window.setTimeout(() => onPublish(), 2800));
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="max-w-7xl mx-auto px-margin py-space-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm mb-space-sm">
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container text-text-secondary flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon name="arrow_back" className="text-[18px]" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm shadow-sm">
                <Icon name="check" className="text-[18px]" />
              </div>
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                    Step 5 of 5
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-medium">
                    100% Complete
                  </span>
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  Final Catalog Review &amp; Dispatch Audit
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-space-xs self-start lg:self-auto bg-surface-subtle px-space-md py-space-xs rounded-full">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-caption text-caption text-text-secondary">Core Info</span>
              </div>
              <span className="text-outline-variant text-[12px]">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-caption text-caption text-text-secondary">Portions</span>
              </div>
              <span className="text-outline-variant text-[12px]">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-caption text-caption text-text-secondary">Outlets</span>
              </div>
              <span className="text-outline-variant text-[12px]">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-2 rounded-full bg-primary" />
                <span className="font-label-sm text-label-sm text-primary font-semibold">Verification</span>
              </div>
            </div>
          </div>
          <div className="bg-badge-discount-bg text-text-primary rounded-xl p-space-md flex items-start sm:items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-start sm:items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-surface-canvas flex items-center justify-center text-badge-discount-text flex-shrink-0 shadow-sm">
                <Icon name="verified" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Ready for customers • All checks verified
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  All regulatory labels, temperature parameters, and dual-branch logistics match VEMTAP Instant
                  Commerce standards.
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 bg-surface-canvas rounded-full text-badge-discount-text font-caption text-caption font-medium">
              <Icon name="bolt" className="text-[14px]" />
              <span>Fast-Track Live Enabled</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="relative w-full h-80 bg-surface-container-high overflow-hidden group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={REVIEW_IMAGES[0].alt}
                  src={REVIEW_IMAGES[0].src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/75 via-text-primary/20 to-transparent" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                  <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-3 py-1 rounded-full shadow-sm font-semibold flex items-center gap-1">
                    <Icon name="local_fire_department" className="text-[14px]" /> Fresh / Made to order
                  </span>
                  <span className="bg-surface-canvas/90 backdrop-blur-md text-text-primary font-label-sm text-label-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Icon name="photo_library" className="text-[14px]" /> 4 Photos
                  </span>
                </div>
                <div className="absolute top-space-md right-space-md">
                  <button
                    type="button"
                    onClick={onEditImage ?? onEditBasics}
                    className="bg-surface-canvas/90 hover:bg-surface-canvas text-text-primary font-label-sm text-label-sm px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Icon name="edit" className="text-[16px] text-text-secondary" />
                    <span>Edit Media</span>
                  </button>
                </div>
                <div className="absolute bottom-space-md left-space-md right-space-md text-surface-canvas">
                  <div className="flex items-center gap-space-xs text-surface-container-high font-caption text-caption mb-1">
                    <span>Catalogue</span>
                    <span>/</span>
                    <span>{draft.primaryCategory}</span>
                    <span>/</span>
                    <span className="text-surface-canvas font-medium">{draft.subCategory}</span>
                  </div>
                  <h2 className="font-heading-lg text-heading-lg text-surface-canvas tracking-tight">
                    {draft.title}
                  </h2>
                  <div className="flex items-center gap-space-sm mt-1">
                    <span className="font-body-md text-body-md text-surface-container font-medium">
                      {draft.producer}
                    </span>
                    <span className="text-surface-variant text-[10px]">•</span>
                    <span className="font-caption text-caption text-surface-container-high flex items-center gap-1">
                      <Icon name="verified_user" className="text-[14px] text-border-active" /> Direct Producer
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 p-space-md bg-surface-subtle gap-space-md text-center">
                <div className="flex flex-col items-center">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                    Internal SKU
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold mt-0.5">
                    {draft.skuCode}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                    Total Combined Stock
                  </span>
                  <span className="font-label-md text-label-md text-primary font-semibold mt-0.5">
                    {variantMode ? `${totalStock} Units` : 'Single item'}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                    Primary Tax Tier
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold mt-0.5">
                    Standard VAT (7.5%)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="sell" className="text-[18px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    Pricing Architecture &amp; Portions
                  </h3>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-caption text-caption text-text-secondary">
                    {variantMode ? `${activeVariants.length} active variants configured` : 'Standard single-size item'}
                  </span>
                  <button type="button" onClick={onEditPricing} className={EDIT_BUTTON_CLASS}>
                    Edit
                  </button>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-md rounded-xl flex flex-wrap items-baseline justify-between gap-space-sm">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">
                    {variantMode ? 'Base Menu Price (Regular Cut)' : 'Standard Price'}
                  </span>
                  <div className="flex items-baseline gap-space-xs mt-1">
                    <span className="font-display-hero text-display-hero text-text-primary font-bold">
                      ₦{regularVariantPrice.toLocaleString('en-US')}
                    </span>
                    {savingAmount > 0 && (
                      <>
                        <span className="font-body-md text-body-md text-text-tertiary line-through">
                          ₦{comparePrice.toLocaleString('en-US')}
                        </span>
                        <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-2 py-0.5 rounded-full font-semibold">
                          Save ₦{savingAmount.toLocaleString('en-US')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-caption text-caption text-text-secondary">Average Margin</span>
                  <span className="block font-heading-sm text-heading-sm text-primary font-bold">42.8%</span>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                  {variantMode ? 'Portion Cut Variations' : 'Sold As'}
                </span>
                {!variantMode ? (
                  <div className="flex items-center gap-2.5 p-space-sm rounded-xl bg-surface-container-low">
                    <Icon name="inventory_2" className="text-[20px] text-text-tertiary" />
                    <span className="font-caption text-caption text-text-secondary">
                      Standard product — customers pick no size or option.
                    </span>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  {activeVariants.map((variant, index) => {
                    const variantPrice = toNumber(variant.price);
                    const delta = variantPrice - regularVariantPrice;
                    return (
                      <div
                        key={variant.id}
                        className="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors flex flex-col justify-between gap-space-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-label-md text-label-md text-text-primary font-semibold">
                              {variant.name}
                            </span>
                            {index === 0 ? (
                              <span className="font-caption text-caption text-primary font-semibold bg-surface-tint-blue px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            ) : (
                              <span className="font-caption text-caption text-text-secondary">
                                {delta > 0 ? `+₦${delta.toLocaleString('en-US')}` : ''}
                              </span>
                            )}
                          </div>
                          <span className="font-caption text-caption text-text-secondary mt-0.5 block">
                            {variant.cut}
                          </span>
                        </div>
                        <div className="mt-space-xs pt-space-xs flex items-baseline justify-between">
                          <span className="font-label-md text-label-md text-text-primary font-bold">
                            ₦{variant.price}
                          </span>
                          <span className="font-caption text-caption text-badge-discount-text font-medium">
                            {variant.inventory} in stock
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="storefront" className="text-[18px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    Branch Availability &amp; Outlets
                  </h3>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" /> {activeBranchCount} Active Hubs
                  </span>
                  <button type="button" onClick={onEditBranches} className={EDIT_BUTTON_CLASS}>
                    Edit
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-space-xs">
                        <Icon name="location_on" className="text-[20px] text-primary" />
                        <div>
                          <span className="font-label-md text-label-md text-text-primary font-semibold block">
                            Wuse Branch
                          </span>
                          <span className="font-caption text-caption text-primary font-medium">
                            Central Flagship Kitchen
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium">
                        Zone 2
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-space-sm">
                      Plot 418 Aminu Kano Crescent, Wuse II, Abuja FCT
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-sm flex items-center justify-between bg-surface-canvas p-space-xs rounded-lg">
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Branch Base</span>
                      <span className="font-label-md text-label-md text-text-primary font-bold">₦12,000</span>
                    </div>
                    <div className="text-right">
                      <span className="font-caption text-caption text-text-secondary block">Assigned Stock</span>
                      <span className="font-label-md text-label-md text-text-primary font-bold">30 units</span>
                    </div>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-space-xs">
                        <Icon name="location_on" className="text-[20px] text-primary" />
                        <div>
                          <span className="font-label-md text-label-md text-text-primary font-semibold block">
                            Garki Branch
                          </span>
                          <span className="font-caption text-caption text-text-secondary font-medium">
                            Express Pick-up Hub
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium">
                        Zone 1
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-space-sm">
                      Area 11, Off Ladoke Akintola Boulevard, Garki, Abuja
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-sm flex items-center justify-between bg-surface-canvas p-space-xs rounded-lg">
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">
                        Adjusted Rate (+₦500)
                      </span>
                      <span className="font-label-md text-label-md text-text-primary font-bold">₦12,500</span>
                    </div>
                    <div className="text-right">
                      <span className="font-caption text-caption text-text-secondary block">Assigned Stock</span>
                      <span className="font-label-md text-label-md text-text-primary font-bold">18 units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="local_shipping" className="text-[18px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    Fulfillment &amp; Dispatch SLA
                  </h3>
                </div>
                <button type="button" onClick={onEditFulfillment} className={EDIT_BUTTON_CLASS}>
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs">
                  <Icon name="store" className="text-[22px] text-badge-discount-text" />
                  <div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold block">
                      In-Store Pickup
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium block">
                      Instant Availability
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-1 block">
                      Dedicated counter at both Wuse &amp; Garki
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs">
                  <Icon name="moped" className="text-[22px] text-primary" />
                  <div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold block">
                      Local Delivery
                    </span>
                    <span className="font-caption text-caption text-primary font-medium block">
                      20 - 30 Minutes
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-1 block">
                      VEMTAP On-Demand Courier dispatched hot
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs">
                  <Icon name="inventory_2" className="text-[22px] text-secondary" />
                  <div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold block">
                      Interstate Waybill
                    </span>
                    <span className="font-caption text-caption text-text-secondary font-medium block">
                      Restricted (Perishable)
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-1 block">
                      Vacuum chilled seals only for express lines
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="menu_book" className="text-[18px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    Culinary Narrative &amp; Dietary Badges
                  </h3>
                </div>
                <button type="button" onClick={onEditDescription} className={EDIT_BUTTON_CLASS}>
                  Edit
                </button>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{draft.description}</p>
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <div className="px-space-sm py-1.5 rounded-full bg-surface-subtle text-text-primary font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm">
                  <Icon name="eco" className="text-[16px] text-badge-discount-text" />
                  <span>100% Gluten-free</span>
                </div>
                <div className="px-space-sm py-1.5 rounded-full bg-surface-subtle text-text-primary font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm">
                  <Icon name="verified" className="text-[16px] text-badge-discount-text" />
                  <span>Halal Certified Kitchen</span>
                </div>
                <div className="px-space-sm py-1.5 rounded-full bg-surface-subtle text-text-primary font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm">
                  <Icon name="recycling" className="text-[16px] text-primary" />
                  <span>Biodegradable Thermal Packaging</span>
                </div>
                <div className="px-space-sm py-1.5 rounded-full bg-surface-subtle text-text-primary font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm">
                  <Icon name="restaurant" className="text-[16px] text-tertiary" />
                  <span>Chef's Choice Recommended</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    Live Consumer App Simulator
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary bg-surface-subtle px-2.5 py-1 rounded-full">
                  iOS &amp; Android View
                </span>
              </div>
              <div className="bg-surface-subtle rounded-2xl p-space-md flex flex-col gap-space-sm shadow-sm">
                <div className="flex items-center justify-between text-text-secondary text-[11px] px-1">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1">
                    <Icon name="signal_cellular_alt" className="text-[13px]" />
                    <Icon name="wifi" className="text-[13px]" />
                    <Icon name="battery_full" className="text-[13px]" />
                  </div>
                </div>
                <div className="bg-surface-canvas rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative w-full h-44 bg-surface-container-high overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt={REVIEW_IMAGES[1].alt}
                      src={REVIEW_IMAGES[1].src}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-2.5 py-1 rounded-full shadow-sm">
                      SAVE ₦{savingAmount.toLocaleString('en-US')}
                    </span>
                    <button
                      type="button"
                      aria-label="Save to favourites"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-canvas/90 flex items-center justify-center text-text-secondary hover:text-error transition-colors shadow-sm"
                    >
                      <Icon name="favorite" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="p-space-sm flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-text-secondary font-caption text-caption">
                      <span className="font-semibold text-text-primary flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-badge-discount-text" /> {draft.producer}
                      </span>
                      <span className="flex items-center gap-0.5 text-text-secondary">
                        <Icon name="near_me" className="text-[13px] text-primary" /> 0.8 km • Wuse II
                      </span>
                    </div>
                    <h4 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
                      {draft.title}
                    </h4>
                    <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                      <div className="flex items-center text-tertiary">
                        <Icon name="star" className="text-[14px]" filled />
                        <span className="font-semibold ml-0.5 text-text-primary">4.9</span>
                      </div>
                      <span>(184 reviews)</span>
                      <span>•</span>
                      <span className="text-badge-discount-text font-medium">Ready in 20m</span>
                    </div>
                    <div className="mt-space-xs pt-space-xs flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading-md text-heading-md text-text-primary font-bold">
                          {`₦${toNumber(variantMode && simVariant ? simVariant.price : draft.basePrice).toLocaleString('en-US')}`}
                        </span>
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          ₦{comparePrice.toLocaleString('en-US')}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Icon name="touch_app" className="text-[15px]" />
                        <span>1-Tap Order</span>
                      </button>
                    </div>
                  </div>
                </div>
                {variantMode && (
                  <div className="flex items-center justify-between gap-space-2xs pt-1">
                    <span className="font-caption text-caption text-text-secondary">Simulate Customer Choice:</span>
                    <div className="flex gap-1">
                      {activeVariants.map((variant, index) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSimIndex(index)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            index === simIndex
                              ? 'bg-surface-tint-blue text-primary'
                              : 'bg-surface-canvas text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {variant.cut.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Deployment Control
                </span>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Publish to Active Network</h3>
              </div>
              <div className="flex flex-col gap-space-xs">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishState !== 'idle'}
                  className={`w-full h-14 rounded-xl font-button-primary text-button-primary font-semibold flex items-center justify-center gap-space-xs shadow-md transition-all ${
                    publishState === 'success'
                      ? 'bg-badge-discount-text text-on-primary cursor-default'
                      : publishState === 'publishing'
                        ? 'bg-primary text-on-primary opacity-80 cursor-not-allowed'
                        : 'bg-primary hover:bg-[#0559CA] active:scale-[0.98] text-on-primary cursor-pointer'
                  }`}
                >
                  {publishState === 'idle' && (
                    <>
                      <Icon name="rocket_launch" className="text-[20px]" />
                      <span>Publish Product to Storefront 🚀</span>
                    </>
                  )}
                  {publishState === 'publishing' && (
                    <>
                      <Icon name="refresh" className="text-[20px] animate-spin" />
                      <span>Synchronizing Catalogs...</span>
                    </>
                  )}
                  {publishState === 'success' && (
                    <>
                      <Icon name="done_all" className="text-[20px]" />
                      <span>Catalog Published!</span>
                    </>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-space-xs mt-1">
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    className="w-full h-11 bg-surface-subtle hover:bg-surface-container text-text-primary rounded-xl font-button-secondary text-button-secondary font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="save" className="text-[17px] text-text-secondary" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={onEditSteps}
                    className="w-full h-11 bg-surface-subtle hover:bg-surface-container text-text-primary rounded-xl font-button-secondary text-button-secondary font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="arrow_back" className="text-[17px] text-text-secondary" />
                    <span>Edit Steps</span>
                  </button>
                </div>
              </div>
              {publishState === 'success' && (
                <div className="bg-badge-discount-bg text-badge-discount-text rounded-lg p-space-sm flex items-center gap-space-xs transition-opacity duration-300">
                  <Icon name="task_alt" className="text-[18px]" />
                  <span className="font-caption text-caption font-semibold">
                    Catalogue live on Wuse &amp; Garki networks! Redirecting...
                  </span>
                </div>
              )}
            </div>

            <div className="bg-surface-tint-blue rounded-xl p-space-lg flex flex-col gap-space-sm shadow-sm relative overflow-hidden">
              <div className="flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-surface-canvas flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
                  <Icon name="local_fire_department" className="text-[24px]" />
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                    Next Growth Step
                  </span>
                  <h4 className="font-heading-sm text-heading-sm text-text-primary">
                    What happens after publishing?
                  </h4>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Once this Ribeye Steak is added to your active catalogue, it immediately unlocks our{' '}
                <strong>Hyper-Local Deal Engine</strong>. You can convert it into a highlighted Flash Deal or
                Featured Banner with 1-tap, placing it front-and-center in front of 40,000+ local diners within 3km
                of your branches.
              </p>
              <div className="pt-space-xs flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold cursor-pointer hover:underline">
                <span>Learn how VEMTAP Boost drives 4x reorders</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-text-secondary font-caption text-caption px-space-xs">
              <span className="flex items-center gap-1">
                <Icon name="shield" className="text-[14px]" /> Merchant Protection Guaranteed
              </span>
              <button type="button" className="hover:text-primary transition-colors flex items-center gap-0.5">
                <span>Dispute &amp; Cancellation Terms</span>
                <Icon name="open_in_new" className="text-[12px]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onEditSteps}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Edit Steps</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishState !== 'idle'}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-80"
            >
              {publishState === 'idle' && (
                <>
                  <span>Publish Product to Storefront</span>
                  <Icon name="rocket_launch" className="text-[20px]" />
                </>
              )}
              {publishState === 'publishing' && (
                <>
                  <Icon name="refresh" className="text-[20px] animate-spin" />
                  <span>Synchronizing Catalogs...</span>
                </>
              )}
              {publishState === 'success' && (
                <>
                  <Icon name="done_all" className="text-[20px]" />
                  <span>Catalog Published!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/** Live: the business's real branches and item; demo keeps the designed screen. */
export function DesktopProductReviewScreen(props: DesktopProductReviewScreenProps) {
  if (!hasApiConfig()) return <DemoDesktopProductReviewScreen {...props} />;
  const Shell = props.onNav ? MerchantShell : BusinessSetupChrome;
  return (
    <Shell activeNav="catalog" onNav={props.onNav}>
      <div className="max-w-4xl mx-auto w-full px-6 py-space-xl">
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
      </div>
    </Shell>
  );
}
