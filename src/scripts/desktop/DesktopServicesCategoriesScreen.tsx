import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopServicesCategoriesScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBackToCatalog?: () => void;
}

interface ServiceCardData {
  id: string;
  image: string;
  alt: string;
  imageTag: string;
  imageTagClass: string;
  category: string;
  status: { label: string; tone: 'active' | 'premium'; icon: 'default' | 'primary' };
  title: string;
  description: string;
  metrics: Array<{ icon: string; iconClass: string; label: string; value: string; suffix?: string }>;
  meta: Array<{ icon: string; iconClass: string; text: string; strong?: boolean }>;
  actionLabel: string;
  actionIcon: string;
}

const SERVICES: ServiceCardData[] = [
  {
    id: 'facial',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzwLhrxjqW-dcCCn4Gv3OmdBr3QDPTI-mJ2D2yEU-pyLhjddAkldLF4BG1udG0dGEv1Vu5Bvn3TgSBagpaWX2inWlRQ5Fyq37uLSrYbjTkjCWGHXsqHrMwFTW1kDC9aszRBaY62wHY2nixxjapNZq3bl_2qMytq7EE498oeMCfMHGySfLJvPElVZTU0H3nGKpIAzI3Nl0RxD6MKFKQSOFbsHXzcoITYaWJYsoex0u-OU7jyjfGXJkUjA',
    alt: 'A serene close-up photograph of a luxury spa client receiving an organic floral botanical facial treatment under soft ambient illumination, reflecting crisp deep blues and warm clinical purity.',
    imageTag: 'FACIAL',
    imageTagClass: 'bg-badge-discount-bg text-badge-discount-text',
    category: 'Skincare & Aesthetics',
    status: { label: 'Active', tone: 'active', icon: 'default' },
    title: 'Deep Hydration Radiance Facial',
    description: 'Multi-tier hyaluronic infusing ritual with targeted ultrasonic skin replenishment.',
    metrics: [
      { icon: 'payments', iconClass: 'text-primary', label: 'Price', value: '₦16,000' },
      { icon: 'schedule', iconClass: 'text-secondary', label: 'Duration', value: '60 mins' },
      { icon: 'badge', iconClass: 'text-tertiary-container', label: 'Lead Esthetician', value: 'Amara K.' },
    ],
    meta: [
      { icon: 'location_on', iconClass: 'text-primary', text: 'Available at Maitama Spa Suite' },
      { icon: 'notification_important', iconClass: 'text-tertiary', text: 'Requires 2h advance notice' },
    ],
    actionLabel: 'Availability Calendar',
    actionIcon: 'calendar_month',
  },
  {
    id: 'manicure',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6FrmTkPjx_z-yNKaA92wwuTQnC_S-S9wE7qBedUDy-tGqr7WQ8PV8Wq-qQ1lyVN_EvsTGRhtYRHQuZxwnyiAqqqKR5i7lgjnYvqGkOt62p4eR17Gz2qPCPFP8-NOYmqu3Ao0AOdQivYu75q83tuoVQvjnwwz7JWyl_JhE-9bNJNeZxWz2kGPbKW_yhVva9IbBI12PavsjQfiSocuqWIQKDUlA27t2Q7if2GM6De8ZIiTZyxSTl_fnqw',
    alt: 'High precision modern manicure process in a clean minimalist nail bar with high-gloss pastel gel polish bottles, neat workstation, bright clean modern lighting aesthetics.',
    imageTag: 'BEAUTY',
    imageTagClass: 'bg-badge-discount-bg text-badge-discount-text',
    category: 'Nails & Beauty',
    status: { label: 'Active', tone: 'active', icon: 'default' },
    title: 'Deluxe Gel Manicure & Hand Therapy',
    description: 'Organic cuticle treatment, hot towel wrap, and long-lasting diamond gloss gel coat.',
    metrics: [
      { icon: 'payments', iconClass: 'text-primary', label: 'Price', value: '₦9,000' },
      { icon: 'schedule', iconClass: 'text-secondary', label: 'Duration', value: '45 mins' },
      { icon: 'group', iconClass: 'text-secondary', label: 'Staff Capacity', value: '4 Technicians on duty' },
    ],
    meta: [
      { icon: 'storefront', iconClass: 'text-badge-discount-text', text: 'All 3 Branches' },
      { icon: 'directions_walk', iconClass: 'text-badge-discount-text', text: 'Walk-ins accepted' },
    ],
    actionLabel: 'Availability Calendar',
    actionIcon: 'calendar_month',
  },
  {
    id: 'dining',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBK_slyqEKmoMHQv65X7-eOKK_ujhykbDdwUcHM6ib2Tsj-XFJ0WILR2haDhWpGBi8b7YvOPdW-fjSkASAjgbY8iuzGsvgnwudkPShjKe_5EhN16JvEvAf-S8nTKFUSpISywUH4vH51NbVqU4UdHoW6JrFCw1Uzfv2BZnIjPCOcOimLCN4yldFgatRMdo0II_RKILMvHeFE5WKsgnc5bucGvOX0elg-DWNEO1YxOwHosgYLvNr3bGU0Yw',
    alt: 'An exclusive fine dining chef tasting table setting in an upscale restaurant with artisan earthenware plates, fine cutlery, soft candle reflections and an intimate ambiance.',
    imageTag: 'VIP DINING',
    imageTagClass: 'bg-surface-container-high text-on-surface-variant',
    category: 'Dining Experiences',
    status: { label: 'Premium Tier', tone: 'premium', icon: 'primary' },
    title: "Private Dining Chef's Tasting Table",
    description: 'Exclusive 7-course seasonal West African fusion menu curated table-side by Executive Chef.',
    metrics: [
      { icon: 'payments', iconClass: 'text-primary', label: 'Price', value: '₦45,000', suffix: '/ guest' },
      { icon: 'schedule', iconClass: 'text-secondary', label: 'Duration', value: '2.5 hours' },
      { icon: 'wine_bar', iconClass: 'text-tertiary-container', label: 'Beverage Program', value: 'Sommelier pairings' },
    ],
    meta: [
      { icon: 'domain', iconClass: 'text-primary', text: 'Wuse Flagship Only', strong: true },
      { icon: 'people_outline', iconClass: 'text-secondary', text: 'Min 4 guests' },
      { icon: 'lock_clock', iconClass: 'text-tertiary', text: 'Deposit required' },
    ],
    actionLabel: 'Reservation Rules',
    actionIcon: 'rule',
  },
];

