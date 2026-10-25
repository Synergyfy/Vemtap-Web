import { useEffect } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { CreateWithAiButton } from '../components/CreateWithAiButton';
import type { AiPromptContext } from './aiDesignAssistant';
import type { ProductDraft } from './productDraft';
import { useLiveItemEditor } from '../hooks/business/useLiveItemEditor';

interface BusinessAddProductImageScreenProps {
  draft: ProductDraft;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  /** Live: receives the uploaded photo's URL as `mainImage`. */
  onDraftChange?: (patch: Partial<ProductDraft>) => void;
}

const PRODUCT_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb04jGdHJx6xDCQKaYcqPFlB_pwgrGUJAO1XwYICyWuKFQPwHL7jGKdtmszrrEK5OBpvqwE6Kji3tla0GeIcAREU8WxHUJbyO-m-c6_N0WLDzhuenCDfaWpOARU46_kz9Pvek7HsHfvWwLQ8r2HNp0Ua3VpJYPmIMBxkWrLA8rrklo9NNB8gE7pIF52fHy7bY78AmNm9szf0Hgivl87UUVxp9DG9g9bxBCZSBtc1zwxq7iVhpSklKSTw',
    alt: 'Gourmet woodfire seared Angus ribeye steak on a rustic slate board, garnished with rosemary sprig and melted garlic herb butter, soft ambient studio lighting, vibrant warm colors, sharp culinary macro photography',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE-0GAPf0QHM1fTcU_AU5WM4JRfGNunDjoBvWC1NwHIyw7Zbc3JTZfKHgxMNTBbbThCbeQKP8UbGZeNph93IHdpwvR4J_ThXQmyP8e66P65AFXyGx4fd266Gs797nS06_4jfAQEPAnYd6B4NluGR5XO-OA3pWEfhzTn43JsD57JLSoWkHoPw3oj-9YBYFYMYxO1jDz4tgMf4neG3K-Dl_zJUYoJNnZ31n2p93nKcj3c5iQ_mcppyuHrg',
    alt: 'Close up cut of prime grilled Angus ribeye showing medium rare pink tender center, glossy juices, professional food studio lighting',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPbi3ftjrPgLZdFEyanapeTBLeAVdSN5I8ptOLo2-2njr8Xg2hiazj5oOuplksYKjbyWRkXLd23iwEbjwFCpGfEJ92A5eCxaNnLvpErrRnJHtnujZOF8rTA6RD4ThAP846ccbeSen6rYcAnXWWoA4kRZFJj0xQN_F6EjpokrCrsKvTmKnAFYJYxzRhK__1SmDFAQ9VK5x64A6S-1pfYMoCXq3Db_6DspxxCAoD4RUakg6-zfetdmJkw',
    alt: 'Side dish of golden crispy roasted rosemary baby potatoes beside seasoned grilled meat in an artisan brass bowl, commercial food photography',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABfg1FQrGRzuijaGj1JTdU-5KcrLmJdd9-u77PwSzNOue1HQZ5sPkZmde_PXTK0kBf98hF960Q31otL-aqj3gFoz3vV_913yeXPHntCFeWYhTgly2UMSe6DbcmOrUy1DQ4VIY82p5O_ogrbABeSIma6-JaMXO6gVIzlDIRZ0qO185p4ARa7wjDPnV2wzrvC6oCBfynH-xQ67-3ihKQZu85qtiarb2OKhC5hpNkyK9VEqjRH38lIU5gYA',
    alt: 'Chef delicately basting ribeye steak with a melted herb butter rosemary brush over smoking charcoal fire, warm sparks, appetizing culinary scene',
  },
];

/**
 * Product image step — runs *after* the details and pricing steps so the AI
 * assistant can build its prompt from everything already entered (name,
 * brand, description, category). The merchant never re-enters product
 * information here; the draft stays mounted in the container meanwhile.
 */
