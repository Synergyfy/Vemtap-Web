import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface BusinessIntroScreenProps {
  onBack: () => void;
  onNext: () => void;
}

interface CoreTool {
  key: string;
  icon: string;
  iconBoxClass: string;
  title: string;
  badge: string;
  badgeClass: string;
  body: string;
}

const STOREFRONT_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB7VJ8JNjHJ0uS4JHqrmLKsEC0tCKPx4ED6YqbemmgcD8vUTLqn4md1wtoEZCmWb_S_gjqvHJ-Rpicyf2UtmxW9WFZNZeQvCRrNUr-je58febAvDU0YfWhvC9qnydKO5Q6gWO9mfGF3S2VS7F8FgfQ2lVj428tVpSL6sOY66VgbNAEODyqSHGZ4vIV1vXHf9vj7V7Df0jtacbhCeEX0hG1XK6joz3Dzt5zSQ86y3j51DyAtsp_DOaX74Q';
const STOREFRONT_ALT =
  'A modern trendy artisanal coffee shop and boutique bakery storefront with warm pendant lighting, clean wood counters, happy patrons seated on high barstools, crisp architectural glass, shot in high resolution with natural sunlight and vibrant urban street ambience in Apo District Abuja.';
const OWNER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAypQNsk6dBsi36LWSaNNqDgRQRvC2cFSY7427uY3wIIeDGRq_7nJiFRTR5SZvl7DXY8JZV5Z7hG9PjVoPxkqROuoPK1MovTomS60L9pgPPBhQIi5yMw7XmtY9eIyKBz-sm5JzEf4t-C5wcEmv0hjxfro-xt7xR1XFVcYtqitLk3538EpJmaAbPjDNsNFE3xe_mnMP6Q7twls8ClCBQ20kkZesYAIEnrQMxyyh6IJgDansPWEdsJHoJjw';
const OWNER_ALT =
  'Portrait of a smiling smiling boutique shop owner standing proudly inside her vibrant urban lifestyle store, arms crossed, welcoming natural light, professional ambiance.';

const CORE_TOOLS: CoreTool[] = [
  {
    key: 'discover',
    icon: 'near_me',
    iconBoxClass: 'bg-surface-tint-blue text-primary-container',
    title: 'Get Discovered Locally',
    badge: 'Priority Feed',
    badgeClass: 'text-primary',
    body: 'Reach verified shoppers within walking distance actively browsing real-time district deals.',
  },
  {
    key: 'deals',
    icon: 'flash_on',
    iconBoxClass: 'bg-tertiary-fixed text-tertiary',
    title: 'Deals & Flash Drops',
    badge: 'Demand Boost',
    badgeClass: 'text-tertiary',
    body: 'Launch instant, time-boxed vouchers to instantly ignite footfall during off-peak hours.',
  },
  {
    key: 'zero-commission',
    icon: 'payments',
    iconBoxClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Zero Commission Sales',
    badge: '0% Take Rate',
    badgeClass: 'text-badge-discount-text',
    body: 'Direct consumer settlement. VEMTAP never taxes your in-store register sales or service appointments.',
  },
  {
    key: 'qr-passes',
    icon: 'qr_code_scanner',
    iconBoxClass: 'bg-surface-container text-on-surface',
    title: 'Instant QR & Tap Passes',
    badge: '1-Sec Check-in',
    badgeClass: 'text-text-secondary',
    body: 'Tamper-proof digital vouchers validated with a fast smartphone camera scan or NFC tap.',
  },
  {
    key: 'showcase',
    icon: 'restaurant_menu',
    iconBoxClass: 'bg-surface-tint-blue text-primary-container',
    title: 'Showcase Menu & Services',
    badge: 'Visual Catalog',
    badgeClass: 'text-primary',
    body: 'Highlight signature dishes, treatment menus, and store collections with direct booking inquiry.',
  },
  {
    key: 'chat',
    icon: 'chat',
    iconBoxClass: 'bg-secondary-container text-on-secondary-container',
    title: 'Direct In-App Chat',
    badge: 'Real-Time',
    badgeClass: 'text-secondary',
    body: 'Chat directly with customers, confirm reservation times, and curate bespoke custom orders.',
  },
  {
    key: 'retention',
    icon: 'loyalty',
    iconBoxClass: 'bg-tertiary-fixed text-tertiary',
    title: 'Smart Retention & Perks',
    badge: 'Auto-Loyalty',
    badgeClass: 'text-tertiary',
    body: 'Turn one-time walk-ins into repeat regulars with automated digital punch-cards and loyalty tiers.',
  },
  {
    key: 'insights',
    icon: 'insights',
    iconBoxClass: 'bg-surface-tint-blue text-primary-container',
    title: 'Live Business Insights',
    badge: 'Analytics',
    badgeClass: 'text-primary',
    body: 'Monitor district impressions, voucher conversions, and peak walk-in hours in a unified cockpit.',
  },
];