const CATEGORIES = [
  { name: 'Steaks & Woodfire Grills', count: '12 items', kind: 'Products', boxClass: 'bg-surface-container text-secondary', kindClass: 'text-primary' },
  { name: 'Starters & Sides', count: '8 items', kind: 'Products', boxClass: 'bg-surface-container text-secondary', kindClass: 'text-primary' },
  { name: 'Cellar, Wines & Cocktails', count: '8 items', kind: 'Products', boxClass: 'bg-surface-container text-secondary', kindClass: 'text-primary' },
  { name: 'Aesthetics & Skincare', count: '6 services', kind: 'Services', boxClass: 'bg-surface-container-high text-primary', kindClass: 'text-secondary' },
  { name: 'Beauty & Salon Care', count: '5 services', kind: 'Services', boxClass: 'bg-surface-container-high text-primary', kindClass: 'text-secondary' },
  { name: 'Private Dining Packages', count: '3 packages', kind: 'Services', boxClass: 'bg-surface-container-high text-primary', kindClass: 'text-secondary' },
];

const TILES = [
  {
    label: 'Active Services',
    value: '14',
    valueNote: 'Online',
    valueNoteClass: 'text-badge-discount-text',
    iconBox: 'bg-surface-tint-blue text-primary',
    icon: 'spa',
  },
  {
    label: 'Requires Booking',
    value: '11',
    valueNote: '78% total',
    valueNoteClass: 'text-text-secondary',
    iconBox: 'bg-surface-container-high text-secondary',
    icon: 'calendar_clock',
  },
  {
    label: 'Categories Defined',
    value: '6',
    valueNote: 'Taxonomies',
    valueNoteClass: 'text-primary',
    iconBox: 'bg-surface-tint-blue text-primary',
    icon: 'layers',
  },
  {
    label: 'Terminal Sync Status',
    value: 'In-Sync',
    valueNote: '60s poll',
    valueNoteClass: 'text-text-secondary',
    valueClass: 'text-badge-discount-text',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    icon: 'sync_saved_locally',
  },
];

type StatusPill = 'all' | 'booking' | 'archived';

