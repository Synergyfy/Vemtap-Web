import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { AddProductMethodsDialog } from '../../components/import/AddProductMethodsDialog';
import { ProductImportWizard } from '../../components/import/ProductImportWizard';
import { useImportedProducts } from '../productImport/importedProductStore';
import { summariseImport } from '../productImport/importSummary';
import { naira } from '../catalogueData';
import { hasApiConfig } from '../../services/api/client';
import { useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';

interface DesktopBusinessCatalogScreenProps {
  onBack: () => void;
  /** Live: receives the item the deal is built on (null when the catalogue is empty — skip deals). */
  onNext: (dealItem: CatalogueItem | null) => void;
  onSaveDraft: () => void;
  onAddProduct: () => void;
  onAddService: () => void;
}

interface CatalogEntry {
  id: string;
  name: string;
  type: 'Product' | 'Service';
  price: string;
  category: string;
  /** Live entries keep the API item so it can seed a deal. */
  item?: CatalogueItem;
}

const SEED_ENTRIES: CatalogEntry[] = [
  { id: 'e1', name: 'Woodfire Aged Ribeye Steak', type: 'Product', price: '₦12,000', category: 'Steaks & Grills' },
  { id: 'e2', name: 'Truffle Parmesan Fries', type: 'Product', price: '₦4,500', category: 'Sides & Starters' },
  { id: 'e3', name: 'Vintage Reserve Cabernet Sauvignon', type: 'Product', price: '₦42,000', category: 'Cellar & Spirits' },
  { id: 'e4', name: 'Chef Table Experience (2hr)', type: 'Service', price: '₦85,000', category: 'Experiences' },
];

export function DesktopBusinessCatalogScreen({ onBack, onNext, onSaveDraft, onAddProduct, onAddService }: DesktopBusinessCatalogScreenProps) {
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dealItemId, setDealItemId] = useState<string | null>(null);
  const importedProducts = useImportedProducts();

  const importedEntries: CatalogEntry[] = importedProducts.map((product) => ({
    id: product.id,
    name: product.name || 'Untitled imported product',
    type: 'Product',
    price: product.price !== null ? naira(product.price) : '—',
    category: `${product.category || 'General'}${product.status === 'draft' ? ' • Draft' : ''}`,
  }));
  // Live: the items this business has actually published; demo keeps the samples.
  const live = hasApiConfig();
  const products = useCatalogueItems('product');
  const services = useCatalogueItems('service');
  const liveEntries: CatalogEntry[] = [...(products.data ?? []), ...(services.data ?? [])].map((item) => ({
    id: item.id,
    name: item.name,
    type: item.itemType === 'service' ? 'Service' : 'Product',
    price: naira(toPrice(item.price ?? undefined) ?? 0),
    category: item.category?.name || (item.itemType === 'service' ? 'Service' : 'Product'),
    item,
  }));
  // Deals need a real item: the one the owner picked, else the first listed.
  const dealable = liveEntries.filter((entry) => entry.item?.status === 'active' && !entry.item.isSuspended);
  const dealEntry = dealable.find((entry) => entry.id === dealItemId) ?? dealable[0] ?? null;
  const entries = [...importedEntries, ...(live ? liveEntries : SEED_ENTRIES)];
  const loadingLive = live && (products.isLoading || services.isLoading);

  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors cursor-pointer">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <span className="font-label-sm text-caption text-primary font-semibold uppercase tracking-wider">Step 5 of 8</span>
        </div>
        <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">Products &amp; Services</h1>
        <p className="font-body-md text-body-md text-text-secondary">Add items one at a time, or bulk-import a CSV/Excel file. Everything can be refined later in the Central Catalogue.</p>
      </div>

      <div className="flex flex-col gap-3">
        {loadingLive ? <p className="font-body-md text-body-md text-text-secondary">Loading your catalogue…</p> : null}
        {!loadingLive && !entries.length ? (
          <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center flex flex-col items-center gap-1">
            <Icon name="inventory_2" className="text-[28px] text-text-tertiary" />
            <span className="font-label-md text-label-md text-text-primary font-semibold">Nothing in your catalogue yet</span>
            <span className="font-caption text-caption text-text-secondary">Add a product or service so customers have something to order, book or claim.</span>
          </div>
        ) : null}
        {entries.map((e) => (
          <div key={e.id} className="bg-surface-canvas rounded-xl p-4 shadow-sm border border-surface-container flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${e.type === 'Product' ? 'bg-surface-tint-blue text-primary' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>
                <Icon name={e.type === 'Product' ? 'lunch_dining' : 'room_service'} className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading-sm text-label-md font-semibold text-text-primary">{e.name}</span>
                <span className="font-caption text-caption text-text-secondary">{e.type} • {e.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{e.price}</span>
              {live && dealable.some((entry) => entry.id === e.id) && (
                <button
                  type="button"
                  onClick={() => setDealItemId(e.id)}
                  aria-pressed={dealEntry?.id === e.id}
                  className={`h-8 px-3 rounded-full font-caption text-caption font-semibold flex items-center gap-1 transition-colors ${
                    dealEntry?.id === e.id ? 'bg-primary text-on-primary' : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                  }`}
                >
                  <Icon name={dealEntry?.id === e.id ? 'check' : 'local_offer'} className="text-[14px]" />
                  <span>{dealEntry?.id === e.id ? 'Deal item' : 'Use for deal'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMethodsOpen(true)}
          className="py-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-primary hover:bg-surface-tint-blue/40 transition-colors cursor-pointer flex items-center justify-center gap-2 text-primary font-label-md text-label-md font-semibold"
        >
          <Icon name="add" className="text-[20px]" />
          <span>Add Product</span>
        </button>
        <button
          type="button"
          onClick={onAddService}
          className="py-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-primary hover:bg-surface-tint-blue/40 transition-colors cursor-pointer flex items-center justify-center gap-2 text-primary font-label-md text-label-md font-semibold"
        >
          <Icon name="add" className="text-[20px]" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Add Product: manual / bulk import / connect platform (coming soon) */}
      <AddProductMethodsDialog
        open={methodsOpen}
        onClose={() => setMethodsOpen(false)}
        onAddManually={() => {
          setMethodsOpen(false);
          onAddProduct();
        }}
        onBulkImport={() => {
          setMethodsOpen(false);
          setImportOpen(true);
        }}
      />

      {/* Reusable Bulk Product Import wizard */}
      <ProductImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        existingSkus={entries.map((entry) => entry.name)}
        existingNames={entries.map((entry) => entry.name)}
        onImported={(importResult) => {
          const drafts = importResult.imported - importResult.published;
          setToast(
            `${summariseImport(importResult)}${
              drafts > 0 ? ' You can review and publish the drafts in the Central Catalogue.' : ''
            }`,
          );
          window.setTimeout(() => setToast(null), 5000);
        }}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back</span>
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
              onClick={() => onNext(live ? dealEntry?.item ?? null : null)}
              disabled={loadingLive}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-60"
            >
              <span>{live && !loadingLive && !dealEntry ? 'Skip Deals for Now' : 'Continue to Deal Studio'}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
