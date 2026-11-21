import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { UserAvatar } from '../components/ui/UserAvatar';
import type { DealStudioDraft } from './dealStudio';
import { formatDealDate, validateDealInformation } from './deals/dealStudioShared';
import { useDealBranches, useDealProductCatalog } from '../hooks/business/useDealStudioLive';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep3ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

/** Step 3: deal information, schedule, quantity, benefit and branches. Media is Step 4. */
export function BusinessDealStudioStep3Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealStudioStep3ScreenProps) {
  const { products } = useDealProductCatalog();
  const selectedItems = products.filter((item) => studio.productIds.includes(item.id));
  const dealBranches = useDealBranches(studio, selectedItems);
  const errors = validateDealInformation(studio);

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <button aria-label="Go back" className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface" type="button" onClick={onBack}>
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider leading-none">VEMTAP Merchant</span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight">Create Deal</h1>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button className="px-space-xs text-primary font-button-secondary text-button-secondary" type="button" onClick={onSaveDraft}>Save</button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-40">
        <div className="px-margin pt-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Step 3 of 5: Deal Information</span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">60% Complete</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden mt-space-2xs">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '60%' }} />
          </div>
        </div>

        <div className="px-margin mt-space-md">
          <h2 className="font-heading-md text-heading-md text-text-primary">Deal information</h2>
          <p className="font-caption text-caption text-text-secondary">This is what customers see before they claim.</p>
        </div>

        <div className="px-margin mt-space-sm rounded-xl bg-surface-tint-blue p-space-sm flex items-start gap-space-xs">
          <Icon name="photo_camera" className="text-[18px] text-primary mt-0.5 shrink-0" />
          <p className="font-caption text-caption text-text-secondary leading-snug">
            Deal media is added next. A main image or video is required in the Deal Gallery before you can
            publish.
          </p>
        </div>

        <div className="px-margin mt-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-space-sm">
          <label className="flex flex-col gap-space-2xs">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Deal title</span>
            <input
              className="bg-surface-subtle rounded-xl px-space-sm py-2.5 font-label-md text-label-md text-text-primary outline-none"
              placeholder="e.g. Weekend Family Bundle"
              value={studio.title}
              onChange={(event) => onStudioChange({ title: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-space-2xs">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Description (optional)</span>
            <textarea
              className="bg-surface-subtle rounded-xl px-space-sm py-2.5 font-label-md text-label-md text-text-primary outline-none min-h-[76px]"
              placeholder="Tell customers what makes this deal worth claiming"
              value={studio.description}
              onChange={(event) => onStudioChange({ description: event.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-space-xs">
            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">Start date</span>
              <input
                className="bg-surface-subtle rounded-xl px-space-sm py-2 font-label-sm text-label-sm text-text-primary outline-none"
                type="date"
                value={studio.startDate}
                onChange={(event) => onStudioChange({ startDate: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">End date</span>
              <input
                className="bg-surface-subtle rounded-xl px-space-sm py-2 font-label-sm text-label-sm text-text-primary outline-none"
                type="date"
                value={studio.endDate}
                onChange={(event) => onStudioChange({ endDate: event.target.value })}
              />
            </label>
          </div>
          <label className="flex items-center justify-between bg-surface-subtle rounded-xl px-space-sm py-space-2xs">
            <span className="font-label-sm text-label-sm text-text-primary font-medium">Deal quantity / availability</span>
            <input
              aria-label="Deal quantity"
              className="w-20 bg-surface-canvas rounded-lg px-space-xs py-1 text-center font-heading-sm text-heading-sm font-bold text-primary outline-none"
              min={1}
              type="number"
              value={studio.vouchers}
              onChange={(event) => onStudioChange({ vouchers: Number(event.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between bg-surface-subtle rounded-xl px-space-sm py-space-2xs">
            <span className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-primary font-medium">Free Delivery</span>
              <span className="font-caption text-caption text-text-tertiary">Optional extra benefit</span>
            </span>
            <input
              checked={studio.freeDelivery}
              className="w-5 h-5 accent-primary"
              type="checkbox"
              onChange={(event) => onStudioChange({ freeDelivery: event.target.checked })}
            />
          </label>
        </div>

        <div className="px-margin mt-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-sm">
          <span className="font-label-md text-label-md text-text-primary font-semibold">Where this deal runs</span>
          <p className="font-caption text-caption text-text-secondary">Only branches that sell every selected product are shown.</p>
          <div className="flex flex-col gap-space-2xs mt-space-xs">
            {dealBranches.options.map((branch) => (
              <label
                key={branch.id}
                className={`flex items-center justify-between rounded-lg px-space-sm py-space-2xs ${
                  branch.sellsItem ? 'bg-surface-subtle cursor-pointer' : 'bg-surface-container-low opacity-50'
                }`}
              >
                <span className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">{branch.name}</span>
                  <span className="font-caption text-caption text-text-tertiary">{branch.sellsItem ? branch.area : 'Product not available here'}</span>
                </span>
                <input
                  checked={branch.sellsItem && dealBranches.selectedIds.includes(branch.id)}
                  disabled={!branch.sellsItem}
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  onChange={() => onStudioChange(dealBranches.toggle(branch.id))}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="px-margin mt-space-sm rounded-xl bg-surface-tint-blue px-space-sm py-space-2xs flex items-start gap-space-xs">
          <Icon name="calendar_today" className="text-[16px] text-primary mt-0.5" />
          <p className="font-caption text-caption text-text-secondary">
            {studio.startDate && studio.endDate
              ? `${formatDealDate(studio.startDate)} → ${formatDealDate(studio.endDate)}`
              : 'Set a start and end date for this deal.'}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center disabled:opacity-40"
          disabled={errors.length > 0}
          type="button"
          onClick={onNext}
        >
          <span>{errors.length > 0 ? errors[0] : 'Continue to Deal Gallery'}</span>
          {errors.length === 0 && <Icon name="arrow_forward" className="text-[18px]" />}
        </button>
        <button className="w-full h-9 rounded-xl text-text-secondary font-button-secondary text-button-secondary" type="button" onClick={onBack}>
          Back to offer setup
        </button>
      </div>
    </AppScreen>
  );
}