export function BusinessIntroScreen({ onBack, onNext }: BusinessIntroScreenProps) {
  const [radius, setRadius] = useState(1500);
  const [toolsOpen, setToolsOpen] = useState(true);

  const radiusLabel = `${(radius / 1000).toFixed(1)} km radius`;
  const reachCount = Math.round((radius / 1000) * (radius / 1000) * 1280).toLocaleString('en-US');

  return (
    <AppScreen>
      <ScreenHeader title="Business Profile" onBack={onBack} />
      <div className="flex flex-col w-full">
        <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-xs">
          <h2 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">
            Turn Nearby Foot Traffic into Lifetime Customers
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            VEMTAP gives your physical store or service business the digital superpower to attract, engage, and retain
            shoppers within your immediate district.
          </p>
        </div>

        <div className="px-margin py-space-xs">
          <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest shadow-md">
            <div className="relative w-full h-48 bg-surface-dim">
              <img alt={STOREFRONT_ALT} className="w-full h-full object-cover" src={STOREFRONT_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/30 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md font-label-sm text-label-sm text-text-primary">
                  <Icon name="location_on" className="text-primary text-[16px]" />
                  Apo District • Abuja
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm">
                  <Icon name="verified" className="text-[14px]" filled />
                  Zero Commission
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                <div>
                  <p className="font-caption text-caption opacity-80 uppercase tracking-wider">Nearby Footfall</p>
                  <p className="font-heading-sm text-heading-sm font-bold flex items-center gap-1.5">
                    1,420 Active Shoppers
                    <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-caption text-caption opacity-80 uppercase tracking-wider">Avg. Return</p>
                  <p className="font-heading-sm text-heading-sm font-bold text-inverse-primary">+34% / Mo</p>
                </div>
              </div>
            </div>
            <div className="p-space-sm bg-surface-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container">
                  <Icon name="cell_tower" className="text-[18px]" />
                </div>
                <div>
                  <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Direct Consumer Settlement
                  </p>
                  <p className="font-caption text-caption text-text-secondary">Keep 100% of your counter revenue</p>
                </div>
              </div>
              <Icon name="chevron_right" className="text-text-tertiary text-[20px]" />
            </div>
          </div>
        </div>

        <div className="px-margin py-space-sm">
          <div className="p-space-md rounded-2xl bg-surface-container-low shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1.5">
                <Icon name="radar" className="text-primary text-[18px]" />
                Estimated Walking Audience
              </span>
              <span className="font-label-sm text-label-sm font-bold text-primary-container bg-surface-canvas px-2 py-0.5 rounded-full">
                {radiusLabel}
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Adjust range to preview potential foot traffic around your storefront location:
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="font-caption text-caption text-text-tertiary">0.5km</span>
              <input
                aria-label="Estimated Walking Audience radius"
                className="w-full accent-primary-container cursor-pointer h-2 bg-surface-container-highest rounded-lg appearance-none"
                max="3500"
                min="500"
                step="250"
                type="range"
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
              />
              <span className="font-caption text-caption text-text-tertiary">3.5km</span>
            </div>
            <div className="mt-1 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="group_add" className="text-badge-discount-text text-[18px]" />
                <span className="font-body-md text-body-md font-semibold text-text-primary">
                  <span className="text-primary-container font-heading-sm">{reachCount}</span> local users ready to tap
                </span>
              </div>
              <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded-full">
                High Density
              </span>
            </div>
          </div>
        </div>

        <div className="px-margin pt-space-md pb-space-xs flex items-center justify-between">
          <div>
            <h3 className="font-heading-sm text-heading-sm text-text-primary">What VEMTAP Does for You</h3>
            <p className="font-caption text-caption text-text-secondary">
              Everything needed to dominate local retail &amp; service footfall
            </p>
          </div>
          <button
            aria-label="Toggle tools list"
            className="inline-flex items-center gap-1 font-caption text-caption font-semibold px-2.5 py-1 rounded-full bg-surface-container text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            type="button"
            onClick={() => setToolsOpen((open) => !open)}
          >
            <span>8 Core Tools</span>
            <Icon
              className={`text-[18px] transition-transform duration-200 ${toolsOpen ? '' : 'rotate-180'}`}
              name="expand_more"
            />
          </button>
        </div>

        {toolsOpen && (
          <div className="px-margin py-space-xs grid grid-cols-1 gap-space-sm">
            {CORE_TOOLS.map((tool) => (
              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm" key={tool.key}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tool.iconBoxClass}`}>
                  <Icon className="text-[24px]" name={tool.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-space-xs">
                    <h4 className="font-heading-sm text-heading-sm text-text-primary truncate min-w-0">{tool.title}</h4>
                    <span className={`font-caption text-caption font-semibold shrink-0 whitespace-nowrap ${tool.badgeClass}`}>{tool.badge}</span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-1">{tool.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-margin py-space-sm">
          <div className="p-space-md rounded-2xl bg-surface-container flex items-center gap-space-sm">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-dim">
              <img alt={OWNER_ALT} className="w-full h-full object-cover" src={OWNER_IMG} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface italic line-clamp-2">
                "Within 10 days of listing in Apo, we recorded over 120 voucher redemptions from nearby residents."
              </p>
              <p className="font-caption text-caption text-text-secondary mt-0.5 font-medium">
                Amara K. • Founder, Bloom Wellness &amp; Cafe
              </p>
            </div>
          </div>
        </div>

        <div className="h-32 w-full" />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(17,24,39,0.06)] px-margin pt-space-sm pb-safe flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2 text-text-secondary">
          <span className="font-caption text-caption flex items-center gap-1 font-medium">
            <Icon className="text-[14px] text-badge-discount-text" name="check_circle" />
            Free to join
          </span>
          <span className="text-text-tertiary">•</span>
          <span className="font-caption text-caption flex items-center gap-1 font-medium">
            <Icon className="text-[14px] text-badge-discount-text" name="check_circle" />
            No setup fees
          </span>
          <span className="text-text-tertiary">•</span>
          <span className="font-caption text-caption flex items-center gap-1 font-medium">
            <Icon className="text-[14px] text-primary" name="verified_user" />
            Verified merchants
          </span>
        </div>
        <button
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-transform"
          type="button"
          onClick={onNext}
        >
          <span>Set Up My Business</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <button
          className="w-full h-9 flex items-center justify-center gap-1 text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary transition-colors"
          type="button"
          onClick={onBack}
        >
          <span>Learn How VEMTAP Works</span>
          <Icon name="open_in_new" className="text-[18px]" />
        </button>
      </div>
    </AppScreen>
  );
}
