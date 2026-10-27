import { useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';
import { CreateWithAiButton } from '../../components/CreateWithAiButton';
import type { AiPromptContext } from '../aiDesignAssistant';
import { useLiveItemEditor } from '../../hooks/business/useLiveItemEditor';

interface DesktopAddProductImageScreenProps {
  draft: ProductDraft;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
  /** Live: receives the uploaded photo's URL as `mainImage`. */
  onDraftChange?: (patch: Partial<ProductDraft>) => void;
}

const COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAft4Mavt9KFCkHQHgagib2tS-yvSlCJo3lB5qDAkOzmHd8uIca5VPHQyq9LyPdjn1TrfC0wdl5AQg6zjqv6MDxcWrcoZ8Jqf0mrZAWKGBppsGvVUQgo6roVaf3ke7mBtqzyYM6KgCAfK3AvB1G6enbKM2ia0DCQLqcdLQPzz5-JwJBFX9oljOfsd2dd1O8MGqf5oVX0hRGUoyKxWmnuUX7_qRTiyuqEww8X9F5iMnHy6S0QGyybIt5Fg';

const COVER_ALT =
  'Gourmet woodfire grilled lamb chops resting on a slate rustic platter, garnished with fresh rosemary, microgreens, roasted garlic cloves, and charred heirloom cherry tomatoes with rich smoke wisps in ambient studio restaurant lighting.';

const GALLERY_THUMBNAILS: Array<{ src: string; alt: string; order: number }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHNKGkpYHcM8HQMTBfFjGeSJ03Ij4HcWdG_RNoTdp2TUY3HnDkAK7Z5b6sOrhQ7e39vIDi3qvt08ps4xIv4QvSKsD05pkhrEpsvNLf2itpmFf6EXBagTBvh4T4zkC6AW0q-ihIQKvwndPXaMCmughtX_k9c652dk2lWsMo9Ym_cY026Siuy0uq_RKYb9p2JKqeLAF_11j-fGInfBbhOpg5XqJEyGplbzqo9W-cxbjmoQT0zaWMezGdHQ',
    alt: 'Close up macro shot of savory flame charred lamb cutlet bone with glistening chimichurri drizzle and coarse sea salt crystals.',
    order: 2,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgmfDhh8JJqiXWXhoEZ706h95y32kEzyLUX-KnXJVXtUWZI6zOpI2Vch02TLIVxsEJXC_tKdVSniUAMfmv4djf43F-9LSMoDXBgXDCpUQI_T7nhsqSYCrGCM6fBHZmcvsv4YV-rG883WCFhosoB0sAIszUfKri2T7v0_tn_rZNLe_qg1yQgTjVpUTRO_b-Qq_JSwoUDr9GPkSBGxT-OpkdeISKWJ0NXCh3TRZ0mwIJrUJftUVTh6QyoA',
    alt: 'Overhead flatlay photography of sizzling lamb platter accompanied by crisp warm pita bread, garlic aioli dip bowl, and charred lemon wedges.',
    order: 3,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoJjKnCZwF8qkqNUr3rY9Rx9Dz2a-8MXgw8C87LHcfWcmVqgMKrI_TqObPcBzRpA4TVZ5kPlw80BOQ2vKH9SVR2kdQfDWlCrrvcoISqUd_W9JPfZZyv3d_UviYC561mlLYdkJnxkNFi275F7H4G7vmdn75QbDPWFnbwwvucnwKobUPIzuO4oUoIGiiEx0qsjP62NABywI6JuTlbW63dxMz55OgtzXFHY78MsBc4CEnwF-ORB0EDtVryQ',
    alt: 'A chef plating sizzling grilled lamb chops in an open urban restaurant kitchen setting with charcoal embers glowing.',
    order: 4,
  },
];

/**
 * Step 3 — Product image. Runs after details and pricing so the AI
 * assistant can build its prompt from everything already entered (name,
 * brand, description, category). The draft stays mounted in the container,
 * so nothing typed in the earlier steps is lost while the merchant works
 * on the image or jumps Back to edit details.
 */
