import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import { formatDealDate, validateDealInformation } from '../deals/dealStudioShared';
import { useDealBranches, useDealProductCatalog } from '../../hooks/business/useDealStudioLive';

interface DesktopDealStudioStep3ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const STEPS = ['Deal & Products', 'Offer Setup', 'Deal Information', 'Deal Gallery', 'Review & Publish'];

export function DesktopDealStudioStep3Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopDealStudioStep3ScreenProps) {
  const { products } = useDealProductCatalog();
  const selectedItems = products.filter((item) => studio.productIds.includes(item.id));
  const dealBranches = useDealBranches(studio, selectedItems);
  const errors = validateDealInformation(studio);

  const inner = (
    <>
      <div className="w-full bg-surface-container-lowest px-space-xl py-space-lg shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs text-secondary font-caption text-caption">
              <span>Catalog Workflow</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Deal Studio</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-primary font-semibold">Step 3 of 5: Deal Information</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm mt-space-2xs">
              {STEPS.map((label, index) => (
                <div key={label} className="flex items-center gap-space-xs">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-caption text-caption font-bold ${
                    index < 2 ? 'bg-badge-discount-bg text-badge-discount-text' : index === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {index < 2 ? <Icon name="check" className="text-[15px]" /> : index + 1}
                  </span>
                  <span className={`font-label-sm text-label-sm ${index === 2 ? 'text-primary font-semibold' : 'text-on-surface'}`}>{label}</span>
                  {index < STEPS.length - 1 && <span className="w-8 h-0.5 bg-surface-container-highest" />}
                </div>
              ))}
            </div>
          </div>
          <span className="font-label-md text-label-md text-primary font-bold">60% Completed</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pt-space-xl pb-space-3xl">
        <div className="flex flex-col gap-space-2xs mb-space-lg">
          <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">Deal information</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Add the customer-facing content, validity window, availability and optional extra benefit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
            <div className="rounded-xl bg-surface-tint-blue p-space-sm flex items-start gap-space-xs">
              <Icon name="photo_camera" className="text-[20px] text-primary mt-0.5 shrink-0" />
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Deal media is added in the next step. A main image or video is required in the Deal Gallery
                before you can publish.
              </p>
            </div>

            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Deal title</span>
              <input
                value={studio.title}
                onChange={(event) => onStudioChange({ title: event.target.value })}
                placeholder="e.g. Weekend Family Bundle"
                className="rounded-xl bg-surface-subtle px-space-md py-space-sm font-body-md text-body-md text-on-surface outline-none"
              />
            </label>
            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Description (optional)</span>
              <textarea
                value={studio.description}
                onChange={(event) => onStudioChange({ description: event.target.value })}
                placeholder="Tell customers what makes this deal worth claiming"
                className="rounded-xl bg-surface-subtle px-space-md py-space-sm font-body-md text-body-md text-on-surface outline-none min-h-[96px]"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <label className="flex flex-col gap-space-2xs">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Start date</span>
                <input type="date" value={studio.startDate} onChange={(event) => onStudioChange({ startDate: event.target.value })} className="rounded-xl bg-surface-subtle px-space-md py-space-sm font-body-md text-body-md text-on-surface outline-none" />
              </label>
              <label className="flex flex-col gap-space-2xs">
                <span className="font-label-md text-label-md text-on-surface font-semibold">End date</span>
                <input type="date" value={studio.endDate} onChange={(event) => onStudioChange({ endDate: event.target.value })} className="rounded-xl bg-surface-subtle px-space-md py-space-sm font-body-md text-body-md text-on-surface outline-none" />
              </label>
            </div>
            <label className="flex items-center justify-between rounded-xl bg-surface-subtle px-space-md py-space-sm">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Deal quantity / availability</span>
              <input
                aria-label="Deal quantity"
                type="number"
                min={1}
                value={studio.vouchers}
                onChange={(event) => onStudioChange({ vouchers: Number(event.target.value) })}
                className="w-24 rounded-lg bg-surface-canvas px-space-sm py-space-2xs text-center font-heading-sm text-heading-sm font-bold text-primary outline-none"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl bg-surface-subtle px-space-md py-space-sm">
              <span className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Free Delivery</span>
                <span className="font-caption text-caption text-on-surface-variant">Optional extra benefit</span>
              </span>
              <input
                type="checkbox"
                checked={studio.freeDelivery}
                onChange={(event) => onStudioChange({ freeDelivery: event.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <Icon name="calendar_today" className="text-[20px] text-primary" />
                <span className="font-label-md text-label-md text-on-surface font-bold">Validity</span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                {studio.startDate && studio.endDate
                  ? `${formatDealDate(studio.startDate)} → ${formatDealDate(studio.endDate)}`
                  : 'Set a start and end date.'}
              </p>
            </div>
            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <Icon name="storefront" className="text-[20px] text-primary" />
                <span className="font-label-md text-label-md text-on-surface font-bold">Branches</span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                {dealBranches.options.map((branch) => (
                  <label key={branch.id} className={`flex items-center justify-between rounded-lg px-space-sm py-space-2xs ${branch.sellsItem ? 'bg-surface-subtle cursor-pointer' : 'bg-surface-container-low opacity-50'}`}>
                    <span className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">{branch.name}</span>
                      <span className="font-caption text-caption text-on-surface-variant">{branch.sellsItem ? branch.area : 'Product not available here'}</span>
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      disabled={!branch.sellsItem}
                      checked={branch.sellsItem && dealBranches.selectedIds.includes(branch.id)}
                      onChange={() => onStudioChange(dealBranches.toggle(branch.id))}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <button type="button" onClick={onBack} className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs">
              <Icon name="arrow_back" className="text-[18px]" /> Back to Offer Setup
            </button>
            <button type="button" onClick={onSaveDraft} className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs">
              <Icon name="save" className="text-[18px]" /> Save as Draft
            </button>
          </div>
          <button
            type="button"
            disabled={errors.length > 0}
            onClick={onNext}
            className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs disabled:opacity-40"
          >
            <span>{errors.length > 0 ? errors[0] : 'Continue to Deal Gallery'}</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      </div>
    </>
  );

  if (onNav) return <MerchantShell activeNav="business-deals" onNav={onNav}>{inner}</MerchantShell>;
  return <BusinessSetupChrome activeNav="deals">{inner}</BusinessSetupChrome>;
}
