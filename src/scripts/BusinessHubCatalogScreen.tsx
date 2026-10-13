import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';

interface BusinessHubCatalogScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenAssignment: (itemName: string) => void;
  onBoost: (itemName: string) => void;
}

interface CatalogItem {
  key: string;
  category: string;
  sku: string;
  statusLabel: string;
  statusDot: string;
  statusClass: string;
  name: string;
  price: string;
  comparePrice?: string;
  baseNote?: string;
  img: string;
  alt: string;
  thumbBadge?: string;
  thumbBadgeClass?: string;
  thumbOverlay?: boolean;
  dealBadge?: string;
  note?: string;
  noteIcon?: string;
  noteClass?: string;
  availabilityPill: string;
  pillIcon: string;
  pillClass: string;
  pillExtra?: string;
  stockLabel: string;
  stockOn: boolean;
  actionLabel: string;
  actionIcon: string;
}

const CATALOG_ITEMS: CatalogItem[] = [
  {
    key: 'ribeye',
    category: 'Steaks & Grills',
    sku: 'VG-STEAK-01',
    statusLabel: 'Active & Published',
    statusDot: 'bg-badge-discount-text',
    statusClass: 'text-badge-discount-text',
    name: 'Woodfire Aged Ribeye Steak',
    price: '₦9,600',
    comparePrice: '₦12,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARmJwFGfykpJ12DQzKlrQ8nVmyn8furX9pmPfeq0vBZOBqfFGKVydCleuSJuB8Qj_Ds2S05O6Cxw_XY0slNJfk7PFgId-JaJunrDffoTR6iFLmaqVMhtrkjXTNXJsyGDuKMzYh-l00MNsbSQ_nqi5sKedR-mB0eNiw6VMHQoK0gf92ShDfqv43V59PogUOgn1uMBFmaT3DJlbzEOsKe2hNt8CegtPfe7lDDcaRMjGwKKIcWCbEA-Lyew',
    alt: 'Tender woodfire grilled prime ribeye steak sliced on an artisan slate presentation board with fresh rosemary sprigs, garlic butter glaze, warm amber moody restaurant lighting, rich textures, studio culinary photography',
    thumbBadge: 'Hot',
    thumbBadgeClass: 'text-primary-container',
    dealBadge: 'Deal Active • 20% OFF',
    availabilityPill: 'Available at All Locations (2 branches)',
    pillIcon: 'apartment',
    pillClass: 'bg-surface-tint-blue text-primary',
    stockLabel: 'In Stock (42 units)',
    stockOn: true,
    actionLabel: 'Edit',
    actionIcon: 'edit',
  },
  {
    key: 'fries',
    category: 'Sides & Starters',
    sku: 'VG-SIDE-04',
    statusLabel: 'Active',
    statusDot: 'bg-badge-discount-text',
    statusClass: 'text-badge-discount-text',
    name: 'Truffle Parmesan Fries',
    price: '₦4,500',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFufVae8sCll9rbLZkxeodDlR5es3rrONRF3D7Mg6O5Ucs__BoVU2m7mfcubeTXqgiFtRghRqVfQ1YiABbmerhjTJYgtTNvgqd97QZAF_583NGrSLXbM1y8FzkNigWQsV7Ik5DHrqgpfxoZKa1IbgYCOF9kRxYfwW_z0S-VAvPFUdY6gP09fmBqefSc0aDcyYocvKBaDbyiIgJNpPtSkT8hTxShU-0_JEWz1PBUTELFFKq9zkH0qGk4w',
    alt: 'Golden crisp hand-cut French fries tossed in grated authentic parmesan cheese flakes, shaved black truffle pieces, fine parsley sprigs in an artisanal metal cone holder, bright appetizing food photography',
    note: 'Dine-In • Takeaway',
    availabilityPill: 'Maitama Only (Branch 1 exclusive)',
    pillIcon: 'store',
    pillClass: 'bg-surface-container-high text-secondary',
    pillExtra: 'Custom',
    stockLabel: 'In Stock',
    stockOn: true,
    actionLabel: 'Edit',
    actionIcon: 'edit',
  },
  {
    key: 'wine',
    category: 'Cellar & Spirits',
    sku: 'VG-CELLAR-09',
    statusLabel: 'Active',
    statusDot: 'bg-badge-discount-text',
    statusClass: 'text-badge-discount-text',
    name: 'Vintage Reserve Cabernet',
    price: '₦42,000',
    baseNote: 'base',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOrpMZ2tE1IF6wXYk_WRbuh-nr_OXyZ_NYzYrlZyIvLbwEkGsoczgb5WdVMx0ScErpEiCxes-Ph7_StOkqCcOSNI603EepJAge4Sx4-IbPYyq2o626Vh0lVOuFGhZH0JkeWdU6VABuoo1arewJb_YIClAt0wBXuH8Cr8a1XJOX7w483G1AZm0pC98C3qcPXHl4glcQnDE3AnxqJpCpoiY8g93NFYx0T7zvEieIpmX0WDMG8FinKKouYg',
    alt: 'High-end Cabernet Sauvignon red wine bottle with luxurious textured gold and burgundy foil label, paired beside an elegant crystal Bordeaux glass reflecting candlelit ambient bar glow',
    thumbBadge: 'Low',
    thumbBadgeClass: 'text-on-tertiary-container',
    note: 'Limited Stock (3 left)',
    noteIcon: 'warning',
    noteClass: 'text-tertiary',
    availabilityPill: 'Different Price: ₦42k Abuja / ₦45k Lagos',
    pillIcon: 'tune',
    pillClass: 'bg-surface-container text-text-secondary',
    pillExtra: 'open',
    stockLabel: 'Available',
    stockOn: true,
    actionLabel: 'Edit',
    actionIcon: 'edit',
  },
  {
    key: 'bread',
    category: 'Bakery & Breads',
    sku: 'VG-BAKE-02',
    statusLabel: 'Draft / Paused',
    statusDot: 'bg-outline',
    statusClass: 'text-text-secondary',
    name: 'Artisan Sourdough Bread',
    price: '₦3,500',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAHZPSmQ7l9MxFIpAi2ec1zxKdMx-LEvgvykjEnJc8EmIFcyt57a5kDM4cbPe3K0J6oF207p7W3KqlSsl35xOLwQWi09gNXhlj_co_3MPGX_DkzGrMsfDxZWexqc4KCZ1pEJEVdrlwCtI0nRh1xIIwjyHtuC4YurTt3WzIT0Ep9SsGIHMJ4wAEwOC8mSUKgSicsllgW4pTfDi00khcwXqXt9PrprK5aAy166jls4Mmh2AcAIGBwAiy9w',
    alt: 'Warm artisan rustic sourdough loaf cut open dripping with creamy roasted garlic and herb compound butter on dark wood serving platter',
    thumbOverlay: true,
    note: 'Hidden from customer menu',
    noteClass: 'text-text-tertiary',
    availabilityPill: 'Configured for All Locations',
    pillIcon: 'domain',
    pillClass: 'bg-surface-container-low text-text-secondary',
    stockLabel: 'Off Shelf',
    stockOn: false,
    actionLabel: 'Publish',
    actionIcon: 'publish',
  },
];

