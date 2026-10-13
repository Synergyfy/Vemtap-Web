import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  SPA_CATALOGUE_CHIPS,
  SPA_SERVICE_SECTIONS,
  formatMinutes,
  type SpaCatalogueService,
  type SpaServiceSection,
} from './spaBookingData';

interface ServicesCatalogueScreenProps {
  onBack: () => void;
  onOpenDeals: () => void;
  onOpenService?: (name: string) => void;
  onContinueBook?: () => void;
}

export function ServicesCatalogueScreen({
  onBack,
  onOpenDeals,
  onOpenService,
  onContinueBook,
}: ServicesCatalogueScreenProps) {
  const [selected, setSelected] = useState<Map<number, SpaCatalogueService>>(() => new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const toggleSelect = (service: SpaCatalogueService) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(service.id)) next.delete(service.id);
      else next.set(service.id, service);
      return next;
    });
  };

  const total = Array.from(selected.values()).reduce((sum, s) => sum + s.price, 0);
  const totalTime = Array.from(selected.values()).reduce((sum, s) => sum + s.time, 0);

  const filteredSections = SPA_SERVICE_SECTIONS.map((section) => ({
    ...section,
    services: section.services.filter(
      (s) => !searchQuery || `${s.name} ${s.desc}`.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.services.length > 0);

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Service Catalogue</h1>
          </div>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              aria-label="Share"
              type="button"
              onClick={() => showToast('Spa link copied to clipboard')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary hover:bg-surface-container-low transition-colors"
            >
              <Icon name="share" className="text-[22px]" />
            </button>
            <button
              aria-label="Save to favorites"
              type="button"
              onClick={() => showToast('Added to favorites')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary hover:bg-surface-container-low transition-colors"
            >
              <Icon name="bookmark" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>
      <ServicesBody
        sections={filteredSections}
        chips={SPA_CATALOGUE_CHIPS}
        activeChip={activeChip}
        onChip={setActiveChip}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        selected={selected}
        onToggleSelect={toggleSelect}
        total={total}
        totalTime={totalTime}
        onOpenDeals={onOpenDeals}
        onOpenService={onOpenService}
        onContinueBook={onContinueBook}
      />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}

interface ServicesBodyProps {
  sections: SpaServiceSection[];
  chips: string[];
  activeChip: number;
  onChip: (index: number) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  selected: Map<number, SpaCatalogueService>;
  onToggleSelect: (service: SpaCatalogueService) => void;
  total: number;
  totalTime: number;
  onOpenDeals: () => void;
  onOpenService?: (name: string) => void;
  onContinueBook?: () => void;
}

function ServicesBody({
  sections,
  chips,
  activeChip,
  onChip,
  searchQuery,
  onSearch,
  selected,
  onToggleSelect,
  total,
  totalTime,
  onOpenDeals,
  onOpenService,
  onContinueBook,
}: ServicesBodyProps) {
  return (
    <main className="flex flex-col relative w-full pt-14 pb-safe bg-surface-canvas min-h-screen">
      <div className="flex flex-col w-full">
        <section className="px-margin pt-space-xs pb-space-sm bg-surface-canvas shadow-sm">
          <div className="flex items-center justify-between gap-space-xs mb-space-2xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">Glow & Serenity Spa</span>
                <span>•</span>
                <span className="truncate">Maitama Heights</span>
              </div>
              <div className="flex items-center gap-space-xs mt-1">
                <span className="inline-flex items-center gap-1 px-space-2xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  Open Now
                </span>
                <div className="flex items-center gap-0.5 text-tertiary-container font-label-sm text-label-sm font-semibold">
                  <Icon name="star" className="text-[15px]" filled />
                  <span>4.9</span>
                  <span className="text-text-tertiary font-normal">(96)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-2xs shrink-0">
              <span className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold shadow-sm">
                <Icon name="spa" className="text-[18px]" />
                <span>{selected.size} Selected</span>
              </span>
            </div>
          </div>
          <div className="mt-space-sm flex items-center gap-space-xs">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]" />
              <input
                type="text"
                placeholder="Search haircuts, facials, massages, nails..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md placeholder:text-text-tertiary outline-none focus:bg-surface-canvas shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-surface-subtle p-1 rounded-xl shadow-sm">
              <button
                aria-label="List view"
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-canvas text-primary shadow-sm"
              >
                <Icon name="view_list" className="text-[20px]" />
              </button>
              <button
                aria-label="Grid view"
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name="grid_view" className="text-[20px]" />
              </button>
            </div>
            <button
              aria-label="Filter catalogue"
              type="button"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-subtle text-text-primary hover:bg-surface-container-low transition-colors shadow-sm relative"
            >
              <Icon name="tune" className="text-[20px]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            </button>
          </div>
        </section>

        <section className="w-full bg-surface-canvas py-space-xs shadow-sm overflow-hidden">
          <div className="flex items-center gap-space-xs overflow-x-auto px-margin no-scrollbar">
            {chips.map((chip, idx) => (
              <button
                key={chip}
                type="button"
                onClick={() => onChip(idx)}
                className={`shrink-0 px-space-sm h-9 rounded-full font-label-md text-label-md transition-all ${
                  activeChip === idx
                    ? 'bg-surface-tint-blue text-primary font-semibold'
                    : 'bg-surface-subtle text-text-secondary font-medium hover:text-text-primary'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        <section className="px-margin pt-space-md">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-tint-blue via-surface-container-low to-surface-tint-blue p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center shrink-0 text-primary">
                <Icon name="local_offer" className="text-[22px]" />
              </div>
              <div className="min-w-0">
                <p className="font-label-md text-label-md font-semibold text-text-primary truncate">2 Active Deals Apply</p>
                <p className="font-caption text-caption text-text-secondary line-clamp-1">Save up to 25% with claimed VEMTAP voucher</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenDeals}
              className="shrink-0 font-label-sm text-label-sm font-semibold text-primary px-space-xs py-1.5 rounded-lg hover:bg-surface-canvas/80 transition-colors"
            >
              View Deals →
            </button>
          </div>
        </section>

        <div className="px-margin pt-space-md pb-32 flex flex-col gap-space-lg">
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-space-sm">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-space-2xs">
                  <span className="text-[18px]">{section.emoji}</span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">{section.title}</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">{section.count}</span>
              </div>
              {section.services.map((service) => {
                const isSelected = selected.has(service.id);
                return (
                  <article
                    key={service.id}
                    onClick={() => onOpenService?.(service.name)}
                    className="rounded-xl bg-surface-canvas p-space-sm shadow-sm flex flex-col gap-space-xs transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex gap-space-sm items-start">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-subtle">
                        <img className="w-full h-full object-cover" alt={service.imageAlt} src={service.image} />
                        {service.dealBadge && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-badge-discount-bg text-badge-discount-text font-caption text-[10px] font-bold">
                            {service.dealBadge}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle font-caption text-caption text-text-secondary">
                            <Icon name="schedule" className="text-[13px]" />
                            {service.time} mins
                          </span>
                          {service.claimedTag && (
                            <span className="px-1.5 py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-[11px] font-medium">{service.claimedTag}</span>
                          )}
                        </div>
                        <h3 className="font-label-md text-label-md font-semibold text-text-primary mt-1 line-clamp-1">{service.name}</h3>
                        <p className="font-caption text-caption text-text-secondary mt-1 line-clamp-2">{service.desc}</p>
                        <div className="mt-2 flex items-center justify-between gap-space-xs">
                          {service.was ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-button-primary text-button-primary font-bold text-text-primary">₦{service.price.toLocaleString()}</span>
                              <span className="font-caption text-caption line-through text-text-tertiary">₦{service.was.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="font-button-primary text-button-primary font-bold text-text-primary">₦{service.price.toLocaleString()}</span>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleSelect(service);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 ${
                              isSelected
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-subtle text-primary hover:bg-surface-tint-blue'
                            }`}
                          >
                            <Icon name={isSelected ? 'check' : 'add'} className="text-[16px]" />
                            {isSelected ? 'Added' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </div>

        <aside className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-margin pb-safe pt-2 bg-gradient-to-t from-surface-canvas via-surface-canvas to-transparent pointer-events-none">
          <div className="pointer-events-auto mb-3 mx-auto w-full rounded-2xl bg-surface-canvas p-3.5 shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="shopping_bag" className="text-[18px]" />
                </div>
                <div>
                  <p className="font-label-md text-label-md font-bold text-text-primary">
                    {selected.size} {selected.size === 1 ? 'Service' : 'Services'} Selected
                  </p>
                  <p className="font-caption text-caption text-text-secondary">
                    ₦{total.toLocaleString()} • Est. {formatMinutes(totalTime)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onContinueBook}
                className="px-space-md py-3 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Continue to Book</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 pt-1 px-1">
              <Icon name="verified" className="text-badge-discount-text text-[15px]" />
              <span className="font-caption text-caption text-text-secondary truncate">
                VEMTAP vouchers auto-apply at appointment checkout.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
