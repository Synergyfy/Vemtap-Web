import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';

interface DesktopBusinessIntroScreenProps {
  onStart: () => void;
  onExit: () => void;
}

const STOREFRONT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3rgNlR5OKDm9MZjSWBFjBHVpxjnjLJZqTQY1XT6fnoecKDLImdXL0TEJQCp5XiRXb1P2hQNBTEFVkWbtBh9VyQbjJ5TDbQiFvJkA6E_7Q1T63nXemgT7g1CgM0NS-q41rsTk-vTUkg5RErLZbGRh3M0ZEtjCvTBru0StEx0i8LVnVi_0KTmBDdd7Ae1ovF3V1_FpRv7t5iXvw4n3_kvB_18tok4E0Of1hbjgBLm78';

const AMARA_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBUKLcImE3zkvZVmfA4gE7EoNs8DsciE3r_keiOmF3HrFREYpnwRgwJLe4pooa2cc2t0Vyrqi392Ei2K32LK3zs9ACz_ozCPMayBpXrsfEvZYUJOoGvKSt6W3fSfMt8tkkEiQS688P-vrLbzDlG1vENxZWPPLrYfC-Twqi0beCh34ZPnyd1iKdnDGZMuoDgBvETT6hYh7_hAUCfsa22iniqQRiIVM4gNv1B3Y3mDbWy';

interface Superpower {
  icon: string;
  iconClass: string;
  title: string;
  badge: string;
  badgeClass: string;
  body: string;
  footer: string;
}

const SUPERPOWERS: Superpower[] = [
  {
    icon: 'explore',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Get Discovered Locally',
    badge: 'Priority Feed',
    badgeClass: 'bg-surface-container-high text-primary',
    body: 'Place your storefront at the top of feeds when shoppers are within 3 kilometers of your street.',
    footer: 'Radius Targeting',
  },
  {
    icon: 'bolt',
    iconClass: 'bg-tertiary-fixed text-tertiary-container',
    title: 'Deals & Flash Drops',
    badge: 'Demand Boost',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    body: 'Fill slow weekday afternoons with geo-fenced flash discounts dispatched to active nearby phones.',
    footer: 'Instant Broadcasts',
  },
  {
    icon: 'price_check',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Counter Sales',
    badge: '0% Take Rate',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    body: 'Direct peer settlements straight to your registered local bank account without platform deductions.',
    footer: 'Same-Day Payout',
  },
  {
    icon: 'qr_code_scanner',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Instant QR & Tap Pass',
    badge: '1-Sec Check-in',
    badgeClass: 'bg-surface-container-high text-primary',
    body: 'One tap contactless desk tags capture visitor profiles instantly without requiring app installations.',
    footer: 'NFC & Dynamic QR',
  },
  {
    icon: 'restaurant_menu',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Menu & Catalog',
    badge: 'Visual Catalog',
    badgeClass: 'bg-surface-container-high text-primary',
    body: 'Present rich photo menus, inventory availability, and pricing updated in real-time right from your phone.',
    footer: 'Live Sync',
  },
  {
    icon: 'chat_bubble',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Direct In-App Chat',
    badge: 'Customer Dialogue',
    badgeClass: 'bg-surface-container-high text-primary',
    body: 'Answer customer inquiries, reserve tables, and confirm product sizes through zero-latency verified messaging.',
    footer: 'Encrypted Chat',
  },
  {
    icon: 'loyalty',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Smart Retention',
    badge: 'Auto-Loyalty',
    badgeClass: 'bg-surface-container-high text-primary',
    body: 'Automated stamp cards and reward points delivered to customer digital wallets to ensure frequent returns.',
    footer: 'Automated Rewards',
  },
  {
    icon: 'insights',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Live Business Insights',
    badge: 'Analytics Cockpit',
    badgeClass: 'bg-surface-container-high text-primary',
    body: 'Identify district peak foot hours, competitor benchmarking, and repeat frequency in crisp analytics cards.',
    footer: 'Live Cockpit',
  },
];