export function DesktopServicesCategoriesScreen({
  onNav,
  onBackToCatalog,
}: DesktopServicesCategoriesScreenProps) {
  const [query, setQuery] = useState('');
  const [pill, setPill] = useState<StatusPill>('all');
  const [published, setPublished] = useState(false);

  const visibleServices = SERVICES.filter((service) => {
    const needle = query.trim().toLowerCase();
    return !needle || service.title.toLowerCase().includes(needle) || service.category.toLowerCase().includes(needle);
  });

  const handlePublish = () => {
    setPublished(true);
    window.setTimeout(() => setPublished(false), 2200);
  };

  return (
    <MerchantShell activeNav="business-catalog" onNav={onNav}>
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Top Navigation & Context Hierarchy */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="space-y-space-xs">
            <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
              <button
                type="button"
                onClick={() => onNav('overview')}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Business Hub
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <button
                type="button"
                onClick={onBackToCatalog}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Catalog
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-on-surface font-medium">Services & Categories</span>
            </nav>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Services & Categories Management
            </h1>
            <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
              Manage appointment-based services, table dining experiences, wellness treatments, and catalog display
              taxonomy across all connected points of sale.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <Icon name="create_new_folder" className="text-[20px] text-primary" />
              <span>+ Add Category</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <Icon name="add_task" className="text-[20px]" />
              <span>+ Add Service</span>
            </button>
          </div>
        </div>

        {/* Operational Metric Tiles & System Quick Glance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
          {TILES.map((tile) => (
            <div
              key={tile.label}
              className="bg-surface-canvas rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex items-center justify-between"
            >
              <div className="space-y-space-2xs">
                <p className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  {tile.label}
                </p>
                <p className={`font-heading-md text-heading-md font-bold ${tile.valueClass ?? 'text-on-surface'}`}>
                  {tile.value}{' '}
                  <span className={`font-caption text-caption font-normal ${tile.valueNoteClass}`}>{tile.valueNote}</span>
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tile.iconBox}`}>
                <Icon name={tile.icon} className="text-[22px]" />
              </div>
            </div>
          ))}
        </div>

        {/* Dual Filtration & Taxonomy Tab Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md bg-surface-canvas rounded-xl p-space-sm shadow-[0_2px_8px_-2px_rgba(13,37,76,0.03)]">
          <div className="flex items-center gap-space-2xs bg-surface-container-low p-space-2xs rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="px-space-md py-space-xs rounded-md text-text-secondary hover:text-on-surface font-label-md text-label-md transition-colors whitespace-nowrap"
            >
              Products <span className="text-text-tertiary">(28)</span>
            </button>
            <button
              type="button"
              className="px-space-md py-space-xs rounded-md bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm transition-colors whitespace-nowrap"
            >
              Services <span className="text-primary">(14 Active)</span>
            </button>
            <button
              type="button"
              className="px-space-md py-space-xs rounded-md text-text-secondary hover:text-on-surface font-label-md text-label-md transition-colors whitespace-nowrap"
            >
              Categories <span className="text-text-tertiary">(6 Taxonomies)</span>
            </button>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setPill('all')}
              className={`inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm transition-colors ${
                pill === 'all'
                  ? 'bg-surface-tint-blue text-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span>All Active</span>
              <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">
                14
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPill('booking')}
              className={`inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm transition-colors ${
                pill === 'booking'
                  ? 'bg-surface-tint-blue text-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span>Requires Booking</span>
              <span className="text-text-secondary font-medium">11</span>
            </button>
            <button
              type="button"
              onClick={() => setPill('archived')}
              className={`inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm transition-colors ${
                pill === 'archived'
                  ? 'bg-surface-tint-blue text-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span>Archived</span>
              <span className="text-text-secondary font-medium">3</span>
            </button>
            <div className="h-5 w-px bg-surface-container-high mx-space-2xs" />
            <div className="relative flex items-center">
              <Icon name="search" className="text-[18px] text-text-secondary absolute left-space-xs" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter services or SKU..."
                className="pl-8 pr-space-xs py-space-2xs rounded-lg bg-surface-container-low text-on-surface font-caption text-caption placeholder-text-tertiary focus:outline-none focus:bg-surface-canvas transition-colors w-44"
              />
            </div>
          </div>
        </div>

        {/* Primary Asymmetric Two-Column Management Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Active Services & Treatments (7 Columns) */}
          <div className="lg:col-span-7 space-y-space-md">
            <div className="flex items-center justify-between pb-space-2xs">
              <div className="flex items-center gap-space-xs">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Active Services & Treatments</h2>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface font-caption text-caption font-semibold">
                  14 Available
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-caption text-caption text-text-secondary">
                <Icon name="tune" className="text-[16px]" />
                <span>Sorted by popularity</span>
              </div>
            </div>

            {visibleServices.map((service) => (
              <div
                key={service.id}
                className="group bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] transition-all hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)] flex flex-col gap-space-md"
              >
                <div className="flex items-start justify-between gap-space-md">
                  <div className="flex gap-space-md">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm bg-surface-container-low">
                      <img
                        alt={service.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={service.image}
                      />
                      <span
                        className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-caption text-caption font-bold scale-90 origin-top-left ${service.imageTagClass}`}
                      >
                        {service.imageTag}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="px-space-xs py-space-2xs rounded bg-surface-container text-secondary font-caption text-caption font-medium">
                          {service.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 font-caption text-caption font-semibold ${
                            service.status.tone === 'active' ? 'text-badge-discount-text' : 'text-primary'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              service.status.tone === 'active' ? 'bg-badge-discount-text' : 'bg-primary'
                            }`}
                          />{' '}
                          {service.status.label}
                        </span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="font-caption text-caption text-text-secondary">{service.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="More options"
                    className="w-8 h-8 rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface flex items-center justify-center transition-colors"
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                </div>

                {/* Metric Details Pill Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs bg-surface-subtle p-space-sm rounded-lg">
                  {service.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center gap-space-xs">
                      <Icon name={metric.icon} className={`${metric.iconClass} text-[18px]`} />
                      <div className="min-w-0">
                        <p className="font-caption text-caption text-text-secondary leading-none">{metric.label}</p>
                        <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                          {metric.value}
                          {metric.suffix && (
                            <span className="font-caption text-caption font-normal text-text-secondary">
                              {' '}
                              {metric.suffix}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints & Context Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-space-xs text-caption text-caption text-text-secondary pt-space-2xs">
                  <div className="flex items-center gap-space-md flex-wrap">
                    {service.meta.map((entry) => (
                      <span
                        key={entry.text}
                        className={`inline-flex items-center gap-1 ${entry.strong ? 'font-medium text-on-surface' : ''}`}
                      >
                        <Icon name={entry.icon} className={`text-[16px] ${entry.iconClass}`} />
                        <span>{entry.text}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-space-xs ml-auto">
                    <button
                      type="button"
                      className="px-space-sm py-space-2xs rounded-lg hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1"
                    >
                      <Icon name={service.actionIcon} className="text-[16px]" />
                      <span>{service.actionLabel}</span>
                    </button>
                    <button
                      type="button"
                      className="px-space-sm py-space-2xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
                    >
                      Edit Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Taxonomy & Re-orderable Hierarchies (5 Columns) */}
          <div className="lg:col-span-5 space-y-space-md">
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] space-y-space-md">
              <div className="flex items-start justify-between gap-space-sm pb-space-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">
                      Catalogue Taxonomy & Category Ordering
                    </h2>
                    <span className="w-6 h-6 rounded-full bg-surface-tint-blue text-primary text-caption text-caption flex items-center justify-center font-bold">
                      6
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Drag handles to re-order digital menu displays on customer app and POS.
                  </p>
                </div>
                <button
                  type="button"
                  title="Manage taxonomy settings"
                  className="p-space-xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface transition-colors"
                >
                  <Icon name="tune" className="text-[20px]" />
                </button>
              </div>

              {/* Drag-and-Drop Taxonomy Interactive Stack */}
              <div className="space-y-space-xs">
                {CATEGORIES.map((category, index) => (
                  <div
                    key={category.name}
                    className="group flex items-center justify-between p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow"
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="text-text-tertiary group-hover:text-primary transition-colors flex items-center">
                        <Icon name="drag_indicator" className="text-[20px]" />
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-caption text-caption shrink-0 ${category.boxClass}`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                          {category.name}
                        </p>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
                          <span>{category.count}</span>
                          <span>•</span>
                          <span className={`font-medium ${category.kindClass}`}>{category.kind}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-2xs shrink-0">
                      <button
                        type="button"
                        className="px-space-xs py-1 rounded text-primary hover:bg-surface-tint-blue font-caption text-caption font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-space-xs py-1 rounded text-text-secondary hover:text-error hover:bg-error-container font-caption text-caption transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reorder State Commit Button Bar */}
              <div className="flex items-center justify-between pt-space-xs">
                <button
                  type="button"
                  className="text-primary font-label-sm text-label-sm hover:underline inline-flex items-center gap-1"
                >
                  <Icon name="restart_alt" className="text-[16px]" /> Reset to Default
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className={`px-space-md py-space-xs rounded-lg font-button-secondary text-button-secondary transition-colors ${
                    published
                      ? 'bg-badge-discount-bg text-badge-discount-text'
                      : 'bg-surface-container-high hover:bg-surface-container text-primary'
                  }`}
                >
                  {published ? 'Saved & Synced!' : 'Publish Sequence'}
                </button>
              </div>

              {/* Sync Advisory Card */}
              <div className="bg-surface-tint-blue rounded-xl p-space-md space-y-space-xs">
                <div className="flex items-start gap-space-xs">
                  <Icon name="cloud_sync" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">Auto-Sync Advisory</h4>
                    <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                      Need to sync POS menu order? Customer app and POS terminals mirror this ordering dynamically every
                      60 seconds.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-2xs text-caption text-caption text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    All 4 connected POS lanes operational
                  </span>
                  <button type="button" className="text-primary font-medium hover:underline">
                    Force Flush
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="bg-surface-canvas rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                <Icon name="electric_bolt" className="text-[24px]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-label-md text-label-md font-semibold text-on-surface">Did you know?</h4>
                <p className="font-caption text-caption text-text-secondary">
                  Services tagged with lead estheticians reduce appointment conflicts by 42% on peak weekend hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantShell>
  );
}
