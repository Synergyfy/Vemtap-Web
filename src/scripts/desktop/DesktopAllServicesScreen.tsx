import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { CATEGORIES, SERVICES } from './DesktopSpaStorefrontScreen';

interface DesktopAllServicesScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

export function DesktopAllServicesScreen({ onNav, onBack }: DesktopAllServicesScreenProps) {
  // Category QR links land here with ?category=<key> — open pre-filtered while the
  // category tabs stay available for easy navigation.
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['key']>(() => {
    const param = new URLSearchParams(window.location.search).get('category');
    return param && CATEGORIES.some((item) => item.key === param)
      ? (param as (typeof CATEGORIES)[number]['key'])
      : 'all';
  });
  const [query, setQuery] = useState('');

  const services = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SERVICES.filter(
      (service) =>
        (category === 'all' || service.category === category) &&
        (!needle ||
          service.title.toLowerCase().includes(needle) ||
          service.description.toLowerCase().includes(needle)),
    );
  }, [category, query]);

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface min-h-screen">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 py-8 space-y-6">
          <nav className="flex items-center gap-2 font-caption text-caption text-text-secondary">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Icon name="arrow_back" className="text-[15px]" />
              <span>Glow Serenity Spa</span>
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">All Services</span>
          </nav>

          <div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold">All Services</h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Every treatment at Glow Serenity Spa — {SERVICES.length} services priced in Nigerian Naira (₦).
            </p>
          </div>

          <div className="bg-surface-canvas p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="relative w-full">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-on-surface placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search treatments, rituals, wellness sessions..."
                type="text"
                value={query}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold whitespace-nowrap transition-all ${
                    category === item.key
                      ? 'bg-surface-tint-blue text-primary-container shadow-xs'
                      : 'text-text-secondary hover:text-on-surface bg-surface-subtle'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <span className="block px-1 font-label-sm text-label-sm text-text-secondary">
            {query.trim() || category !== 'all'
              ? `Showing ${services.length} matching services`
              : `Showing all ${services.length} services`}
          </span>

          {services.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-2 bg-surface-canvas rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
                <Icon name="search_off" className="text-[24px]" />
              </div>
              <p className="font-label-md text-label-md text-text-secondary">No services match your search</p>
              <p className="font-caption text-caption text-text-tertiary">Try another treatment or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <article
                  key={service.title}
                  className={`group bg-surface-canvas rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                    service.highlight ? 'shadow-md hover:shadow-lg ring-2 ring-primary/20' : 'shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden">
                      <div
                        aria-hidden="true"
                        className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${service.image}')` }}
                      />
                      {service.badge && (
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full font-caption text-caption font-bold ${service.badge.className}`}
                        >
                          {service.badge.label}
                        </span>
                      )}
                      <span
                        className={`absolute bottom-3 right-3 px-2 py-0.5 rounded-lg font-caption text-caption ${
                          service.highlight
                            ? 'bg-primary-container text-on-primary font-semibold'
                            : 'bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface'
                        }`}
                      >
                        {service.duration}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <div
                        className={`flex items-center gap-1.5 font-caption text-caption ${
                          service.highlight ? 'text-primary font-semibold' : 'text-text-tertiary'
                        }`}
                      >
                        <Icon name={service.meta.icon} className="text-[16px] text-primary" />
                        <span>{service.meta.label}</span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{service.description}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 mt-2 flex items-center justify-between">
                    <div>
                      {service.oldPrice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading-sm text-heading-sm text-primary font-bold">{service.price}</span>
                          <span className="font-caption text-caption line-through text-text-tertiary">{service.oldPrice}</span>
                        </div>
                      ) : (
                        <div className="font-heading-sm text-heading-sm text-text-primary">{service.price}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onNav('spa-booking')}
                      className={`px-4 py-2 rounded-xl font-label-md text-label-md shadow transition-all active:scale-95 ${
                        service.actionClassName ?? 'bg-primary-container text-on-primary hover:bg-primary'
                      }`}
                    >
                      {service.action ?? 'Book Service'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </DesktopPage>
  );
}