const FILTER_CHIPS = ['All Status', 'Active Deals (4)', 'Low Stock', 'Dine-In & Takeaway'];
const LOCATION_OPTIONS = ['All Locations (2)', 'Maitama Abuja (Main)', 'Victoria Island Lagos'];

export function BusinessHubCatalogScreen({ onTab, onOpenAssignment, onBoost }: BusinessHubCatalogScreenProps) {
  const [location, setLocation] = useState('All Locations (2)');
  const [locationOpen, setLocationOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState('products');
  const [chip, setChip] = useState('All Status');
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState<Record<string, boolean>>(
    Object.fromEntries(CATALOG_ITEMS.map((item) => [item.key, item.stockOn])),
  );
  const [sheetItem, setSheetItem] = useState<string | null>(null);

  const visibleItems = CATALOG_ITEMS.filter((item) =>
    search.trim() === '' ? true : item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Location Switcher + Add New */}
        <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-between gap-space-xs">
          <div className="relative">
            {locationOpen && <div className="fixed inset-0 z-30" onClick={() => setLocationOpen(false)} />}
            <button
              className="flex items-center gap-space-2xs bg-surface-container-high text-on-surface px-space-sm py-space-2xs rounded-full shadow-sm hover:bg-surface-container-highest transition-colors"
              type="button"
              onClick={() => setLocationOpen((open) => !open)}
            >
              <Icon name="storefront" className="text-[16px] text-primary" />
              <span className="font-label-sm text-label-sm font-semibold truncate max-w-[130px]">{location}</span>
              <Icon
                name="expand_more"
                className={`text-[16px] text-on-surface-variant transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {locationOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-surface-canvas rounded-xl shadow-xl z-40 p-space-xs flex flex-col gap-space-2xs">
                {LOCATION_OPTIONS.map((option) => (
                  <button
                    className={`w-full text-left px-space-xs py-space-xs rounded-lg font-label-sm text-label-sm flex items-center justify-between ${
                      option === location
                        ? 'bg-surface-tint-blue text-primary font-semibold'
                        : 'hover:bg-surface-container-low text-text-primary'
                    }`}
                    key={option}
                    type="button"
                    onClick={() => {
                      setLocation(option);
                      setLocationOpen(false);
                    }}
                  >
                    <span>{option}</span>
                    {option === location && <Icon name="check" className="text-[16px]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Split Add Action */}
          <div className="relative">
            {addOpen && <div className="fixed inset-0 z-30" onClick={() => setAddOpen(false)} />}
            <button
              className="flex items-center gap-space-2xs bg-primary-container text-on-primary-container pl-space-sm pr-space-xs py-space-2xs rounded-full shadow-md active:scale-95 transition-all"
              type="button"
              onClick={() => setAddOpen((open) => !open)}
            >
              <Icon name="add" className="text-[18px]" />
              <span className="font-button-secondary text-button-secondary font-semibold">Add New</span>
              <span className="w-[1px] h-4 bg-on-primary-container/20 mx-space-2xs" />
              <Icon name="arrow_drop_down" className="text-[18px]" />
            </button>
            {addOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface-canvas rounded-xl shadow-xl z-40 p-space-xs flex flex-col gap-space-2xs">
                <button
                  className="w-full text-left px-space-sm py-space-xs rounded-lg hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-space-xs"
                  type="button"
                  onClick={() => setAddOpen(false)}
                >
                  <Icon name="inventory_2" className="text-primary text-[18px]" />
                  <span>+ Add Product</span>
                </button>
                <button
                  className="w-full text-left px-space-sm py-space-xs rounded-lg hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-space-xs"
                  type="button"
                  onClick={() => setAddOpen(false)}
                >
                  <Icon name="room_service" className="text-tertiary-container text-[18px]" />
                  <span>+ Add Service</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="px-margin mb-space-sm">
          <div className="flex items-center bg-surface-container-high p-[3px] rounded-full">
            {[
              { key: 'products', label: 'Products (28)' },
              { key: 'services', label: 'Services (14)' },
              { key: 'categories', label: 'Categories (6)' },
            ].map((catalogTab) => {
              const active = tab === catalogTab.key;
              return (
                <button
                  className={`flex-1 py-space-2xs text-center rounded-full font-label-md text-label-md transition-all ${
                    active ? 'bg-surface-canvas text-primary font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  key={catalogTab.key}
                  type="button"
                  onClick={() => setTab(catalogTab.key)}
                >
                  {catalogTab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Quick Filter */}
        <div className="px-margin flex flex-col gap-space-xs mb-space-md">
          <div className="relative flex items-center w-full">
            <Icon name="search" className="absolute left-space-sm text-outline text-[20px] pointer-events-none" />
            <input
              className="w-full bg-surface-canvas text-text-primary pl-10 pr-space-xl py-space-xs rounded-xl shadow-sm font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-all"
              placeholder="Search items, SKU, category..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              aria-label="Clear or filter"
              className="absolute right-space-sm text-outline hover:text-text-primary flex items-center"
              type="button"
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
          </div>
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-space-2xs">
            {FILTER_CHIPS.map((filterChip) => {
              const active = chip === filterChip;
              return (
                <button
                  className={`flex-shrink-0 px-space-sm py-1 rounded-full font-label-sm text-label-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                  key={filterChip}
                  type="button"
                  onClick={() => setChip(filterChip)}
                >
                  {filterChip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Catalogue List */}
        <div className="px-margin flex flex-col gap-space-sm pb-space-2xl">
          {visibleItems.map((item) => (
            <div
              className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-space-xs relative overflow-hidden"
              key={item.key}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-text-primary">{item.category}</span>
                  <span>•</span>
                  <span className="font-mono text-outline">{item.sku}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${item.statusDot}`} />
                  <span className={`font-medium ${item.statusClass}`}>{item.statusLabel}</span>
                </div>
              </div>
              {/* Main Row */}
              <div className="flex gap-space-sm items-start">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    alt={item.alt}
                    className={`w-full h-full object-cover ${item.thumbOverlay ? 'grayscale-[40%]' : ''}`}
                    src={item.img}
                  />
                  {item.thumbBadge && (
                    <span className="absolute bottom-1 right-1 bg-surface-canvas/90 px-1 py-0.5 rounded font-caption text-[10px] font-semibold flex items-center">
                      <Icon name="local_fire_department" className={`text-[10px] mr-0.5 ${item.thumbBadgeClass}`} />
                      {item.thumbBadge}
                    </span>
                  )}
                  {item.thumbOverlay && (
                    <div className="absolute inset-0 bg-surface-dim/40 flex items-center justify-center">
                      <Icon name="pause_circle" className="text-on-surface text-[18px]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h2
                      className={`font-heading-sm text-heading-sm truncate ${
                        item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {item.name}
                    </h2>
                    <div className="flex items-baseline gap-space-xs mt-0.5">
                      <span
                        className={`font-heading-sm text-heading-sm font-bold ${
                          item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                        }`}
                      >
                        {item.price}
                      </span>
                      {item.comparePrice && (
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          {item.comparePrice}
                        </span>
                      )}
                      {item.baseNote && (
                        <span className="font-caption text-caption text-text-secondary font-medium">{item.baseNote}</span>
                      )}
                    </div>
                  </div>
                  {item.dealBadge && (
                    <div className="mt-space-2xs inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full self-start">
                      <Icon name="local_offer" className="text-[13px]" />
                      <span className="font-caption text-caption font-semibold">{item.dealBadge}</span>
                    </div>
                  )}
                  {item.note && (
                    <span className={`font-caption text-caption mt-1 flex items-center gap-1 ${item.noteClass ?? 'text-text-secondary'}`}>
                      {item.noteIcon && <Icon name={item.noteIcon} className="text-[14px]" />}
                      {item.note}
                    </span>
                  )}
                </div>
                <button
                  aria-label={`${item.name} options`}
                  className="text-on-surface-variant hover:text-text-primary p-1 -mr-1 rounded-full transition-colors"
                  type="button"
                  onClick={() => setSheetItem(item.name)}
                >
                  <Icon name="more_vert" className="text-[20px]" />
                </button>
              </div>
              {/* Location Availability Pill */}
              <div
                className={`px-space-xs py-1 rounded-lg flex items-center gap-1.5 font-caption text-caption ${item.pillClass}`}
              >
                <Icon name={item.pillIcon} className="text-[15px]" />
                <span className="font-medium truncate">{item.availabilityPill}</span>
                {item.pillExtra && (
                  <span className="ml-auto bg-surface-canvas text-secondary text-[11px] px-1.5 py-0.5 rounded shadow-xs font-medium shrink-0">
                    {item.pillExtra}
                  </span>
                )}
              </div>
              {/* Quick Action Deck */}
              <div className="flex items-center justify-between pt-space-2xs bg-surface-container-low/50 -mx-space-sm -mb-space-sm px-space-sm py-2 rounded-b-xl">
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Toggle stock for ${item.name}`}
                    className={`w-9 h-5 rounded-full transition-colors ${stock[item.key] ? 'bg-primary-container' : 'bg-surface-dim'}`}
                    role="switch"
                    type="button"
                    onClick={() => setStock((current) => ({ ...current, [item.key]: !current[item.key] }))}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-surface-canvas shadow transition-transform ${
                        stock[item.key] ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                  <span className="font-label-sm text-label-sm text-text-secondary">
                    {stock[item.key] ? item.stockLabel : 'Off Shelf'}
                  </span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <button
                    className="flex items-center gap-1 px-space-xs py-1 rounded-md bg-primary-container shadow-sm text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-colors"
                    type="button"
                    onClick={() => onBoost(item.name)}
                  >
                    <Icon name="rocket_launch" className="text-[15px]" />
                    <span>Boost</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-space-xs py-1 rounded-md bg-surface-canvas shadow-sm text-primary font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors"
                    type="button"
                    onClick={() => onOpenAssignment(item.name)}
                  >
                    <Icon name={item.actionIcon} className="text-[15px]" />
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visibleItems.length === 0 && (
            <div className="py-space-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-space-sm">
                <Icon name="inventory_2" className="text-[32px]" />
              </div>
              <h4 className="font-heading-sm text-heading-sm text-text-primary">No items found</h4>
              <p className="font-body-md text-body-md text-text-secondary max-w-xs mt-1">
                Try a different search or switch location filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Item Options Action Sheet */}
      {sheetItem && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex items-end justify-center"
          onClick={() => setSheetItem(null)}
        >
          <div
            className="w-full max-w-[430px] bg-surface-canvas rounded-t-2xl p-space-md shadow-2xl flex flex-col gap-space-xs rounded-b-2xl mb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between pb-space-xs">
              <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{sheetItem}</h3>
              <button
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-text-primary"
                type="button"
                onClick={() => setSheetItem(null)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            {[
              { icon: 'content_copy', iconClass: 'text-primary', label: 'Duplicate Product' },
              { icon: 'price_change', iconClass: 'text-primary-container', label: 'Manage Location Pricing' },
              { icon: 'qr_code_2', iconClass: 'text-secondary', label: 'View Table Order QR' },
              { icon: 'archive', iconClass: 'text-error', label: 'Archive from Catalogue', danger: true },
            ].map((action) => (
              <button
                className={`w-full flex items-center gap-space-sm px-space-sm py-space-sm rounded-xl font-body-md text-body-md transition-colors text-left ${
                  action.danger ? 'hover:bg-error-container text-error' : 'hover:bg-surface-container text-text-primary'
                }`}
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.label === 'Manage Location Pricing') {
                    setSheetItem(null);
                    onOpenAssignment(sheetItem);
                  } else {
                    setSheetItem(null);
                  }
                }}
              >
                <Icon name={action.icon} className={`text-[20px] ${action.iconClass}`} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Quick-Action Deck */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 flex items-center justify-center gap-space-xs pointer-events-none">
        <div className="pointer-events-auto bg-surface-canvas/95 backdrop-blur-md p-1.5 rounded-full shadow-xl flex items-center gap-space-2xs">
          <button
            className="flex items-center gap-1.5 px-space-sm py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold shadow-md active:scale-95 transition-all"
            type="button"
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>+ Add Product</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-space-sm py-2 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-highest active:scale-95 transition-all"
            type="button"
          >
            <Icon name="design_services" className="text-[18px] text-tertiary-container" />
            <span>+ Add Service</span>
          </button>
        </div>
      </div>

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
