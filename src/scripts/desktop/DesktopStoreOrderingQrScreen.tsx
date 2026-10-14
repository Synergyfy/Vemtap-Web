import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import type { StoreQrRecord } from '../storeOrderingData';
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
  const { qrCodes, addQrCode, toggleQrActive } = useStoreOrdering();
  const categories = getCentralCategories('product');

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [previewQr, setPreviewQr] = useState<StoreQrRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [primaryQrTab, setPrimaryQrTab] = useState<'store' | 'category' | 'product'>('store');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? '');
  const [selectedProductId, setSelectedProductId] = useState<string>(URBAN_PRODUCTS[0]?.id ?? '');

  // New QR form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'store' | 'section' | 'product' | 'custom'>('store');
  const [newBranch, setNewBranch] = useState('wuse-2');
  const [newDestination, setNewDestination] = useState('');
  const [newTargetLabel, setNewTargetLabel] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredQrs = qrCodes.filter((qr) => {
    if (filterType !== 'all' && qr.type !== filterType) return false;
    if (selectedBranch !== 'all' && qr.branchId !== selectedBranch) return false;
    return true;
  });

  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const branchName =
      newBranch === 'wuse-2'
        ? 'Wuse II Flagship'
        : newBranch === 'maitama'
          ? 'Maitama Heights'
          : 'Garki Branch';

    let defaultUrl = `https://vemtap.com/business/urban-grill-bistro-104?src=${newType}-qr&branch=${newBranch}`;
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

  const handleCopyLink = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('QR code destination link copied to clipboard!');
    }
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
                Store Ordering
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
                    <div className="text-label-lg font-bold text-text-primary">Urban Grill &amp; Bistro — Full Storefront</div>
                    <div className="text-body-sm text-text-secondary mt-1">Points to the full digital store catalogue. Customers browse all categories and items.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle font-mono text-[11px] text-text-secondary break-all">
                    https://vemtap.com/business/urban-grill-bistro-104?src=store-qr
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
                    <button type="button" onClick={() => showToast('Store QR copied to clipboard!')} className="flex-1 py-2 rounded-xl border border-border text-text-primary font-semibold text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-subtle transition-colors">
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
                  const catUrl = `https://vemtap.com/business/urban-grill-bistro-104/storefront?category=${cat.slug}&src=cat-qr`;
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
                            <div className="font-heading-sm font-bold text-text-primary">{cat.stats.scans.toLocaleString()}</div>
                            <div className="text-caption text-text-tertiary">Scans</div>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-subtle text-center">
                            <div className="font-heading-sm font-bold text-text-primary">{cat.stats.ordersCount}</div>
                            <div className="text-caption text-text-tertiary">Orders</div>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-subtle text-center">
                            <div className="font-heading-sm font-bold text-badge-discount-text">₦{(cat.stats.totalRevenue / 1000).toFixed(0)}K</div>
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
                    {URBAN_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const prod = URBAN_PRODUCTS.find(p => p.id === selectedProductId);
                  if (!prod) return null;
                  const prodUrl = `https://vemtap.com/business/urban-grill-bistro-104/storefront/product/${prod.id}?src=prod-qr`;
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

        {/* Filters and Counters */}
        <div className="bg-surface-canvas border border-border-subtle rounded-2xl p-space-md shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                filterType === 'all'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-subtle text-text-secondary hover:text-on-surface'
              }`}
            >
              All Types ({qrCodes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('store')}
              className={`px-3.5 py-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                filterType === 'store'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-subtle text-text-secondary hover:text-on-surface'
              }`}
            >
              Store QR
            </button>
            <button
              type="button"
              onClick={() => setFilterType('section')}
              className={`px-3.5 py-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                filterType === 'section'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-subtle text-text-secondary hover:text-on-surface'
              }`}
            >
              Section QR
            </button>
            <button
              type="button"
              onClick={() => setFilterType('product')}
              className={`px-3.5 py-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                filterType === 'product'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-subtle text-text-secondary hover:text-on-surface'
              }`}
            >
              Product QR
            </button>
            <button
              type="button"
              onClick={() => setFilterType('custom')}
              className={`px-3.5 py-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                filterType === 'custom'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-subtle text-text-secondary hover:text-on-surface'
              }`}
            >
              Custom Placement
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5">
            <span className="text-caption text-text-tertiary font-medium">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-label-md font-semibold text-on-surface focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="wuse-2">Wuse II Flagship</option>
              <option value="maitama">Maitama Heights</option>
              <option value="garki">Garki Branch</option>
            </select>
          </div>
        </div>

        {/* QR Code Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {filteredQrs.map((qr) => (
            <div
              key={qr.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                qr.active
                  ? 'bg-surface-canvas border-border-subtle shadow-xs hover:shadow-md'
                  : 'bg-surface-subtle/60 border-border-subtle opacity-75'
              }`}
            >
              {/* Card Header & QR Visual Preview */}
              <div className="p-space-lg flex items-start gap-4">
                <div
                  onClick={() => setPreviewQr(qr)}
                  className="w-24 h-24 shrink-0 p-2 rounded-xl bg-white border border-border-subtle shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  title="Click to expand &amp; download"
                >
                  <VemtapQrSvg size={80} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full font-caption text-[11px] font-bold uppercase tracking-wider bg-surface-tint-blue text-primary">
                      {qr.type} QR
                    </span>
                    <span className={`w-2 h-2 rounded-full ${qr.active ? 'bg-badge-discount-text' : 'bg-text-tertiary'}`} />
                    <span className="text-[11px] text-text-tertiary">
                      {qr.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary line-clamp-1">
                    {qr.name}
                  </h3>

                  <p className="text-caption text-text-secondary mt-0.5 line-clamp-1">
                    {qr.targetLabel}
                  </p>

                  <span className="text-[11px] text-text-tertiary block mt-1">
                    Branch: {qr.branchName}
                  </span>
                </div>
              </div>

              {/* Attribution Metrics */}
              <div className="px-space-lg py-2.5 bg-surface-subtle border-y border-border-subtle grid grid-cols-3 gap-2 text-center text-caption">
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Scans</span>
                  <span className="font-bold text-text-primary">{qr.scansCount}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Orders</span>
                  <span className="font-bold text-primary">{qr.ordersCount}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Sales</span>
                  <span className="font-bold text-badge-discount-text">
                    ₦{(qr.revenueGenerated / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-space-md bg-surface-canvas flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleQrActive(qr.id)}
                  className={`text-caption font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    qr.active
                      ? 'border-border text-text-secondary hover:text-error'
                      : 'border-primary text-primary hover:bg-surface-tint-blue'
                  }`}
                >
                  {qr.active ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(qr.destinationUrl)}
                    title="Copy Link"
                    className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors"
                  >
                    <Icon name="link" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewQr(qr)}
                    className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary text-caption font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Icon name="visibility" className="text-[16px]" />
                    <span>Preview &amp; Print</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: QR Preview, Download & Print */}
        {previewQr && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setPreviewQr(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-space-xl border border-border-subtle z-10 space-y-space-lg text-center animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full font-caption text-[10px] font-bold uppercase bg-surface-tint-blue text-primary">
                    {previewQr.type} QR
                  </span>
                  <span className="font-semibold text-text-primary text-[14px]">
                    {previewQr.branchName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewQr(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>

              {/* Printable Stand Card Container */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-surface-subtle to-white border border-border-subtle/80 flex flex-col items-center">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">
                  VEMTAP EXPRESS TOUCHPOINT
                </span>
                <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary mb-3">
                  {previewQr.name}
                </h3>

                <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-sm my-2">
                  <VemtapQrSvg size={180} />
                </div>

                <div className="mt-3 text-caption text-text-secondary max-w-xs">
                  <p className="font-semibold text-text-primary">{previewQr.targetLabel}</p>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Scan with any smartphone camera to browse menu &amp; order directly.
                  </p>
                </div>
              </div>

              {/* Destination URL Display */}
              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between gap-2 text-caption">
                <span className="truncate text-text-secondary font-mono text-[11px]">
                  {previewQr.destinationUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(previewQr.destinationUrl)}
                  className="text-primary font-semibold hover:underline shrink-0"
                >
                  Copy
                </button>
              </div>

              {/* Download / Print Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-subtle text-text-primary font-label-md font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="print" className="text-[18px]" />
                  <span>Print Standee</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('QR PNG ready for download.');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Icon name="download" className="text-[18px]" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <option value="wuse-2">Wuse II Flagship</option>
                  <option value="maitama">Maitama Heights</option>
                  <option value="garki">Garki Branch</option>
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