export function DesktopAddProductImageScreen({
  draft,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
  onDraftChange,
}: DesktopAddProductImageScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
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

  const wizardSteps = [
    { number: 1, label: 'Product Details', done: true },
    { number: 2, label: 'Pricing & Variants', done: true },
    { number: 3, label: 'Product Image', active: true },
    { number: 4, label: 'Branch Availability' },
    { number: 5, label: 'Review' },
  ];

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <nav className="flex items-center gap-space-xs text-caption font-caption text-text-secondary mb-space-md">
          <button type="button" onClick={onSaveDraft} className="hover:text-primary transition-colors">
            Merchant Portal
          </button>
          <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
          <button type="button" onClick={onBack} className="hover:text-primary transition-colors">
            Products
          </button>
          <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
          <span className="text-text-primary font-semibold">Add New Product</span>
        </nav>

        <section className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Step 3 of 5: Product Image
              </h1>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                Draft #PRD-8821
              </span>
            </div>
            <div className="flex items-center gap-space-md pt-space-2xs flex-wrap">
              {wizardSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-space-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm shadow-sm ${
                      step.active
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : step.done
                          ? 'bg-primary-container/80 text-on-primary-container'
                          : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`font-label-md text-label-md ${
                      step.active ? 'font-semibold text-text-primary' : 'text-text-secondary opacity-70'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < wizardSteps.length - 1 && (
                    <div
                      className={`w-6 h-1 rounded-full ${step.done ? 'bg-primary-container' : 'bg-surface-container-high'}`}
                    />
                  )}
                </div>
              ))}
              <span className="font-caption text-caption text-badge-discount-text font-semibold ml-space-xs bg-badge-discount-bg px-space-xs py-0.5 rounded">
                60% Completed
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl mt-space-lg">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <Icon name="photo_camera_back" className="text-primary text-[22px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Product Media Studio</h2>
                    <span className="text-caption font-caption text-error font-medium">* Required</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1">
                    High-definition food photography increases tap-through rates on customer maps by 3.2x.
                  </p>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-semibold bg-surface-tint-blue px-space-xs py-space-2xs rounded-lg">
                  4 of 8 Photos Added
                </span>
              </div>

              <div className="relative w-full h-80 rounded-xl overflow-hidden bg-surface-container-high group shadow-sm mb-space-md">
                {(!editor.live || draft.mainImage) && (
                  <img
                    alt={editor.live ? draft.title || 'Product photo' : COVER_ALT}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={editor.live ? draft.mainImage : COVER_IMAGE}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                  <span className="bg-primary text-on-primary font-label-sm text-label-sm font-semibold px-space-sm py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Icon name="star" className="text-[15px]" filled />
                    Cover Photo
                  </span>
                  <span className="bg-surface-canvas/90 backdrop-blur text-text-primary font-caption text-caption font-semibold px-space-xs py-1 rounded-full shadow-sm">
                    Aspect 16:9
                  </span>
                </div>
                <div className="absolute top-space-md right-space-md">
                  <button
                    type="button"
                    className="bg-surface-canvas/90 hover:bg-surface-canvas text-text-primary px-space-sm py-1.5 rounded-lg shadow-md font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Icon name="edit" className="text-[16px]" />
                    <span>Crop &amp; Frame</span>
                  </button>
                </div>
                <div className="absolute bottom-space-md left-space-md right-space-md flex items-center justify-between text-on-primary">
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-on-primary">
                      {editor.live ? (draft.mainImage ? draft.title || 'Product photo' : 'No photo yet') : 'woodfire_lamb_chops_master.jpg'}
                    </p>
                    <p className="font-caption text-caption text-on-primary/80">
                      {editor.live ? 'JPG or PNG, landscape works best' : '3840 × 2160 • 2.4 MB • High Resolution SRGB'}
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={changePhoto}
                      className="px-space-md py-space-xs rounded-xl bg-surface-canvas text-text-primary font-label-md text-label-md font-semibold shadow hover:bg-surface-tint-blue transition-colors flex items-center gap-1"
                    >
                      <Icon name="cached" className="text-[18px] text-primary" />
                      <span>{editor.uploading ? 'Uploading…' : editor.live && !draft.mainImage ? 'Add Photo' : 'Change Photo'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs mb-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                    Gallery Angle Previews (Drag to re-order)
                  </span>
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                    <Icon name="touch_app" className="text-[14px]" /> Touch &amp; Drag
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-space-sm">
                  {(editor.live ? [] : GALLERY_THUMBNAILS).map((thumb) => (
                    <div
                      key={thumb.order}
                      className="relative aspect-square rounded-xl overflow-hidden bg-surface-container group cursor-grab shadow-sm"
                    >
                      <img alt={thumb.alt} className="w-full h-full object-cover" src={thumb.src} />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Icon name="drag_indicator" className="text-surface-canvas text-[20px]" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-surface-canvas/90 text-text-primary text-[10px] font-bold px-1 rounded">
                        {thumb.order}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={changePhoto}
                    className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-tint-blue text-primary flex flex-col items-center justify-center gap-1 transition-all group"
                  >
                    <Icon name="add_photo_alternate" className="text-[24px] group-hover:scale-110 transition-transform" />
                    <span className="font-caption text-caption font-semibold">+ Add Photo</span>
                  </button>
                  <button
                    type="button"
                    className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <Icon name="videocam" className="text-[22px]" />
                    <span className="font-caption text-caption">Add Video</span>
                  </button>
                </div>
              </div>

              <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
                <Icon name="tips_and_updates" className="text-primary text-[22px] shrink-0" />
                <div className="flex-1">
                  <p className="font-label-sm text-label-sm font-semibold text-primary">Pro Tip for Food Merchants</p>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5 leading-relaxed">
                    Clear, well-lit photos on clean neutral backgrounds unlock 3x higher customer engagement and faster
                    checkouts during peak dining discovery hours.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="auto_awesome" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">No image? Create one with AI</h2>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                VEMTAP prepares an image prompt from your product name
                {draft.title ? ` (“${draft.title}”)` : ''}
                {draft.unbranded ? '' : draft.producer ? `, brand (${draft.producer})` : ''}, description and category
                {draft.primaryCategory ? ` (${draft.primaryCategory})` : ''}. Review and edit the prompt before opening
                ChatGPT or Google Gemini, generate the image there, then upload it right here.
              </p>
              <CreateWithAiButton aspectRatio="16/9" assetType="product" context={aiProductContext} fileHint="Aspect 16:9" />
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <Icon name="history" className="text-primary text-[20px] shrink-0" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Everything you entered in Step 1 (details) and Step 2 (pricing) is saved. Use the Back button any time
                  to edit it — your image selection stays right here when you return.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Pricing</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft &amp; Exit</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow-md transition-all"
          >
            <span>Continue to Branch Availability</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>
      {editor.uploadError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {editor.uploadError}
        </div>
      )}
    </Shell>
  );
}
