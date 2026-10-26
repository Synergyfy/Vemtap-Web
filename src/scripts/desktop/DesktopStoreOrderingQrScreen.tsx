import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { hasApiConfig } from '../../services/api/client';
import { useBusinessQr } from '../../hooks/business/useBusinessQr';
import { useCatalogueCategories } from '../../hooks/business/useCatalogueCategories';
import { useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { toPrice } from '../../services/catalogueItemsService';
import { getCentralCategories, URBAN_PRODUCTS } from '../catalogueData';

interface DesktopStoreOrderingQrScreenProps {
  onNav: (key: string) => void;
}

function VemtapQrSvg({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="w-auto h-auto max-w-full drop-shadow-sm">
      <rect fill="#FFFFFF" width="100" height="100" rx="10" />
      {/* Corner Positional Finders */}
      <rect fill="#141B2B" height="28" rx="4" width="28" x="4" y="4" />
      <rect fill="#FFFFFF" height="18" rx="2" width="18" x="9" y="9" />
      <rect fill="#141B2B" height="10" rx="2" width="10" x="13" y="13" />

      <rect fill="#141B2B" height="28" rx="4" width="28" x="68" y="4" />
      <rect fill="#FFFFFF" height="18" rx="2" width="18" x="73" y="9" />
      <rect fill="#141B2B" height="10" rx="2" width="10" x="77" y="13" />

      <rect fill="#141B2B" height="28" rx="4" width="28" x="4" y="68" />
      <rect fill="#FFFFFF" height="18" rx="2" width="18" x="9" y="73" />
      <rect fill="#141B2B" height="10" rx="2" width="10" x="13" y="77" />

      {/* Synthetic QR Code data modules */}
      <rect fill="#141B2B" height="6" rx="1" width="6" x="36" y="6" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="48" y="6" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="38" y="18" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="52" y="18" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="6" y="38" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="16" y="46" />
      <rect fill="#141B2B" height="12" rx="1" width="6" x="28" y="38" />
      <rect fill="#141B2B" height="6" rx="1" width="12" x="68" y="38" />
      <rect fill="#141B2B" height="8" rx="1" width="8" x="86" y="44" />
      <rect fill="#141B2B" height="8" rx="1" width="6" x="38" y="68" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="48" y="74" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="62" y="68" />
      <rect fill="#141B2B" height="8" rx="1" width="8" x="76" y="78" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="88" y="70" />
      <rect fill="#141B2B" height="6" rx="1" width="14" x="38" y="86" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="60" y="88" />
      <rect fill="#141B2B" height="6" rx="1" width="10" x="82" y="90" />

      {/* Center VEMTAP Branded Icon Shield */}
      <rect fill="#FFFFFF" height="26" rx="6" width="26" x="37" y="37" />
      <rect fill="#066CF4" height="22" rx="5" width="22" x="39" y="39" />
      <path
        d="M45 46L50 54L55 46"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function DesktopStoreOrderingQrScreen({ onNav }: DesktopStoreOrderingQrScreenProps) {
  const { addQrCode, lastError, clearLastError } = useStoreOrdering();
  const live = hasApiConfig();
  const { branch: activeBranch, branches, isLive: branchesLoaded } = useBusinessBranch();
  // Live: real branches (keyed by id); demo: the storefront's sample branches.
  const branchOptions = live
    ? (branchesLoaded ? branches : []).map((b) => ({ value: b.id ?? b.key, label: b.name }))
    : [
        { value: 'wuse-2', label: 'Wuse II Flagship' },
        { value: 'maitama', label: 'Maitama Heights' },
        { value: 'garki', label: 'Garki Branch' },
      ];
  // Live: the business's own storefront link, categories and products; demo keeps the samples.
  const businessQr = useBusinessQr();
  const liveCategories = useCatalogueCategories();
  const liveProducts = useCatalogueItems('product');
  const storeBase = live ? businessQr.url ?? '' : 'https://vemtap.com/business/urban-grill-bistro-104/products';
  const withParams = (params: string) => (storeBase ? `${storeBase}${storeBase.includes('?') ? '&' : '?'}${params}` : '');
  const storeName = live ? businessQr.name ?? 'Your business' : 'Urban Grill & Bistro';
  const categories = live
    ? (liveCategories.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon ?? 'category',
        description: category.description ?? '',
        // No per-category QR scan/order data yet: shown as "—".
        stats: null as null | { scans: number; ordersCount: number; totalRevenue: number },
      }))
    : getCentralCategories('product');
  const products = live
    ? (liveProducts.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        image: item.mainImage || '',
        imageAlt: item.name,
        price: toPrice(item.price ?? undefined) ?? 0,
        category: item.category?.name ?? 'Product',
      }))
    : URBAN_PRODUCTS;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [primaryQrTab, setPrimaryQrTab] = useState<'store' | 'category' | 'product'>('store');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? '');
  const [selectedProductId, setSelectedProductId] = useState<string>(URBAN_PRODUCTS[0]?.id ?? '');
  // Live lists arrive after mount: keep the picked category/product one of them.
  useEffect(() => {
    if (live && categories.length && !categories.some((category) => category.id === selectedCategoryId)) setSelectedCategoryId(categories[0].id);
    if (live && products.length && !products.some((product) => product.id === selectedProductId)) setSelectedProductId(products[0].id);
  }, [live, categories, products, selectedCategoryId, selectedProductId]);

  // New QR form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'store' | 'section' | 'product' | 'custom'>('store');
  const [newBranch, setNewBranch] = useState(live ? (activeBranch.id ?? activeBranch.key) : 'wuse-2');
  const [newDestination, setNewDestination] = useState('');
  const [newTargetLabel, setNewTargetLabel] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  // The branch list loads after first render: keep the picked branch one of the real options.
  useEffect(() => {
    if (live && !branchOptions.some((option) => option.value === newBranch)) {
      setNewBranch(activeBranch.id ?? branchOptions[0]?.value ?? newBranch);
    }
  }, [live, branchOptions, newBranch, activeBranch.id]);

  useEffect(() => {
    if (!lastError) return;
    showToast(lastError);
    clearLastError();
  }, [lastError, clearLastError]);

  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const branchName = branchOptions.find((option) => option.value === newBranch)?.label ?? 'Branch';

    // QR destinations open the storefront directly: store & custom codes land on
    // the full catalogue page, product codes land on the product detail page.
    let defaultUrl = live
      ? withParams(`src=${newType}-qr&branch=${newBranch}`)
      : `https://vemtap.com/business/urban-grill-bistro-104/products?src=${newType}-qr&branch=${newBranch}`;
    if (newType === 'product' && products[0]) {
      defaultUrl = live
        ? withParams(`product=${products[0].id}&src=product-qr&branch=${newBranch}`)
        : `https://vemtap.com/business/urban-grill-bistro-104/products/${products[0].id}?src=product-qr&branch=${newBranch}`;
    }
    if (newDestination.trim()) {
      defaultUrl = newDestination.trim();
    }

    addQrCode({
      name: newName.trim(),
      type: newType,
      branchId: newBranch,
      branchName,
      destinationUrl: defaultUrl,
      targetLabel: newTargetLabel.trim() || `${newType.toUpperCase()} Destination`,
      active: true,
    });

    showToast(`Created new QR code: ${newName}`);
    setCreateModalOpen(false);
    setNewName('');
    setNewDestination('');
    setNewTargetLabel('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MerchantShell activeNav="store-ordering-qr" onNav={onNav}>
      <div className="w-full pb-space-3xl flex flex-col gap-space-xl">
        {/* Header Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-caption text-text-tertiary">
              <button
                type="button"
                onClick={() => onNav('store-ordering-dashboard')}
                className="hover:text-primary transition-colors"
              >
                Store Front
              </button>
              <span>/</span>
              <span className="text-text-primary font-semibold">QR Codes &amp; Placement</span>
            </div>
            <h1 className="text-heading-xl font-heading-xl text-text-primary tracking-tight">
              QR Codes &amp; Physical Placement
            </h1>
            <p className="text-body-sm text-text-secondary">
              Generate scannable QR touchpoints for tables, takeaway counters, window displays, and social sharing.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => onNav('store-ordering-dashboard')}
              className="px-space-md py-2.5 rounded-xl border border-border bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center gap-2 shadow-xs transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Orders</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all"
            >
              <Icon name="add" className="text-[20px]" />
              <span>Create New QR Code</span>
            </button>
          </div>
        </div>

        {/* Primary QR Destinations — Store, Category, Product */}
        <div className="bg-surface-canvas border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
          <div className="px-space-xl pt-space-xl pb-space-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="qr_code_2" className="text-[18px]" />
              </div>
              <h2 className="font-heading-sm text-heading-sm font-bold text-text-primary">Primary QR Destinations</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full text-caption font-bold bg-surface-tint-blue text-primary">Stable URLs</span>
            </div>
            <p className="text-body-sm text-text-secondary">
              These QR codes point to stable destination URLs. Changing product prices, images, or descriptions will not break a printed QR code.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-border-subtle px-space-xl gap-1">
            {(['store', 'category', 'product'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPrimaryQrTab(tab)}
                className={`px-4 py-2.5 text-label-md font-semibold capitalize border-b-2 -mb-px transition-colors ${
                  primaryQrTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'store' ? 'Store QR' : tab === 'category' ? 'Category QR' : 'Product QR'}
              </button>
            ))}
          </div>

          <div className="p-space-xl">
            {primaryQrTab === 'store' && (
              <div className="flex flex-col md:flex-row items-center gap-space-xl">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-border-subtle">
                    <VemtapQrSvg size={140} />
                  </div>
                  <span className="text-caption text-text-tertiary font-mono">Store QR</span>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <div className="text-label-lg font-bold text-text-primary">{storeName} — Full Storefront</div>
                    <div className="text-body-sm text-text-secondary mt-1">Opens the full storefront catalogue — every product with search &amp; category tabs. Customers browse all items and order directly.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle font-mono text-[11px] text-text-secondary break-all">
                    {withParams('src=store-qr') || '—'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-surface-subtle text-center">
                      <div className="font-heading-sm font-bold text-text-primary">1,240</div>
                      <div className="text-caption text-text-tertiary">Total Scans</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-subtle text-center">
                      <div className="font-heading-sm font-bold text-text-primary">382</div>
                      <div className="text-caption text-text-tertiary">Orders</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-subtle text-center">
                      <div className="font-heading-sm font-bold text-badge-discount-text">₦5.1M</div>
                      <div className="text-caption text-text-tertiary">Revenue</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { navigator.clipboard?.writeText(withParams('src=store-qr')); showToast('Store QR link copied!'); }} className="flex-1 py-2 rounded-xl border border-border text-text-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-subtle transition-colors">
                      <Icon name="content_copy" className="text-[16px]" /> Copy Link
                    </button>
                    <button type="button" onClick={handlePrint} className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm">
                      <Icon name="download" className="text-[16px]" /> Download QR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {primaryQrTab === 'category' && (
              <div className="flex flex-col gap-space-lg">
                <div className="flex items-center gap-3">
                  <label className="text-caption font-semibold text-text-primary shrink-0">Select Category:</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const cat = categories.find(c => c.id === selectedCategoryId);
                  if (!cat) return null;
                  const catUrl = withParams(`category=${cat.id}&src=cat-qr`);
                  return (
                    <div className="flex flex-col md:flex-row items-center gap-space-xl">
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="p-4 bg-white rounded-2xl shadow-md border border-border-subtle">
                          <VemtapQrSvg size={140} />
                        </div>
                        <span className="text-caption text-text-tertiary font-mono">Category QR</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-primary">{cat.icon}</span>
                            <span className="font-heading-sm font-bold text-text-primary">{cat.name}</span>
                          </div>
                          <p className="text-body-sm text-text-secondary mt-1">{cat.description}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle font-mono text-[11px] text-text-secondary break-all">{catUrl}</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-3 rounded-xl bg-surface-subtle text-center">
                            <div className="font-heading-sm font-bold text-text-primary">{cat.stats ? cat.stats.scans.toLocaleString() : '—'}</div>
                            <div className="text-caption text-text-tertiary">Scans</div>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-subtle text-center">
                            <div className="font-heading-sm font-bold text-text-primary">{cat.stats ? cat.stats.ordersCount : '—'}</div>
                            <div className="text-caption text-text-tertiary">Orders</div>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-subtle text-center">
                            <div className="font-heading-sm font-bold text-badge-discount-text">{cat.stats ? `₦${(cat.stats.totalRevenue / 1000).toFixed(0)}K` : '—'}</div>
                            <div className="text-caption text-text-tertiary">Revenue</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { navigator.clipboard?.writeText(catUrl); showToast('Category QR link copied!'); }} className="flex-1 py-2 rounded-xl border border-border text-text-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-subtle transition-colors">
                            <Icon name="content_copy" className="text-[16px]" /> Copy Link
                          </button>
                          <button type="button" onClick={handlePrint} className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm">
                            <Icon name="download" className="text-[16px]" /> Download QR
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {primaryQrTab === 'product' && (
              <div className="flex flex-col gap-space-lg">
                <div className="flex items-center gap-3">
                  <label className="text-caption font-semibold text-text-primary shrink-0">Select Product:</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const prod = products.find(p => p.id === selectedProductId);
                  if (!prod) return null;
                  const prodUrl = live
                    ? withParams(`product=${prod.id}&src=prod-qr`)
                    : `https://vemtap.com/business/urban-grill-bistro-104/products/${prod.id}?src=prod-qr`;
                  return (
                    <div className="flex flex-col md:flex-row items-center gap-space-xl">
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="p-4 bg-white rounded-2xl shadow-md border border-border-subtle">
                          <VemtapQrSvg size={140} />
                        </div>
                        <span className="text-caption text-text-tertiary font-mono">Product QR</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <img src={prod.image} alt={prod.imageAlt} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          <div>
                            <div className="font-heading-sm font-bold text-text-primary">{prod.name}</div>
                            <div className="text-caption text-text-secondary">₦{prod.price.toLocaleString()} · {prod.category}</div>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle font-mono text-[11px] text-text-secondary break-all">{prodUrl}</div>
                        <div className="p-3 rounded-xl bg-surface-tint-blue/20 border border-primary/20 flex items-start gap-2">
                          <Icon name="info" className="text-[15px] text-primary shrink-0 mt-0.5" />
                          <p className="text-caption text-primary">This QR will always point to this product even if the price or image changes. The product ID is permanent.</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { navigator.clipboard?.writeText(prodUrl); showToast('Product QR link copied!'); }} className="flex-1 py-2 rounded-xl border border-border text-text-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-subtle transition-colors">
                            <Icon name="content_copy" className="text-[16px]" /> Copy Link
                          </button>
                          <button type="button" onClick={handlePrint} className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm">
                            <Icon name="download" className="text-[16px]" /> Download QR
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create New QR Code */}

        {createModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setCreateModalOpen(false)}
            />

            <form
              onSubmit={handleCreateQr}
              className="relative w-full max-w-lg bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 space-y-space-md animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="qr_code" className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                      Create QR Touchpoint
                    </h3>
                    <p className="text-caption text-text-secondary">
                      Configure a physical or digital placement QR
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>

              {/* QR Name */}
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Touchpoint Label / Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Table 12 Patio Card, Takeaway Standee..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                />
              </div>

              {/* QR Type Selection */}
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Destination Type *
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                >
                  <option value="store">Store QR (Full Catalogue &amp; Storefront)</option>
                  <option value="section">Section QR (Category or Dine-In Table)</option>
                  <option value="product">Product QR (Single Special Item Quick-Order)</option>
                  <option value="custom">Custom Placement QR (Promotions, Events)</option>
                </select>
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Assigned Branch *
                </label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                >
                  {branchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Subline */}
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Target Label / Instructions
                </label>
                <input
                  type="text"
                  value={newTargetLabel}
                  onChange={(e) => setNewTargetLabel(e.target.value)}
                  placeholder="e.g. Indoor Terrace Table 12, Specials Board"
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                />
              </div>

              {/* Custom Destination URL (Optional) */}
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Custom Deep-Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="https://vemtap.com/business/... (Leave blank for auto-generate)"
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md font-mono text-caption"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm"
                >
                  Create QR Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
            <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </MerchantShell>
  );
}
