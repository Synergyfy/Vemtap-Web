import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';
import { getCentralCategories, addCentralCategory, type CentralCategory } from '../catalogueData';
import { CategoryImageField } from '../../components/CategoryImageField';
import { CreateWithAiButton } from '../../components/CreateWithAiButton';
import type { AiPromptContext } from '../aiDesignAssistant';

interface DesktopAddProductStep1ScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
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

const PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMsdhr5eSit0fTdi28nHbQgC9t055vUYQWAqiJfi_0Z_IQrRaIES5CzLBe6FGBeHuh8dgcXMY6A1s73WBWwO_Ah5-xMmv0hQj6BmxXdftwxgVhs7wH92XhAumirAzalP24jKt5tCD-XHAGEyMEsXqIyMFXqV0zjwLSW_BLE6pELhp716pqB6XaFkCMF7GZqaFHm-AsdrSipPxRgIHhYTrdLFrPk_KwuJLV7jRuI7B8VLuBcv5-GSEi6w';

const PREVIEW_ALT = 'Plated woodfire grilled lamb chops with herbs on customer discovery screen preview.';

const DIETARY_CHIPS: Array<{ label: string; icon: string; active: boolean; tone: 'default' | 'tertiary' }> = [
  { label: 'Gluten-free', icon: 'eco', active: false, tone: 'default' },
  { label: 'Halal certified', icon: 'verified', active: true, tone: 'default' },
  { label: 'Eco packaging', icon: 'recycling', active: false, tone: 'default' },
  { label: 'Medium Spicy', icon: 'local_fire_department', active: true, tone: 'tertiary' },
];