export function DesktopBusinessIntroScreen({ onStart, onExit }: DesktopBusinessIntroScreenProps) {
  const [radius, setRadius] = useState(1.5);
  const [radiusDisplay, setRadiusDisplay] = useState('1.5 km Radius');
  const [sliderValue, setSliderValue] = useState('1.5 km');
  const [shoppers, setShoppers] = useState('1,420');
  const [users, setUsers] = useState('2,850');
  const [densityTag, setDensityTag] = useState('High Density Zone');
  const [selectedPowers, setSelectedPowers] = useState<number[]>([]);

  const handleSlider = (raw: string) => {
    const value = parseFloat(raw);
    setRadius(value);
    setRadiusDisplay(`${value.toFixed(1)} km Radius`);
    setSliderValue(`${value.toFixed(1)} km`);
    setShoppers(Math.round(value * 946).toLocaleString());
    setUsers(Math.round(value * 1900).toLocaleString());
    if (value < 1.0) {
      setDensityTag('Hyper-Local Walking Zone');
    } else if (value <= 2.5) {
      setDensityTag('High Density Zone');
    } else {
      setDensityTag('Metro District Hub');
    }
  };

  const togglePower = (index: number) => {
    setSelectedPowers((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index],
    );
  };

  const scrollToHowItWorks = () => {
    const target = document.getElementById('how-it-works');
    if (target) target.scrollIntoView();
  };

  return (
    <BusinessSetupChrome activeNav="profile" onBrand={onExit}>
      <section className="relative w-full overflow-hidden bg-surface py-space-xl lg:py-space-3xl">
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] rounded-full bg-surface-container/60 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-6 flex flex-col gap-space-lg">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm w-fit shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>VEMTAP FOR BUSINESS • RETAIL &amp; HOSPITALITY</span>
              </div>
              <div className="space-y-space-sm">
                <h1 className="font-display-hero text-display-hero text-on-surface font-bold tracking-tight">
                  Turn Nearby Foot Traffic into{' '}
                  <span className="text-primary underline decoration-border-active decoration-4 underline-offset-8">
                    Lifetime Customers
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
                  VEMTAP gives your physical store or service business the digital superpower to attract, engage, and
                  retain shoppers within your immediate district.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <button
                  type="button"
                  onClick={onStart}
                  className="h-[52px] px-space-xl rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] hover:shadow-lg active:scale-[0.98]"
                >
                  <span>Set Up My Business</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="h-[52px] px-space-md rounded-xl text-text-primary hover:text-primary font-button-secondary text-button-secondary flex items-center gap-space-2xs transition-colors"
                >
                  <span>Learn How VEMTAP Works</span>
                  <Icon name="north_east" className="text-[18px]" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-y-space-xs gap-x-space-md pt-space-2xs text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-space-2xs">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Free to join
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="flex items-center gap-space-2xs">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  No setup fees
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="flex items-center gap-space-2xs">
                  <Icon name="verified" className="text-badge-discount-text text-[16px]" />
                  Verified merchants
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="flex items-center gap-space-2xs">
                  <Icon name="security" className="text-primary text-[16px]" />
                  NDPR Compliant
                </span>
              </div>
              <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm space-y-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-caption uppercase tracking-wider text-text-tertiary">
                      Interactive Walking Audience Simulator
                    </p>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                      Immediate Catchment Area
                    </h3>
                  </div>
                  <div className="px-space-sm py-space-2xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold flex items-center gap-space-2xs">
                    <Icon name="radar" className="text-[16px]" />
                    <span id="radius-display">{radiusDisplay}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-label-sm font-label-sm text-text-secondary mb-2">
                    <span>Catchment Radius</span>
                    <span className="font-semibold text-text-primary" id="slider-val">
                      {sliderValue}
                    </span>
                  </div>
                  <input
                    id="radius-slider"
                    type="range"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={radius}
                    onChange={(event) => handleSlider(event.target.value)}
                    className="w-full accent-primary-container cursor-pointer h-2 bg-surface-container rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-caption font-caption text-text-tertiary mt-1">
                    <span>0.5 km (Walking 6 min)</span>
                    <span>2.5 km (Core Hub)</span>
                    <span>5.0 km (Metro District)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-md pt-space-xs">
                  <div className="bg-surface-subtle p-space-md rounded-lg">
                    <span className="font-caption text-caption text-text-secondary">Foot Traffic Ready</span>
                    <div className="flex items-baseline gap-space-2xs mt-1">
                      <span className="font-display-hero text-heading-lg text-primary font-bold" id="shoppers-stat">
                        {shoppers}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">Active Shoppers</span>
                    </div>
                    <p className="font-caption text-caption text-badge-discount-text mt-1 flex items-center gap-1">
                      <Icon name="trending_up" className="text-[14px]" />
                      +18% from last weekend
                    </p>
                  </div>
                  <div className="bg-surface-subtle p-space-md rounded-lg">
                    <span className="font-caption text-caption text-text-secondary">Consumer Density</span>
                    <div className="flex items-baseline gap-space-2xs mt-1">
                      <span className="font-display-hero text-heading-lg text-text-primary font-bold" id="users-stat">
                        {users}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">Local Users</span>
                    </div>
                    <div className="mt-1 flex items-center gap-space-2xs">
                      <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text" />
                      <span className="font-label-sm text-caption text-badge-discount-text font-semibold" id="density-tag">
                        {densityTag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 flex flex-col gap-space-lg">
              <div className="bg-surface-canvas rounded-xl shadow-md overflow-hidden relative group">
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt="A modern stylish boutique coffee and wellness retail store interior in Apo District Abuja, warm ambient wooden textures, natural plants, bright daylight from tall windows, high quality lifestyle photography, inviting premium atmosphere"
                    src={STOREFRONT_IMAGE}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/30 to-transparent" />
                  <div className="absolute top-space-md left-space-md flex gap-space-xs">
                    <span className="px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-semibold flex items-center gap-1 shadow-sm">
                      <Icon name="local_offer" className="text-[14px]" /> 0% Take Rate
                    </span>
                    <span className="px-space-sm py-space-2xs rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-label-sm text-caption font-medium shadow-sm">
                      Direct Consumer Settlement
                    </span>
                  </div>
                  <div className="absolute bottom-space-md left-space-md right-space-md flex items-end justify-between">
                    <div>
                      <span className="px-space-xs py-space-2xs rounded bg-primary text-on-primary font-caption text-caption uppercase tracking-wider font-semibold">
                        Verified Merchant
                      </span>
                      <h3 className="text-on-primary font-heading-md text-heading-md font-bold mt-1">
                        Bloom Wellness &amp; Cafe
                      </h3>
                      <div className="flex items-center gap-space-2xs text-surface-container-low font-caption text-caption mt-0.5">
                        <Icon name="location_on" className="text-[16px] text-badge-discount-text" />
                        <span>Plot 42, Apo District, Gudu Corridor, Abuja</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-canvas flex items-center justify-center text-primary shadow-lg">
                      <Icon name="contactless" className="text-[24px]" />
                    </div>
                  </div>
                </div>
                <div className="p-space-lg space-y-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-subtle p-space-sm rounded-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-bold">
                        <Icon name="payments" className="text-[22px]" />
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-primary font-semibold">
                          Zero Commission Counter Sales
                        </p>
                        <p className="font-caption text-caption text-text-secondary">
                          Keep 100% of walk-in spend through VEMTAP QR
                        </p>
                      </div>
                    </div>
                    <span className="px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                      Active in Apo
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-space-sm text-center">
                    <div className="p-space-xs rounded bg-surface-container-low">
                      <p className="font-caption text-caption text-text-secondary">Customer Return Rate</p>
                      <p className="font-heading-sm text-heading-sm text-text-primary font-bold">68.4%</p>
                    </div>
                    <div className="p-space-xs rounded bg-surface-container-low">
                      <p className="font-caption text-caption text-text-secondary">Avg Check-In Time</p>
                      <p className="font-heading-sm text-heading-sm text-text-primary font-bold">1.2 sec</p>
                    </div>
                    <div className="p-space-xs rounded bg-surface-container-low">
                      <p className="font-caption text-caption text-text-secondary">District Rank</p>
                      <p className="font-heading-sm text-heading-sm text-primary font-bold">#1 Cafe</p>
                    </div>
                  </div>
                  <div className="pt-space-xs flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="flex -space-x-2">
                        <span className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-caption text-caption font-bold">
                          AK
                        </span>
                        <span className="w-7 h-7 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center font-caption text-caption font-bold">
                          TO
                        </span>
                        <span className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-caption text-caption font-bold">
                          EM
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary">
                        +418 repeat customers unlocked this month
                      </span>
                    </div>
                    <span className="font-label-sm text-caption text-primary font-semibold flex items-center gap-0.5">
                      Live Feed <Icon name="arrow_forward" className="text-[14px]" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm relative overflow-hidden">
                <Icon
                  name="format_quote"
                  className="absolute right-6 -bottom-4 text-[100px] text-surface-container-high/40 select-none pointer-events-none"
                />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-space-md">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="Portrait photo of Amara K, an energetic West African female founder and hospitality business owner, smiling warmly, professional cafe store setting in background, warm natural lighting, confident modern entrepreneur"
                      src={AMARA_IMAGE}
                    />
                  </div>
                  <div className="space-y-space-2xs">
                    <p className="font-body-md text-body-md text-text-primary italic">
                      “Within three weeks of placing the VEMTAP Tap Pass at our front desk, walk-ins from surrounding
                      offices doubled. No aggregators taking 20% cut—just real neighborhood loyalty.”
                    </p>
                    <div className="flex items-center gap-space-sm pt-space-2xs">
                      <span className="font-label-md text-label-md font-bold text-text-primary">Amara K.</span>
                      <span className="w-1 h-1 rounded-full bg-outline" />
                      <span className="font-caption text-caption text-text-secondary">
                        Founder, Bloom Wellness &amp; Cafe (Apo, Abuja)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-canvas py-space-2xl lg:py-space-3xl shadow-sm" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
            <div>
              <span className="font-label-sm text-caption uppercase tracking-wider text-primary font-semibold">
                Engineered For Brick &amp; Mortar Growth
              </span>
              <h2 className="font-display-hero text-heading-lg lg:text-display-hero text-text-primary font-bold mt-1">
                8 Core Merchant Superpowers
              </h2>
            </div>
            <p className="font-body-md text-body-md text-text-secondary max-w-md">
              Everything your physical store, eatery, clinic, or boutique needs to command your district without bloated
              SaaS subscriptions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {SUPERPOWERS.map((power, index) => {
              const selected = selectedPowers.includes(index);
              return (
                <button
                  key={power.title}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePower(index)}
                  className={`bg-surface-subtle p-space-lg rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow text-left ${
                    selected ? 'ring-2 ring-primary-container shadow-md' : ''
                  }`}
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-space-md ${power.iconClass}`}
                    >
                      <Icon name={power.icon} className="text-[28px]" />
                    </div>
                    <div className="flex items-center justify-between mb-space-2xs">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">{power.title}</h3>
                      <span
                        className={`px-space-xs py-space-2xs rounded font-caption text-caption font-semibold ${power.badgeClass}`}
                      >
                        {power.badge}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary mt-space-xs">{power.body}</p>
                  </div>
                  <div className="mt-space-md pt-space-xs flex items-center gap-space-2xs text-primary font-label-sm text-label-sm">
                    <span>{power.footer}</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-space-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-primary-container rounded-xl p-space-xl lg:p-space-2xl text-on-primary flex flex-col lg:flex-row items-center justify-between gap-space-lg shadow-xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-on-primary/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-space-xs">
              <span className="font-caption text-caption uppercase tracking-wider text-surface-container font-semibold">
                Ready in 5 minutes
              </span>
              <h2 className="font-display-hero text-heading-lg lg:text-display-hero font-bold">
                Put your store on your district’s map today.
              </h2>
              <p className="font-body-lg text-body-lg text-surface-container-high">
                Join thousands of independent retailers, cafes, and local service pros winning foot traffic with
                VEMTAP.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={onStart}
                className="w-full sm:w-auto h-[52px] px-space-xl rounded-xl bg-surface-canvas text-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs transition-transform active:scale-[0.98] shadow-md hover:bg-surface-tint-blue"
              >
                <span>Get Started for Free</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <button
                type="button"
                onClick={onExit}
                className="w-full sm:w-auto h-[52px] px-space-md rounded-xl text-on-primary hover:bg-on-primary/10 font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs transition-colors"
              >
                <Icon name="support_agent" className="text-[20px]" />
                <span>Book 10-Min Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </BusinessSetupChrome>
  );
}
