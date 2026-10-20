import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';

interface BusinessLocationsScreenProps {
  onTab: (tab: BusinessTabKey) => void;
}

interface BranchMetric {
  products: string;
  services: string;
  deals: string;
}

const BRANCHES: {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  address: string;
  phone: string;
  hours: string;
  status: string;
  cluster: string;
  img: string;
  alt: string;
  imgHeight: string;
  pulse?: boolean;
  metrics: BranchMetric;
}[] = [
  {
    id: 'maitama',
    name: 'Maitama Flagship',
    badge: 'Branch #1',
    badgeClass: 'bg-primary-fixed text-on-primary-fixed',
    address: 'Plot 14 Amazon Street, Maitama Heights, Abuja, FCT, Nigeria',
    phone: '+234 803 219 8831',
    hours: 'Mon - Sun: 10:00 AM - 10:00 PM',
    status: 'Active • Open Now (Closes 10:00 PM)',
    cluster: 'Abuja Central Cluster • Maitama District',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvetH4NUomgKtLXt81URGH9_tHOQfFtzoSPl5xBlarPB7-Lj3IROzFdOuHc_jtSHV-Cjpk7tYh2QoqcrZZCy7lEx4emQQSXuFKk0lEfRJR_Zs573-Bz6Ouge76v0cxnr03aXMwsQqwCE456ZoDrqyC1dqbBi8CQrHAjZzXhE-bfvhHGXvuuey0qlCMD4Wiqd0i3SsIGeFmOg99e8UuuVxGTQMMOnWfngYxyVF_-nyF2DJpGCgefbMnig',
    alt: 'Street level view of Plot 14 Amazon Street, Maitama Heights, Abuja Nigeria with modern commercial architecture and clean urban landscaping.',
    imgHeight: 'h-32',
    pulse: true,
    metrics: { products: '38', services: '14', deals: '3' },
  },
  {
    id: 'victoria-island',
    name: 'Victoria Island Branch',
    badge: 'Branch #2',
    badgeClass: 'bg-surface-container-highest text-on-surface',
    address: 'Plot 8B Adeola Odeku St, Victoria Island, Lagos, Nigeria',
    phone: '+234 812 443 0912',
    hours: 'Tue - Sun: 11:00 AM - 11:00 PM',
    status: 'Active • Open Now',
    cluster: 'Lagos Island Cluster',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz9BySSCNneXu66vlZvJPf1g3rEWwf6VAjf7kxZgUz8EWnJ9pL-AyTtHwnUo3jDl85yr1VBrk2ZrStg3U50VJx8pKWQLuplNNGH02n6o0tiVtX520F0wW9P-XAXsyveR7Q7L3xIwAQamBQtncEzSz6g9jvo-2iH-h2KBfXwHiyyg2oZndOUplJMOZmTJNCAqxNmXQFdyglFcwZgNgpjKO1hrliZQjqkpFNPdHVcKQ-WzmDiQIA0etu3w',
    alt: 'Warm welcoming daylight interior of a modern flagship retail apothecary store in Lagos with pristine marble checkout counter, soft directional architectural lights, lush potted indoor tropical plants, and subtle blue brand accents',
    imgHeight: 'h-28',
    metrics: { products: '32', services: '8', deals: '2' },
  },
];