const CONDITION_OPTIONS: Array<{
  value: ProductDraft['condition'];
  label: string;
  hint: string;
  badge?: { text: string; className: string };
}> = [
  {
    value: 'fresh',
    label: 'Fresh / Made to Order',
    hint: 'Prepared immediately upon customer order. Direct dining or express warm delivery.',
    badge: { text: 'Active', className: 'bg-surface-canvas text-primary font-semibold' },
  },
  {
    value: 'packaged',
    label: 'Packaged / Sealed Shelf Item',
    hint: 'Pre-packaged sauces, spices, or retail merchandise with barcode / UPC tag.',
  },
  {
    value: 'surplus',
    label: 'Surplus / Flash Batch',
    hint: 'Limited daily kitchen allotment or end-of-day flash meal at promotional rates.',
    badge: { text: 'Special', className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant font-semibold' },
  },
];

export function DesktopAddProductStep1Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopAddProductStep1ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [activeChips, setActiveChips] = useState<string[]>(
    DIETARY_CHIPS.filter((chip) => chip.active).map((chip) => chip.label),
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const timers = useRef<number[]>([]);

  // Category management & inline category creation
  const [categories, setCategories] = useState<CentralCategory[]>(() => getCentralCategories('product'));
  const [showInlineCategoryModal, setShowInlineCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('restaurant');
  /** Optional category image (data URL) — categories never require an image. */
  const [newCatImage, setNewCatImage] = useState('');

  /** Product facts from the draft — business facts come from setup state. */
  const aiProductContext: AiPromptContext = {
    itemName: draft.title,
    itemDescription: draft.description,
    category: draft.primaryCategory,
    subcategory: draft.subCategory,
  };

  const handleCreateCategoryInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const created = addCentralCategory({
      id: slug,
      name: newCatName.trim(),
      slug,
      type: 'product',
      description: newCatDescription.trim() || `${newCatName.trim()} selections`,
      icon: newCatIcon,
      image: newCatImage || undefined,
      productCount: 1,
      activeBranches: ['all'],
      qrDestinationUrl: `/business/urban-grill-bistro-104/products?category=${slug}`,
    });
    setCategories(getCentralCategories('product'));
    onDraftChange({
      categoryId: created.id,
      subCategory: created.name,
      primaryCategory: 'Food & Dining',
    });
    setNewCatName('');
    setNewCatDescription('');
    setNewCatImage('');
    setShowInlineCategoryModal(false);
    showToast(`Category "${created.name}" created and selected!`);
  };

  const handleNext = () => {
    if (!draft.categoryId && !draft.subCategory) {
      showToast('Please select or create a category before continuing.');
      return;
    }
    onNext();
  };

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  };

  const handleSaveDraft = () => {
    showToast('Product draft saved successfully.');
    timers.current.push(window.setTimeout(() => onSaveDraft(), 600));
  };

  const toggleChip = (label: string) => {
    setActiveChips((prev) => (prev.includes(label) ? prev.filter((chip) => chip !== label) : [...prev, label]));
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="w-full max-w-7xl mx-auto px-margin pb-space-3xl flex flex-col gap-space-xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Icon name="storefront" className="text-[16px]" />
            <span>Business Hub</span>
          </button>
          <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
          <button type="button" onClick={onBack} className="hover:text-primary transition-colors">
            Catalog
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
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Add New Product</h1>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                Draft #PRD-8821
              </span>
            </div>
            <div className="flex items-center gap-space-md pt-space-2xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                  1
                </div>
                <span className="font-label-md text-label-md font-semibold text-text-primary">Product Basics &amp; Media</span>
              </div>
              <div className="w-8 h-1 bg-primary-container rounded-full" />
              <div className="flex items-center gap-space-xs text-text-secondary opacity-70">
                <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-sm text-label-sm">
                  2
                </div>
                <span className="font-label-md text-label-md">Pricing &amp; Variants</span>
              </div>
              <div className="w-8 h-1 bg-surface-container-high rounded-full" />
              <div className="flex items-center gap-space-xs text-text-secondary opacity-70">
                <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-sm text-label-sm">
                  3
                </div>
                <span className="font-label-md text-label-md">Branch Availability</span>
              </div>
              <span className="font-caption text-caption text-badge-discount-text font-semibold ml-space-xs bg-badge-discount-bg px-space-xs py-0.5 rounded">
                33% Completed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm self-end xl:self-center">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary transition-all"
            >
              Save as Draft &amp; Exit
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-space-lg py-space-xs rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow-md transition-all flex items-center gap-space-xs"
            >
              <span>Continue to Pricing &amp; Variants</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
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

              <div className="mb-space-sm">
                <CreateWithAiButton
                  aspectRatio="16/9"
                  assetType="product"
                  context={aiProductContext}
                  fileHint="Aspect 16:9"
                />
              </div>

              <div className="relative w-full h-80 rounded-xl overflow-hidden bg-surface-container-high group shadow-sm mb-space-md">
                <img
                  alt={COVER_ALT}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={COVER_IMAGE}
                />
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
                    <p className="font-label-md text-label-md font-semibold text-on-primary">woodfire_lamb_chops_master.jpg</p>
                    <p className="font-caption text-caption text-on-primary/80">3840 × 2160 • 2.4 MB • High Resolution SRGB</p>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      className="px-space-md py-space-xs rounded-xl bg-surface-canvas text-text-primary font-label-md text-label-md font-semibold shadow hover:bg-surface-tint-blue transition-colors flex items-center gap-1"
                    >
                      <Icon name="cached" className="text-[18px] text-primary" />
                      <span>Change Photo</span>
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
                  {GALLERY_THUMBNAILS.map((thumb) => (
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

            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="badge" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Title &amp; Producer Identification</h2>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md font-semibold text-text-primary" htmlFor="product-title">
                    Product Title <span className="text-error">*</span>
                  </label>
                  <span className="font-caption text-caption text-text-tertiary">{draft.title.length} / 80 chars</span>
                </div>
                <div className="relative">
                  <input
                    className="w-full h-[52px] px-space-md rounded-xl bg-surface-canvas text-body-md font-body-md text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                    id="product-title"
                    placeholder="e.g. Sizzling Ribeye Steak with Herb Butter"
                    type="text"
                    value={draft.title}
                    onChange={(event) => onDraftChange({ title: event.target.value })}
                  />
                  {draft.title.trim().length > 0 ? (
                    <Icon
                      name="check_circle"
                      className="absolute right-space-md top-1/2 -translate-y-1/2 text-badge-discount-text text-[20px]"
                    />
                  ) : null}
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Keep it appetizing, concise, and clear for search algorithms and receipt printouts.
                </p>
              </div>
              <div className="flex flex-col gap-space-2xs pt-space-xs">
                <label className="font-label-md text-label-md font-semibold text-text-primary" htmlFor="producer-name">
                  Kitchen Producer or Brand Line
                </label>
                <div className="relative">
                  <Icon
                    name="outdoor_grill"
                    className="absolute left-space-md top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]"
                  />
                  <input
                    className="w-full h-[52px] pl-12 pr-space-md rounded-xl bg-surface-canvas text-body-md font-body-md text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                    id="producer-name"
                    type="text"
                    value={draft.producer}
                    onChange={(event) => onDraftChange({ producer: event.target.value })}
                  />
                </div>
                <label className="flex items-center gap-space-xs pt-space-2xs cursor-pointer select-none">
                  <input
                    checked={draft.unbranded}
                    className="w-4 h-4 rounded text-primary focus:ring-primary-container"
                    type="checkbox"
                    onChange={(event) => onDraftChange({ unbranded: event.target.checked })}
                  />
                  <span className="font-label-sm text-label-sm text-text-secondary">
                    This item is artisanal, fresh house-prepared, or made in-kitchen
                  </span>
                </label>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="category" className="text-primary text-[22px]" />
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Product Category <span className="text-error">*</span>
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Every product must link to a central category for POS menus, storefront display, and QR ordering.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewCatImage('');
                    setShowInlineCategoryModal(true);
                  }}
                  className="px-space-md py-1.5 rounded-xl bg-surface-tint-blue hover:bg-surface-tint-blue/80 text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Icon name="add" className="text-[16px]" />
                  <span>Create Category Inline</span>
                </button>
              </div>

              {/* Category Dropdown and Details */}
              <div className="space-y-space-sm pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm font-semibold text-text-primary flex items-center justify-between">
                    <span>Select Assigned Category</span>
                    <span className="text-caption text-text-tertiary">{categories.length} Central Categories Available</span>
                  </label>
                  <select
                    value={draft.categoryId || 'grills'}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = categories.find((c) => c.id === selectedId);
                      onDraftChange({
                        categoryId: selectedId,
                        subCategory: found ? found.name : draft.subCategory,
                        primaryCategory: 'Food & Dining',
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-border text-body-md font-medium text-text-primary focus:outline-hidden focus:border-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.productCount} items)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Category Preview Info Card */}
                {(() => {
                  const activeCat = categories.find((c) => c.id === (draft.categoryId || 'grills')) || categories[0];
                  if (!activeCat) return null;
                  return (
                    <div className="p-space-md rounded-xl bg-surface-subtle/80 border border-border-subtle flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon name={activeCat.icon || 'restaurant'} className="text-[20px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md font-bold text-text-primary">{activeCat.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-badge-discount-bg text-badge-discount-text">
                            Active in Storefront &amp; QR
                          </span>
                        </div>
                        <p className="text-caption text-text-secondary mt-0.5">{activeCat.description}</p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-text-tertiary font-mono">
                          <span>Destination: {activeCat.qrDestinationUrl}</span>
                          <span>•</span>
                          <span>Live in POS Mesh</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* Inline Category Creation Modal */}
            {showInlineCategoryModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setShowInlineCategoryModal(false)}
                />
                <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                        <Icon name="create_new_folder" className="text-[18px]" />
                      </div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        Create Category Inline
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInlineCategoryModal(false)}
                      className="p-1.5 rounded-lg text-text-tertiary hover:bg-surface-subtle"
                    >
                      <Icon name="close" className="text-[18px]" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCategoryInline} className="mt-space-md space-y-space-md">
                    <div className="space-y-1">
                      <label className="text-caption font-semibold text-text-primary">
                        Category Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Woodfire Artisan Pizzas"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-border text-body-md text-text-primary focus:outline-hidden focus:border-primary"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-caption font-semibold text-text-primary">Description</label>
                      <textarea
                        rows={2}
                        value={newCatDescription}
                        onChange={(e) => setNewCatDescription(e.target.value)}
                        placeholder="e.g. Sourdough woodfired crust with imported mozzarella"
                        className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-sm text-text-primary focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-caption font-semibold text-text-primary">Display Icon</label>
                      <div className="grid grid-cols-6 gap-2">
                        {['outdoor_grill', 'lunch_dining', 'local_pizza', 'tapas', 'local_bar', 'cake'].map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewCatIcon(iconName)}
                            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                              newCatIcon === iconName
                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                : 'border-border bg-surface-subtle text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            <Icon name={iconName} className="text-[20px]" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <CategoryImageField value={newCatImage} onChange={setNewCatImage} />

                    <p className="text-[11px] text-text-tertiary">
                      The category will be created immediately in your central catalogue and selected for this product. Your draft changes will not be lost.
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowInlineCategoryModal(false)}
                        className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm"
                      >
                        Save &amp; Select
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="description" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Culinary Description</h2>
                </div>
                <button
                  type="button"
                  className="px-space-sm py-1.5 rounded-lg bg-surface-tint-blue hover:bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Icon name="auto_awesome" className="text-[16px]" />
                  <span>AI Polish Ready</span>
                </button>
              </div>
              <div className="relative">
                <textarea
                  className="w-full p-space-md rounded-xl bg-surface-canvas text-body-md font-body-md text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
                  placeholder="Describe flavors, cooking method, ingredients, and recommended side pairings..."
                  rows={5}
                  value={draft.description}
                  onChange={(event) => onDraftChange({ description: event.target.value })}
                />
                <div className="flex justify-between items-center mt-2 px-1 text-caption font-caption text-text-tertiary">
                  <span>Spell check passed</span>
                  <span>{draft.description.length} / 500 characters</span>
                </div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Dietary &amp; Packaging Badges</span>
                <div className="flex flex-wrap gap-space-xs">
                  {DIETARY_CHIPS.map((chip) => {
                    const active = activeChips.includes(chip.label);
                    if (chip.tone === 'tertiary') {
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => toggleChip(chip.label)}
                          className={
                            active
                              ? 'px-space-sm py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1'
                              : 'px-space-sm py-1.5 rounded-full bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm flex items-center gap-1 transition-colors'
                          }
                        >
                          <Icon name={chip.icon} className="text-[16px]" />
                          <span>{active ? `${chip.label} ×` : `+ ${chip.label}`}</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => toggleChip(chip.label)}
                        className={
                          active
                            ? 'px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm'
                            : 'px-space-sm py-1.5 rounded-full bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm flex items-center gap-1 transition-colors'
                        }
                      >
                        <Icon
                          name={chip.icon}
                          className={`text-[16px] ${chip.label === 'Gluten-free' ? 'text-badge-discount-text' : ''}`}
                        />
                        <span>{active ? `${chip.label} ×` : `+ ${chip.label}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="inventory_2" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Fulfillment &amp; Condition</h2>
              </div>
              <div className="flex flex-col gap-space-sm">
                {CONDITION_OPTIONS.map((option) => {
                  const selected = draft.condition === option.value;
                  return (
                    <div
                      key={option.value}
                      onClick={() => onDraftChange({ condition: option.value })}
                      className={`p-space-md rounded-xl cursor-pointer flex items-start gap-space-sm transition-all ${
                        selected
                          ? 'bg-surface-tint-blue ring-2 ring-primary-container shadow-sm'
                          : 'bg-surface-subtle hover:bg-surface-container-low'
                      }`}
                    >
                      {selected ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5 shrink-0 text-on-primary">
                          <Icon name="check" className="text-[14px]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-surface-container-highest mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-label-md text-label-md font-semibold text-text-primary">{option.label}</p>
                          {option.badge ? (
                            <span
                              className={`text-caption font-caption px-2 py-0.5 rounded ${option.badge.className}`}
                            >
                              {option.badge.text}
                            </span>
                          ) : null}
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">{option.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="phone_iphone" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Live Discovery Preview</h2>
                </div>
                <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" /> Mobile Feed Ready
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary -mt-2">
                Real-time simulation of how your item renders to consumers on the VEMTAP app nearby feed.
              </p>
              <div className="w-full rounded-2xl bg-surface-canvas shadow-lg p-space-md flex flex-col gap-space-sm">
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container-high">
                  <img alt={PREVIEW_ALT} className="w-full h-full object-cover" src={PREVIEW_IMAGE} />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Top Rated
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-on-background/70 backdrop-blur text-on-primary font-caption text-caption px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Icon name="timer" className="text-[14px]" />
                    <span>15-20 min prep</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                      <Icon name="storefront" className="text-[14px] text-primary" />
                      {draft.producer} • Wuse II
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center">
                      <Icon name="star" className="text-[14px] text-badge-discount-text" filled />
                      4.9 (140+)
                    </span>
                  </div>
                  <h3 className="font-label-md text-label-md font-bold text-text-primary truncate">{draft.title}</h3>
                  <p className="font-caption text-caption text-text-secondary line-clamp-2">{draft.description}</p>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-caption text-caption text-text-tertiary">Estimated Price</span>
                    <p className="font-label-md text-label-md font-bold text-primary">
                      ₦ {draft.basePrice} <span className="font-caption text-caption font-normal text-text-secondary">/ portion</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-space-md py-1.5 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Icon name="add_shopping_cart" className="text-[16px]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-sm rounded-lg flex items-center gap-space-xs text-caption font-caption text-text-secondary">
                <Icon name="fact_check" className="text-primary text-[18px]" />
                <span>Complies with Food Safety and Digital Consumer Information Guidelines.</span>
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
              <span>Back to Catalog</span>
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Continue to Pricing &amp; Availability</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md shadow-xl">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span className="font-label-md text-label-md">{toast ?? ''}</span>
        </div>
      </div>
    </Shell>
  );
}
