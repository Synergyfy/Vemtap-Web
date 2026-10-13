import { Icon } from '../../components/ui/Icon';

interface DesktopBusinessCatalogScreenProps {
  onBack: () => void;
  onNext: () => void;
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
}

const SEED_ENTRIES: CatalogEntry[] = [
  { id: 'e1', name: 'Woodfire Aged Ribeye Steak', type: 'Product', price: '₦12,000', category: 'Steaks & Grills' },
  { id: 'e2', name: 'Truffle Parmesan Fries', type: 'Product', price: '₦4,500', category: 'Sides & Starters' },
  { id: 'e3', name: 'Vintage Reserve Cabernet Sauvignon', type: 'Product', price: '₦42,000', category: 'Cellar & Spirits' },
  { id: 'e4', name: 'Chef Table Experience (2hr)', type: 'Service', price: '₦85,000', category: 'Experiences' },
];

export function DesktopBusinessCatalogScreen({ onBack, onNext, onSaveDraft, onAddProduct, onAddService }: DesktopBusinessCatalogScreenProps) {
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
        <p className="font-body-md text-body-md text-text-secondary">Seed your catalogue with a few items. You can bulk-import or refine everything later in the Central Catalogue.</p>
      </div>

      <div className="flex flex-col gap-3">
        {SEED_ENTRIES.map((e) => (
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
            <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{e.price}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onAddProduct}
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

      <div className="flex items-center justify-between pt-4 border-t border-surface-container">
        <button type="button" onClick={onSaveDraft} className="h-11 px-5 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary font-button-secondary text-button-secondary transition-colors cursor-pointer">
          Save Draft
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-11 px-6 rounded-xl bg-primary-container text-on-primary shadow-[0_4px_14px_rgba(6,108,244,0.28)] hover:bg-primary active:scale-95 font-button-primary text-button-primary transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Continue to Deal Studio</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