export function BusinessAddProductImageScreen({ draft, onBack, onNext, onSaveDraft, onDraftChange }: BusinessAddProductImageScreenProps) {
  // Live: the photo tiles upload a real image into the draft's `mainImage`.
  const editor = useLiveItemEditor('product');
  const changePhoto = async () => {
    if (!editor.live || editor.uploading) return;
    const url = await editor.uploadPhoto();
    if (url) onDraftChange?.({ mainImage: url });
  };
  useEffect(() => {
    if (!editor.uploadError) return;
    const timer = window.setTimeout(editor.clearUploadError, 4000);
    return () => window.clearTimeout(timer);
  }, [editor.uploadError]);
  /** Product facts from the draft — business facts come from setup state. */
  const aiProductContext: AiPromptContext = {
    itemName: draft.title,
    itemDescription: draft.description,
    brand: draft.unbranded ? undefined : draft.producer,
    category: draft.primaryCategory,
    subcategory: draft.subCategory,
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
              Step 3 of 5
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
                Step 3 of 5: Product Image
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary font-medium">60% completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex gap-1 p-0.5">
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
          </div>
          <p className="font-caption text-caption text-text-secondary mt-1">
            Upload your own photos or generate one with AI — the prompt is prepared from the details you
            just entered.
          </p>
        </div>

        <div className="flex flex-col gap-space-lg px-margin mt-space-xs">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5">
                  Product Media
                  <span className="font-caption text-caption bg-badge-discount-bg text-badge-discount-text font-semibold px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </h2>
                <span className="font-caption text-caption text-text-secondary">Up to 6 high-res shots</span>
              </div>
              <span className="font-caption text-caption text-primary flex items-center gap-1 font-medium cursor-pointer">
                <Icon name="help_outline" className="text-[16px]" />
                Guidelines
              </span>
            </div>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low group shadow-inner">
              {(!editor.live || draft.mainImage) && (
                <img
                  alt={editor.live ? draft.title || 'Product photo' : PRODUCT_IMAGES[0].alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={editor.live ? draft.mainImage : PRODUCT_IMAGES[0].src}
                />
              )}
              <div className="absolute top-3 left-3 bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Icon className="text-[14px] text-badge-discount-bg" filled name="star" />
                <span className="font-caption text-caption font-semibold">Cover Photo</span>
              </div>
              <div className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-md text-text-primary px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Icon name="drag_indicator" className="text-[14px]" />
                <span className="font-caption text-caption font-medium">Drag to arrange</span>
              </div>
              <button
                className="absolute bottom-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md text-text-primary hover:text-primary px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                type="button"
                onClick={changePhoto}
              >
                <Icon name="add_a_photo" className="text-[16px] text-primary" />
                <span className="font-label-sm text-label-sm font-semibold">{editor.uploading ? 'Uploading…' : 'Change'}</span>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-space-2xs mt-1">
              {!editor.live && (
                <>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-high shadow-sm cursor-pointer ring-2 ring-primary-container">
                <img alt={PRODUCT_IMAGES[1].alt} className="w-full h-full object-cover" src={PRODUCT_IMAGES[1].src} />
                <span className="absolute bottom-0.5 left-0.5 bg-inverse-surface/75 text-inverse-on-surface text-[9px] font-bold px-1 rounded">
                  1
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-high shadow-sm cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                <img alt={PRODUCT_IMAGES[2].alt} className="w-full h-full object-cover" src={PRODUCT_IMAGES[2].src} />
                <span className="absolute bottom-0.5 left-0.5 bg-inverse-surface/75 text-inverse-on-surface text-[9px] font-bold px-1 rounded">
                  2
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-high shadow-sm cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                <img alt={PRODUCT_IMAGES[3].alt} className="w-full h-full object-cover" src={PRODUCT_IMAGES[3].src} />
                <span className="absolute bottom-0.5 left-0.5 bg-inverse-surface/75 text-inverse-on-surface text-[9px] font-bold px-1 rounded">
                  3
                </span>
              </div>
                </>
              )}
              <button
                className="aspect-square rounded-lg bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center text-primary active:scale-95 transition-all"
                type="button"
                onClick={changePhoto}
              >
                <Icon name="add" className="text-[20px]" />
                <span className="text-[10px] font-medium text-text-secondary mt-0.5">Add</span>
              </button>
              <div className="aspect-square rounded-lg bg-surface-container-low/60 flex items-center justify-center text-outline-variant">
                <Icon name="photo_camera" className="text-[18px]" />
              </div>
            </div>
            <div className="flex items-start gap-space-xs p-space-sm bg-surface-tint-blue rounded-xl text-primary">
              <Icon className="text-[20px] text-primary-container shrink-0 mt-0.5" filled name="lightbulb" />
              <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
                <span className="font-semibold text-primary">Pro Tip:</span> Clear, well-lit photos on clean neutral
                backgrounds unlock{' '}
                <strong className="font-semibold text-primary">3x higher customer engagement</strong> and faster
                checkouts.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5">
                <Icon name="auto_awesome" className="text-[18px] text-primary" />
                No image? Create one with AI
              </h2>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                VEMTAP prepares an image prompt from your product name
                {draft.title ? ` (“${draft.title}”)` : ''}, brand
                {draft.unbranded ? '' : draft.producer ? ` (${draft.producer})` : ''}, description and category.
                You can review and edit the prompt before opening ChatGPT or Google Gemini, then upload the
                result right here.
              </p>
            </div>
            <CreateWithAiButton
              aspectRatio="square"
              assetType="product"
              context={aiProductContext}
              fileHint="Up to 6 high-res shots"
            />
          </div>

          <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs">
            <Icon name="history" className="text-[18px] text-primary shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Your product details, pricing and branch availability from the previous steps are saved — go
              Back at any time to edit them, and everything you entered stays exactly as you left it.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-container-lowest/90 backdrop-blur-xl px-margin py-space-sm shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] pb-safe flex flex-col gap-2">
        <button
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:bg-primary active:scale-[0.98] transition-all cursor-pointer"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Branch Availability</span>
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
      {editor.uploadError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {editor.uploadError}
        </div>
      )}
    </AppScreen>
  );
}