export function BusinessLocationsScreen({ onTab }: BusinessLocationsScreenProps) {
  const [dismissed, setDismissed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Sub-Header and Primary Add Action */}
        <section className="px-margin pt-space-xs pb-space-sm flex items-center justify-between gap-space-sm">
          <div className="min-w-0">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">
              Business Locations
            </h2>
            <p className="font-caption text-caption text-text-secondary mt-space-2xs">
              Manage branches, operating hours, and live availability
            </p>
          </div>
          <button
            className="shrink-0 h-[42px] px-space-md bg-primary-container text-on-primary font-button-secondary text-button-secondary rounded-xl flex items-center gap-space-2xs shadow-[0_4px_14px_rgba(6,108,244,0.22)] active:scale-95 transition-all"
            type="button"
            onClick={() => showToast('New branch wizard opening...')}
          >
            <Icon name="add_location_alt" className="text-[19px]" />
            <span>Add Location</span>
          </button>
        </section>

        {/* Branch Card List */}
        <section className="px-margin flex flex-col gap-space-md">
          {BRANCHES.map((branch) => (
            <article
              className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.06)] overflow-hidden"
              key={branch.id}
            >
              {/* Media Cover */}
              <div className={`relative w-full ${branch.imgHeight} bg-surface-container-low overflow-hidden`}>
                <img alt={branch.alt} className="w-full h-full object-cover" src={branch.img} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-space-xs left-space-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                    {branch.status}
                  </span>
                </div>
                <div className="absolute bottom-space-xs left-space-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-canvas/90 backdrop-blur-md text-on-surface font-caption text-caption">
                    <Icon name="distance" className="text-[13px] text-primary" />
                    {branch.cluster}
                  </span>
                </div>
              </div>
              {/* Card Content */}
              <div className="p-space-md">
                <div className="flex items-start justify-between gap-space-xs mb-space-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">{branch.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded font-caption text-caption font-semibold ${branch.badgeClass}`}>
                        {branch.badge}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 flex items-start gap-1">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                  </div>
                  <button
                    aria-label="Branch Options"
                    className="w-8 h-8 rounded-full text-text-secondary hover:bg-surface-container-low flex items-center justify-center shrink-0 transition-colors"
                    type="button"
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                </div>
                {/* Contact & Hours */}
                <div className="bg-surface-subtle rounded-lg p-space-xs my-space-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-caption text-caption">
                    <span className="text-text-secondary flex items-center gap-1">
                      <Icon name="call" className="text-[14px]" />
                      {branch.phone}
                    </span>
                    <span className="text-text-primary font-medium flex items-center gap-1">
                      <Icon name="schedule" className="text-[14px] text-primary" />
                      {branch.hours}
                    </span>
                  </div>
                </div>
                {/* Live Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 my-space-sm pt-space-xs">
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <span className="block font-heading-sm text-heading-sm text-primary font-bold">
                      {branch.metrics.products}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Products</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <span className="block font-heading-sm text-heading-sm text-secondary font-bold">
                      {branch.metrics.services}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Services</span>
                  </div>
                  <div className="bg-surface-tint-blue rounded-lg p-2 text-center">
                    <span className="block font-heading-sm text-heading-sm text-primary-container font-bold">
                      {branch.metrics.deals}
                    </span>
                    <span className="font-caption text-caption text-primary-container font-semibold">Active Deals</span>
                  </div>
                </div>
                {/* Action Row */}
                <div className="flex items-center gap-space-xs mt-space-xs">
                  <button
                    className="flex-1 h-11 bg-surface-container-low text-primary-container font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors font-semibold"
                    type="button"
                    onClick={() => showToast(`${branch.name} editor opening...`)}
                  >
                    <Icon name="edit_location" className="text-[18px]" />
                    Edit Branch Details
                  </button>
                  <button
                    className="w-11 h-11 bg-surface-container-low text-text-secondary hover:text-text-primary rounded-xl flex items-center justify-center transition-colors"
                    title="Live View on Map"
                    type="button"
                    onClick={() => showToast(`Loading ${branch.name} map pin...`)}
                  >
                    <Icon name="map" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {/* Garki Express Hub (Draft) */}
          {!dismissed && (
            <article className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-md opacity-90">
              <div className="flex items-start justify-between gap-space-xs mb-space-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Garki Express Hub</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-caption text-caption font-semibold">
                      Branch #3 • Draft
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1 flex items-start gap-1">
                    <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0 mt-0.5" />
                    <span>Area 11 Commercial Arcade, Garki, Abuja</span>
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-text-tertiary shrink-0">
                  <Icon name="store" className="text-[18px]" />
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm my-space-sm flex items-center gap-space-xs">
                <Icon name="info" className="text-tertiary-container text-[20px] shrink-0" />
                <p className="font-caption text-caption text-text-secondary">
                  Setup pending: Operating hours and merchant payout accounts need verification before this outlet can
                  accept customer tap orders.
                </p>
              </div>
              <div className="flex items-center gap-space-xs pt-space-2xs">
                <button
                  className="flex-1 h-11 bg-primary text-on-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] transition-all"
                  type="button"
                  onClick={() => showToast('Garki setup wizard opening...')}
                >
                  <Icon name="rocket_launch" className="text-[18px]" />
                  Complete Setup & Activate
                </button>
                <button
                  className="h-11 px-space-sm bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary rounded-xl hover:text-text-primary transition-colors"
                  type="button"
                  onClick={() => setDismissed(true)}
                >
                  Dismiss
                </button>
              </div>
            </article>
          )}
        </section>

        {/* Centralized Ecosystem Notice */}
        <section className="px-margin mt-space-lg mb-space-xs">
          <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
              <Icon name="hub" className="text-[18px]" />
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-text-primary font-semibold">
                Centralized Ecosystem Notice
              </h4>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                Branches share your central brand identity and customer loyalty programme while maintaining independent
                live inventories, pricing catalogs, and localized operating hours.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
