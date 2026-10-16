import { useState } from 'react';
import { Icon } from './ui/Icon';
import {
  importShowcaseItem,
  setBusinessShowcasePreference,
  type ShowcaseEntityType,
  type ClusterShowcaseItem,
} from '../scripts/clusterData';

interface ClusterImportModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  showcaseItems: ClusterShowcaseItem[];
  onToggleShow: (id: string) => void;
  onCreateDeal?: () => void;
  onCreateProduct?: () => void;
  onCreateLocation?: () => void;
}

export function ClusterImportModal({
  onClose,
  onSuccess,
  showcaseItems,
  onToggleShow,
  onCreateDeal,
  onCreateProduct,
  onCreateLocation,
}: ClusterImportModalProps) {
  const [selectedType, setSelectedType] = useState<ShowcaseEntityType>('deal');

  // Custom creation form state if merchant wants to add a new item on the fly
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [discount, setDiscount] = useState('20% OFF');
  const [price, setPrice] = useState('7500');
  const [oldPrice, setOldPrice] = useState('9500');
  const category = 'food';

  const handleCreateAction = () => {
    if (selectedType === 'deal' && onCreateDeal) {
      onClose();
      onCreateDeal();
      return;
    }
    if ((selectedType === 'product' || selectedType === 'service') && onCreateProduct) {
      onClose();
      onCreateProduct();
      return;
    }
    if (selectedType === 'profile' && onCreateLocation) {
      onClose();
      onCreateLocation();
      return;
    }
    setIsCreatingNew(true);
  };

  // Filter existing business items (businessId === '104')
  const myItems = showcaseItems.filter((item) => item.businessId === '104');
  const filteredMyItems = myItems.filter((item) => item.entityType === selectedType);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    importShowcaseItem({
      entityType: selectedType,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      discount: selectedType === 'deal' ? discount.trim() : undefined,
      price: Number(price) || 0,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      showInCluster: true,
    });

    onSuccess(
      `New ${selectedType === 'deal' ? 'deal' : selectedType === 'product' ? 'product' : 'service'} added and featured in cluster!`
    );
    onClose();
  };

  const handleSetGlobalPreference = (type: ShowcaseEntityType) => {
    setSelectedType(type);
    setBusinessShowcasePreference(type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-surface-canvas rounded-3xl w-full max-w-lg border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-surface-subtle border-b border-border-subtle flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-text-primary">
              Feature in Cluster System
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Choose what to showcase in the Amaka Mall rotator pool
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Showcase Entity Selector */}
        <div className="p-4 bg-surface-canvas border-b border-border-subtle shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-2">
            Select Entity Type to Showcase:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSetGlobalPreference('deal')}
              className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                selectedType === 'deal'
                  ? 'border-primary bg-surface-tint-blue/30 text-primary shadow-xs'
                  : 'border-border-subtle bg-surface-subtle text-text-secondary hover:border-text-tertiary'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Icon name="local_offer" className="text-[16px]" />
                <span>Deals</span>
              </div>
              <span className="text-[10px] text-text-tertiary leading-tight">
                Discount vouchers &amp; specials
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSetGlobalPreference('product')}
              className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                selectedType === 'product'
                  ? 'border-primary bg-surface-tint-blue/30 text-primary shadow-xs'
                  : 'border-border-subtle bg-surface-subtle text-text-secondary hover:border-text-tertiary'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Icon name="inventory_2" className="text-[16px]" />
                <span>Products / Menu</span>
              </div>
              <span className="text-[10px] text-text-tertiary leading-tight">
                Catalog dishes &amp; retail items
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSetGlobalPreference('profile')}
              className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                selectedType === 'profile'
                  ? 'border-primary bg-surface-tint-blue/30 text-primary shadow-xs'
                  : 'border-border-subtle bg-surface-subtle text-text-secondary hover:border-text-tertiary'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Icon name="badge" className="text-[16px]" />
                <span>Store Profile</span>
              </div>
              <span className="text-[10px] text-text-tertiary leading-tight">
                Storefront brand spotlight
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {!isCreatingNew ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-text-primary capitalize">
                    Your Auto-Imported {selectedType === 'deal' ? 'Deals' : selectedType === 'product' ? 'Products & Services' : 'Storefront Locations'}
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    Toggle individual items to show or hide in the cluster rotator
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateAction}
                  className="px-3 py-1.5 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:opacity-95"
                >
                  <Icon name="add" className="text-[14px]" />
                  <span>
                    {selectedType === 'deal'
                      ? 'Create Deal'
                      : selectedType === 'product'
                      ? 'Create Product / Service'
                      : 'Create Location'}
                  </span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {filteredMyItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.showInCluster
                        ? 'border-primary/40 bg-surface-tint-blue/10 shadow-xs'
                        : 'border-border-subtle bg-surface-subtle opacity-75'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-border-subtle shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-xs text-text-primary truncate">
                          {item.title}
                        </h5>
                        {item.discount && (
                          <span className="text-[10px] font-bold text-badge-discount-text bg-badge-discount-bg px-1.5 py-0.2 rounded">
                            {item.discount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">
                        {item.subtitle || `₦${item.price.toLocaleString()}`}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-text-tertiary mt-1">
                        <span>{item.impressions} Impr.</span>
                        <span>{item.clicks} Clicks</span>
                        <span>{item.views} Views</span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleShow(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        item.showInCluster
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-surface-container text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon
                        name={item.showInCluster ? 'visibility' : 'visibility_off'}
                        className="text-[15px]"
                      />
                      <span>{item.showInCluster ? 'Shown' : 'Hidden'}</span>
                    </button>
                  </div>
                ))}

                {filteredMyItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-text-secondary space-y-2">
                    <p>No {selectedType === 'deal' ? 'deals' : selectedType === 'product' ? 'products or services' : 'storefront locations'} found in your business catalog yet.</p>
                    <button
                      type="button"
                      onClick={handleCreateAction}
                      className="px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm hover:opacity-95"
                    >
                      <Icon name="add" className="text-[15px]" />
                      <span>
                        {selectedType === 'deal'
                          ? 'Open Deal Studio to Create Deal'
                          : selectedType === 'product'
                          ? 'Open Catalog to Create Product/Service'
                          : 'Open Locations to Create Storefront'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                <h4 className="font-bold text-xs text-text-primary capitalize">
                  New {selectedType} for Cluster
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  &larr; Back to Imported
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. ${
                    selectedType === 'deal'
                      ? '25% Off Artisan Lunch Combo'
                      : selectedType === 'product'
                      ? 'Smoked Chicken & Waffles'
                      : 'Executive Dining Experience'
                  }`}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Short description for cluster shoppers"
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>

              {selectedType === 'deal' && (
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Discount Badge
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="25% OFF"
                    className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Original Price (₦)
                  </label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-white text-xs font-semibold shadow-md active:scale-[0.98] transition-all"
                >
                  Feature in Cluster Rotator
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="py-2.5 px-4 rounded-xl bg-surface-subtle text-text-secondary text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-subtle border-t border-border-subtle flex items-center justify-between shrink-0 text-xs">
          <span className="text-text-secondary">
            {myItems.filter((i) => i.showInCluster).length} items active in rotator
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary-container text-white font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
