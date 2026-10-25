import { AppScreen } from '../components/ui/AppScreen';
import { useLiveItemEditor } from '../hooks/business/useLiveItemEditor';
import { Icon } from '../components/ui/Icon';
import type { ProductDraft } from './productDraft';

interface BusinessAddProductStep1ScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const CONDITION_OPTIONS: Array<{
  value: ProductDraft['condition'];
  icon: string;
  label: string;
  sub: string;
}> = [
  { value: 'fresh', icon: 'eco', label: 'Fresh / New', sub: 'Made to order' },
  { value: 'packaged', icon: 'inventory_2', label: 'Packaged', sub: 'Sealed box' },
  { value: 'surplus', icon: 'published_with_changes', label: 'Surplus', sub: 'Special batch' },
];

const QUICK_BULLETS = [
  { label: 'Gluten-free', text: 'Gluten-free options available' },
  { label: 'Halal certified', text: 'Halal certified suppliers' },
  { label: 'Eco packaging', text: 'Packaged warm in eco-insulated box' },
];

export function BusinessAddProductStep1Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessAddProductStep1ScreenProps) {
  // Live: the business's own categories; picked from the Sub-Category "Change" control.
  const editor = useLiveItemEditor('product');
  const categoryLevels = [
    { caption: 'Primary Category', value: draft.primaryCategory, icon: 'restaurant', active: true },
    { caption: 'Sub-Category', value: draft.subCategory, icon: 'outdoor_grill', active: false },
    { caption: 'Item Classification', value: draft.classification, icon: 'local_fire_department', active: false },
  ];

  const addBullet = (text: string) => {
    onDraftChange({ description: `${draft.description}\n• ${text}` });
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
              Step 1 of 5
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Add New Product</h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
              onClick={onSaveDraft}
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
                Step 1 of 5: Product Details
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary font-medium">20% completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex gap-1 p-0.5">
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
          </div>
          <p className="font-caption text-caption text-text-secondary mt-1">
            Enter essential item details just like top retail marketplaces (Jumia, Temu). Images come after
            pricing, so AI can use these details.
          </p>
        </div>

        <div className="flex flex-col gap-space-lg px-margin mt-space-xs">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="product-title">
                  Product Title <span className="text-error">*</span>
                </label>
                <span className="font-caption text-caption text-text-tertiary">{draft.title.length} / 80</span>
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-space-md rounded-xl bg-surface-subtle text-text-primary font-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_2px_#066cf4] transition-all"
                  id="product-title"
                  maxLength={80}
                  placeholder="e.g. Woodfire Aged Angus Ribeye..."
                  type="text"
                  value={draft.title}
                  onChange={(event) => onDraftChange({ title: event.target.value })}
                />
                <button
                  aria-label="Clear product title"
                  className="absolute right-3 p-1 text-text-tertiary hover:text-text-primary"
                  type="button"
                  onClick={() => onDraftChange({ title: '' })}
                >
                  <Icon name="cancel" className="text-[18px]" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="brand-name">
                Brand or Kitchen Producer
              </label>
              <div className="relative flex items-center">
                <Icon className="absolute left-3.5 text-text-tertiary text-[20px]" name="storefront" />
                <input
                  className="w-full h-[52px] pl-11 pr-space-md rounded-xl bg-surface-subtle text-text-primary font-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_2px_#066cf4] transition-all"
                  disabled={draft.unbranded}
                  id="brand-name"
                  placeholder="Search or enter brand name"
                  type="text"
                  value={draft.producer}
                  onChange={(event) => onDraftChange({ producer: event.target.value })}
                />
              </div>
              <label className="flex items-center gap-2.5 mt-1 cursor-pointer select-none">
                <input
                  checked={draft.unbranded}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer accent-primary-container"
                  id="unbranded-check"
                  type="checkbox"
                  onChange={(event) =>
                    onDraftChange({
                      unbranded: event.target.checked,
                      producer: event.target.checked ? 'Unbranded / Homemade' : editor.live ? '' : 'Urban Grill Kitchen',
                    })
                  }
                />
                <span className="font-body-md text-body-md text-text-secondary">
                  This item is unbranded, artisanal, or homemade
                </span>
              </label>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Category Placement</h2>
                <span className="font-caption text-caption text-text-secondary">
                  Helps buyers locate your item across channels
                </span>
              </div>
              <Icon name="category" className="text-primary text-[22px]" />
            </div>
            <div className="bg-surface-subtle rounded-xl p-space-sm flex flex-col gap-space-xs">
              {categoryLevels.map((level, index) => (
                <div key={level.caption} className="contents">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          level.active ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-on-secondary-container'
                        }`}
                      >
                        <Icon name={level.icon} className="text-[16px]" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-text-tertiary">{level.caption}</span>
                        <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                          {level.value}
                        </span>
                      </div>
                    </div>
                    {editor.live && level.caption === 'Sub-Category' ? (
                      // Same "Change" control, backed by a native picker of the real categories.
                      <label className="relative font-label-sm text-label-sm text-primary font-semibold px-2 py-1 rounded hover:bg-surface-container-low transition-colors cursor-pointer">
                        Change
                        <select
                          aria-label="Choose a category"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          value={draft.categoryId ?? ''}
                          onChange={(event) => {
                            const found = editor.categories.find((category) => category.id === event.target.value);
                            onDraftChange({ categoryId: event.target.value || undefined, subCategory: found?.name ?? '' });
                          }}
                        >
                          <option value="">{editor.categories.length ? 'No category' : 'No categories yet'}</option>
                          {editor.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <button
                        className="font-label-sm text-label-sm text-primary font-semibold px-2 py-1 rounded hover:bg-surface-container-low transition-colors"
                        type="button"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {index < categoryLevels.length - 1 && (
                    <div className="w-full h-px bg-surface-container-high/60 ml-9" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="product-desc">
                Description &amp; Highlights
              </label>
              <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-0.5">
                <Icon name="auto_awesome" className="text-[14px]" /> AI Polish Ready
              </span>
            </div>
            <div className="relative">
              <textarea
                className="w-full p-space-sm rounded-xl bg-surface-subtle text-text-primary font-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_2px_#066cf4] transition-all resize-none leading-relaxed"
                id="product-desc"
                placeholder="List ingredients, taste notes, or preparation specifics..."
                rows={4}
                value={draft.description}
                onChange={(event) => onDraftChange({ description: event.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_BULLETS.map((bullet) => (
                <button
                  key={bullet.label}
                  className="text-caption font-caption bg-surface-container-low hover:bg-surface-container-high text-text-secondary px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                  type="button"
                  onClick={() => addBullet(bullet.text)}
                >
                  <Icon name="add" className="text-[13px]" /> {bullet.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Item Condition</h2>
              <span className="font-caption text-caption text-text-secondary">
                Accurate conditions build customer credibility
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              {CONDITION_OPTIONS.map((option) => {
                const isSelected = draft.condition === option.value;
                return (
                  <button
                    key={option.value}
                    className={`flex flex-col items-center justify-center p-space-sm rounded-xl text-center gap-1 active:scale-95 transition-all ${
                      isSelected
                        ? 'bg-surface-tint-blue text-primary shadow-sm'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-low'
                    }`}
                    type="button"
                    onClick={() => onDraftChange({ condition: option.value })}
                  >
                    <Icon className="text-[22px]" filled={isSelected} name={option.icon} />
                    <span
                      className={`font-label-sm text-label-sm font-semibold ${
                        isSelected ? '' : 'text-text-primary'
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="font-caption text-[11px] text-text-secondary">{option.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-container-lowest/90 backdrop-blur-xl px-margin py-space-sm shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] pb-safe flex flex-col gap-2">
        <button
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:bg-primary active:scale-[0.98] transition-all cursor-pointer"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Pricing &amp; Inventory</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <div className="flex items-center justify-center">
          <button
            className="h-9 px-4 font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
            onClick={onSaveDraft}
          >
            <Icon name="save" className="text-[16px]" />
            <span>Save as Draft &amp; Exit</span>
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
