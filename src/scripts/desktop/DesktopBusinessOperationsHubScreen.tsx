import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessOperationsHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onPreviewStorefront?: () => void;
  onEditProfile?: () => void;
  onOpenLoyalty?: () => void;
  onOpenStaff?: () => void;
}

interface ModuleCard {
  key: string;
  icon: string;
  iconTone: string;
  badge: string;
  badgeTone: string;
  title: string;
  description: string;
  cta: string;
  onCta: () => void;
  teaser?: React.ReactNode;
}

export function DesktopBusinessOperationsHubScreen({
  onNav,
  onPreviewStorefront,
  onEditProfile,
  onOpenLoyalty,
  onOpenStaff,
}: DesktopBusinessOperationsHubScreenProps) {
  const [signal, setSignal] = useState<'idle' | 'pinging' | 'strong'>('idle');
  const [secondsAgo, setSecondsAgo] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsAgo((s) => (s > 45 ? 2 : s + 1));
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const testSignal = () => {
    if (signal !== 'idle') return;
    setSignal('pinging');
    window.setTimeout(() => {
      setSignal('strong');
      window.setTimeout(() => setSignal('idle'), 2400);
    }, 600);
  };

  const modules: ModuleCard[] = [
    {
      key: 'locations',
      icon: 'apartment',
      iconTone: 'bg-surface-tint-blue text-primary',
      badge: 'Branch #3 in Setup',
      badgeTone: 'bg-surface-container text-primary',
      title: 'Locations & Branches',
      description: '2 Active Locations • Maitama Flagship & Victoria Island',
      cta: 'Manage Branches, Hours & Geofence',
      onCta: () => onNav('locations'),
      teaser: (
        <div className="bg-surface-subtle p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="location_on" className="text-primary text-[18px]" />
            <div className="font-label-sm text-caption">
              <p className="font-semibold text-text-primary">Maitama: Open • 4 Tills</p>
              <p className="text-text-tertiary">VI: Open • 3 Tills</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="9" />
            <circle className="opacity-40" cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" fill="currentColor" r="2" />
          </svg>
        </div>
      ),
    },
    {
      key: 'catalog',
      icon: 'restaurant_menu',
      iconTone: 'bg-surface-container text-primary',
      badge: '52 Total Active SKUs',
      badgeTone: 'bg-badge-discount-bg text-badge-discount-text',
      title: 'Products & Services',
      description: '38 Items • 14 Services • 6 Categories',
      cta: 'Catalogue & Pricing Setup',
      onCta: () => onNav('catalog'),
      teaser: (
        <div className="bg-surface-subtle p-3 rounded-lg space-y-1.5">
          <div className="flex justify-between font-label-sm text-caption">
            <span className="text-text-secondary">Stock Inventory Velocity</span>
            <span className="font-semibold text-text-primary">94% Healthy</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '94%' }} />
          </div>
        </div>
      ),
    },
    {
      key: 'deals',
      icon: 'local_fire_department',
      iconTone: 'bg-tertiary-fixed text-tertiary',
      badge: '71% Avg Conversion',
      badgeTone: 'bg-badge-discount-bg text-badge-discount-text',
      title: 'Deals & Promotions',
      description: '3 Active Deals • 1 Scheduled Weekend Flash',
      cta: 'Manage Flash Offers & Quotas',
      onCta: () => onNav('deals'),
      teaser: (
        <div className="bg-surface-subtle p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md font-semibold text-text-primary">Artisan Ribeye + Wine Flight</p>
            <p className="font-caption text-caption text-tertiary font-medium">20% Off Tap Special • 42 Claimed</p>
          </div>
          <Icon name="percent" className="text-text-tertiary text-[20px]" />
        </div>
      ),
    },
    {
      key: 'customers',
      icon: 'groups',
      iconTone: 'bg-surface-tint-blue text-primary',
      badge: '76 Frequent VIPs',
      badgeTone: 'bg-surface-container text-primary',
      title: 'Customer CRM',
      description: '482 Total Patrons • 38 New this week',
      cta: 'Patron Profiles & Direct Chat',
      onCta: () => onNav('customers'),
      teaser: (
        <div className="bg-surface-subtle p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="font-caption text-caption text-text-secondary">7-Day Retention Trend</span>
            <p className="font-label-md text-label-md font-bold text-text-primary">+18.4% vs last mo</p>
          </div>
          <svg className="w-20 h-7 text-primary" fill="none" viewBox="0 0 80 28">
            <path d="M2 22 L16 18 L32 20 L48 9 L62 12 L78 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
            <path className="opacity-10" d="M2 22 L16 18 L32 20 L48 9 L62 12 L78 3 V28 H2 Z" fill="currentColor" />
          </svg>
        </div>
      ),
    },
    {
      key: 'loyalty',
      icon: 'loyalty',
      iconTone: 'bg-badge-discount-bg text-badge-discount-text',
      badge: '₦1.2M Redeemed',
      badgeTone: 'bg-badge-discount-bg text-badge-discount-text',
      title: 'Loyalty Programme',
      description: 'VEMTAP Bites Club • Tiered & Active',
      cta: 'Points Rules & Tier Perks',
      onCta: () => onOpenLoyalty?.(),
      teaser: (
        <div className="bg-surface-subtle p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md font-semibold text-text-primary">Rate: ₦10 / Point</p>
            <p className="font-caption text-caption text-text-secondary">Auto-issued on NFC tap checkout</p>
          </div>
          <Icon name="stars" className="text-badge-discount-text text-[20px]" filled />
        </div>
      ),
    },
    {
      key: 'staff',
      icon: 'badge',
      iconTone: 'bg-surface-container text-primary',
      badge: 'All Shifts Covered',
      badgeTone: 'bg-badge-discount-bg text-badge-discount-text',
      title: 'Staff & Access',
      description: '6 Team Members • 3 Roles (Owner, Mgr, Cashier)',
      cta: 'PIN Codes & Role Assignments',
      onCta: () => onOpenStaff?.(),
      teaser: (
        <div className="bg-surface-subtle p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center -space-x-2 overflow-hidden">
            <div className="inline-block h-7 w-7 rounded-full bg-primary-container text-on-primary text-[11px] font-bold flex items-center justify-center ring-2 ring-surface-canvas">DA</div>
            <div className="inline-block h-7 w-7 rounded-full bg-secondary text-on-secondary text-[11px] font-bold flex items-center justify-center ring-2 ring-surface-canvas">TM</div>
            <div className="inline-block h-7 w-7 rounded-full bg-tertiary-container text-on-tertiary text-[11px] font-bold flex items-center justify-center ring-2 ring-surface-canvas">KA</div>
            <div className="inline-block h-7 w-7 rounded-full bg-surface-container-highest text-text-secondary text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-canvas">+3</div>
          </div>
          <span className="font-caption text-caption text-text-secondary font-medium">Active till logs: 100%</span>
        </div>
      ),
    },
  ];

  return (
    <BusinessPortalChrome activeNav="overview" onNav={onNav}>
      <div className="w-full py-space-lg space-y-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-canvas p-space-md sm:p-space-lg rounded-xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-caption font-semibold tracking-wide uppercase">Multi-Branch Central</span>
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption text-text-secondary">Live Synced Hub</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Business Operations Hub</h1>
            <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
              Central management console for branches, digital catalog, active deals, customer CRM, and staff access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
            <button type="button" className="flex items-center gap-space-xs px-3.5 py-2.5 rounded-lg bg-surface-subtle hover:bg-surface-container transition-colors text-text-primary font-label-md text-label-md shadow-sm">
              <Icon name="storefront" className="text-primary text-[20px]" />
              <span className="font-semibold text-text-primary">All Locations (2 Branches)</span>
              <Icon name="expand_more" className="text-text-tertiary text-[18px]" />
            </button>
            <button
              type="button"
              onClick={onPreviewStorefront}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors font-button-secondary text-button-secondary"
            >
              <span>Preview Live Storefront</span>
              <Icon name="open_in_new" className="text-[17px]" />
            </button>
            <button
              type="button"
              onClick={onEditProfile}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary transition-all shadow-[0_4px_14px_rgba(6,108,244,0.28)] hover:shadow-[0_6px_20px_rgba(6,108,244,0.36)] active:scale-95 font-button-primary text-button-primary"
            >
              <Icon name="tune" className="text-[19px]" />
              <span>Edit Business Profile</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-surface-canvas shadow-sm">
          <div
            className="relative w-full h-56 sm:h-64 lg:h-72 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEBmIk-_3gyqrqAKZ6-YvqhUZBuMBm_ndCL6_0EPKUiFkqtNa1J0WNXsu1_B1wfZ9TdT5RY7SmAkIJbHOsQOXnN_Gb9m8MJnegQin98pMd1tv4Eg4qEHZ561LcDuFripg7uNRydwHM3xEOLoRXHftFyIqmg2XAoeggpMyfL7Ne9hqpqp0gWZl4Jw89UF2WTtDwr7DPLgZuU5QGf7cV9NcB61CaYCDyoG_mSRC_laCeBMP9DxYR1yA-vA')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas via-on-surface/40 to-transparent" />
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold shadow-sm">
                <Icon name="verified" className="text-[16px]" filled />
                Verified Merchant
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-label-sm text-caption font-medium">
                <Icon name="star" className="text-[15px] text-tertiary" filled />
                <span className="font-bold text-text-primary">4.9</span>
                <span className="text-text-secondary">(128 reviews)</span>
              </span>
            </div>
          </div>
          <div className="px-space-md sm:px-space-lg lg:px-space-xl pb-space-lg -mt-16 sm:-mt-20 relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-space-md sm:gap-space-lg">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-canvas p-1 shadow-md flex-shrink-0">
                <div
                  className="w-full h-full rounded-xl overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjyqBfPyJGf2624cFtWAerjcttNG4CgNBcDUg_Hb_MjSAb_vKJuQWlz95IBFbo1Smhab5klR4_fMJVNFv-0sBn5x4jJG47rC_JQZ7FLInxuo73Pn-fv2AATQKN6QQaQXS2RKxA1xdivgY1ZzzK8PF-od8FYL7DSNiAGGZKlOhkCL8EexBmnOz7BB3LxJ0Mw0plhtLiZRHIlzQc34_NqMUT04CNRjJu4jHOrLRsgOunXfha4YTjRx3zMA')",
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold">Urban Grill &amp; Bistro</h2>
                  <Icon name="check_circle" className="text-primary text-[22px]" filled />
                </div>
                <p className="font-label-md text-label-md text-text-secondary">Casual Dining &amp; Artisan Grill • Flagship Abuja &amp; Lagos Islands</p>
                <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 pt-1 font-caption text-caption text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Icon name="call" className="text-[15px] text-primary" />
                    +234 803 900 2210
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="link" className="text-[15px] text-primary" />
                    <span className="text-primary font-semibold hover:underline cursor-pointer">urbangrill.vem.store</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="fiber_manual_record" className="text-[15px] text-badge-discount-text" filled />
                    Open until 11:30 PM WAT
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-tint-blue/80 rounded-xl p-3.5 sm:p-4 max-w-md w-full flex items-center justify-between gap-space-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon name="contactless" className="text-[22px]" filled />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Tap Reader Sync</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary line-clamp-1">Both units online via mesh gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={testSignal}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-caption font-semibold shadow-sm transition-colors flex-shrink-0 ${
                  signal === 'strong' ? 'bg-surface-tint-blue text-primary' : 'bg-surface-canvas hover:bg-surface text-primary'
                }`}
              >
                {signal === 'pinging' ? 'Pinging...' : signal === 'strong' ? '24ms (Strong)' : 'Test Signal'}
              </button>
            </div>
          </div>
          <div className="bg-surface-subtle px-space-md sm:px-space-lg lg:px-space-xl py-space-sm flex flex-wrap items-center gap-2">
            <span className="font-caption text-caption text-text-tertiary font-semibold uppercase tracking-wider mr-1">Store Amenities</span>
            {[
              { icon: 'deck', label: 'Outdoor Seating' },
              { icon: 'wifi', label: 'Free Wi-Fi 6' },
              { icon: 'local_parking', label: 'Valet Parking' },
              { icon: 'shopping_bag', label: 'Curbside Pickup' },
              { icon: 'point_of_sale', label: 'POS Counter Tap' },
            ].map((a) => (
              <span key={a.label} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-canvas text-text-secondary font-label-sm text-caption shadow-sm">
                <Icon name={a.icon} className="text-[14px] text-primary" />
                {a.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md sm:gap-space-lg">
          {modules.map((m) => (
            <div key={m.key} className="bg-surface-canvas rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="space-y-space-md">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${m.iconTone}`}>
                    <Icon name={m.icon} className="text-[26px]" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-label-sm text-caption font-semibold ${m.badgeTone}`}>{m.badge}</span>
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">{m.title}</h3>
                  <p className="font-body-md text-body-md text-text-secondary mt-1">{m.description}</p>
                </div>
                {m.teaser}
              </div>
              <div className="pt-space-md mt-space-sm flex items-center justify-between">
                <button
                  type="button"
                  onClick={m.onCta}
                  className="font-label-md text-label-md font-semibold text-primary group-hover:text-surface-tint flex items-center gap-1 transition-colors"
                >
                  <span>{m.cta}</span>
                  <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md bg-surface-canvas rounded-xl p-space-md sm:p-space-lg shadow-sm">
          <div className="flex items-center gap-space-md">
            <div className="w-11 h-11 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
              <Icon name="receipt_long" className="text-[24px]" />
            </div>
            <div>
              <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">Today&apos;s Tap Volume</p>
              <div className="flex items-baseline gap-2">
                <span className="font-heading-md text-heading-md font-bold text-text-primary">₦842,500</span>
                <span className="font-caption text-caption font-semibold text-badge-discount-text">↑ 14.2%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-md md:border-l md:border-border-subtle md:pl-space-md">
            <div className="w-11 h-11 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
              <Icon name="speed" className="text-[24px]" />
            </div>
            <div>
              <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">Average Ticket Time</p>
              <div className="flex items-baseline gap-2">
                <span className="font-heading-md text-heading-md font-bold text-text-primary">11m 40s</span>
                <span className="font-caption text-caption font-semibold text-badge-discount-text">Optimal pace</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-md md:border-l md:border-border-subtle md:pl-space-md">
            <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center">
              <Icon name="hub" className="text-[24px]" />
            </div>
            <div>
              <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">Mesh Gateway Network</p>
              <div className="flex items-baseline gap-2">
                <span className="font-heading-md text-heading-md font-bold text-text-primary">99.98%</span>
                <span className="font-caption text-caption font-medium text-text-secondary">Uptime (30d)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-surface-canvas rounded-xl px-space-md sm:px-space-lg py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-xs shadow-sm text-text-secondary">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-label-sm text-caption font-semibold text-text-primary">NDPR Compliant</span>
            </div>
            <span className="text-border-subtle hidden sm:inline">•</span>
            <span className="font-caption text-caption">Instant branch ledger reconciliation active</span>
            <span className="text-border-subtle hidden sm:inline">•</span>
            <span className="font-caption text-caption text-text-tertiary">Real-time bi-directional webhook relay</span>
          </div>
          <div className="flex items-center gap-2 font-caption text-caption font-medium">
            <Icon name="sync" className="text-[15px] text-primary" />
            <span>Last sync {secondsAgo}s ago</span>
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}
