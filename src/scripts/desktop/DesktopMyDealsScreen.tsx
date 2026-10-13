import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopMyDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
}

const FILTERS = [
  { key: 'active', label: 'Active Deals', count: '2', pill: true },
  { key: 'past', label: 'Redeemed & Past', count: '7', pill: false },
  { key: 'gifted', label: 'Gifted to Others', count: '2', pill: false },
];

const PASSES = [
  {
    id: 'urban',
    discount: '-20%',
    zoneIcon: 'storefront',
    zone: 'Apo Legislative Zone',
    badge: 'Ready',
    badgeClass: 'bg-surface-tint-blue text-primary font-semibold',
    title: 'Urban Grill & Bistro',
    desc: 'Prime 3-Course Lunch Combo & Craft Beverage',
    price: '₦9,600',
    oldPrice: '₦12,000',
    save: '(Save ₦2,400)',
    expiry: '44 hrs left',
    expiryClass: 'text-error',
    expiryIcon: 'timer',
    claimed: 'Claimed: Today, 10:42 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACA2_s6VgseINON_78-r4Pkf6y8AqwAUIXCd_QFPm6NkjyMn5sybZsp_qM5EkpDTPNcXHwNOvBw-ph91WYFofBYQzkWV8rh4GEHYe3Uq2AN3TIBbzUEfyMpSuNfvRtfnmIyIT3JxIRVoLrus6WLgwBjvq4RoOrEy2GdlFgiBQdyBMh4RXnwneQFsTFt4Um4A2iLljlBCGBM4oSTOqAA5aok2RreaZLt259MZ6_KEPD',
    alt: 'Succulent flame grilled Angus gourmet burger with golden parmesan truffle fries and cold pressed peach beverage arranged on wooden tabletop at Urban Grill & Bistro Apo Abuja, warm cinematic indoor ambient restaurant lighting',
  },
  {
    id: 'sky',
    discount: '-50%',
    zoneIcon: 'location_on',
    zone: 'Maitama Heights',
    badge: 'Active Pass',
    badgeClass: 'bg-surface-subtle text-text-secondary font-medium',
    title: 'The Sky Lounge & Grill',
    desc: "50% Off Chef's 5-Course Signature Tasting Menu",
    price: '₦24,500',
    oldPrice: '₦49,000',
    save: '(Save ₦24,500)',
    expiry: '3 days left',
    expiryClass: 'text-text-secondary',
    expiryIcon: 'event_repeat',
    claimed: 'Claimed: Yesterday, 4:15 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXLX7XEsTI_RnUf48SC4PNyzGcgmy9_P0Oep84Pv-AthultZzFeshIqV6hnr4CZ_g8UPdWKVOR193l3KAe7STNGj44bpLNoI-8OU8OisBaZWL5qvxxPBGGePct_Zf_l6hIzwFV52Xm8iddHaTURb6Vqh0q6e98851FIPqb0IUPFD4Yex5ngq3NovlecXZWdh5Yg_MmIUsVro8zeME6PughuNPC7Vuc9rVzef1mZxt',
    alt: 'Fine dining presentation of five course tasting menu at luxury rooftop restaurant overlooking Abuja skyline at twilight, sleek glassware, soft dramatic architectural illumination',
  },
];

const INCLUDED = [
  'Choice of Dry-aged Angus burger or marinated grilled chicken supreme',
  'Truffle parmesan hand-cut fries or garden crisp salad',
  'Cold-pressed peach cooler or signature hibiscus iced tea',
];

export function DesktopMyDealsScreen({ onNav }: DesktopMyDealsScreenProps) {
  const [activeFilter, setActiveFilter] = useState('active');
  const [selectedPass, setSelectedPass] = useState('urban');

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
      <div className="w-full bg-surface-canvas">
        <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8">
          <div className="flex flex-col gap-1 mb-6">
            <nav className="flex items-center gap-2 text-text-tertiary font-caption text-caption">
              <button className="hover:text-primary transition-colors" onClick={() => onNav('discover')} type="button">
                Home
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <button className="hover:text-primary transition-colors" onClick={() => onNav('dashboard')} type="button">
                Customer Dashboard
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-text-primary font-medium">My Deals</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-1">
              <div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  My Deals &amp; Passes
                </h1>
                <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-2xl">
                  Manage your claimed vouchers, present offline QR passes at local Abuja merchants, and track live
                  redemption status.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto bg-surface-subtle px-3 py-2 rounded-xl shadow-sm">
                <Icon name="verified" className="text-primary text-[18px]" />
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Claimed Wallet:{' '}
                  <strong className="text-text-primary font-semibold">₦26,900 Total Savings</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-surface-canvas p-1.5 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-1 overflow-x-auto">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-surface-tint-blue text-primary font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                  }`}
                  type="button"
                >
                  <span>{filter.label}</span>
                  {filter.pill ? (
                    <span
                      className={
                        activeFilter === filter.key
                          ? 'w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption flex items-center justify-center'
                          : 'px-1 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption'
                      }
                    >
                      {filter.count}
                    </span>
                  ) : (
                    <span className="px-1 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption">
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1 lg:max-w-md">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary"
                />
                <input
                  className="w-full h-10 pl-9 pr-3 bg-surface-subtle rounded-lg font-body-md text-body-md placeholder:text-text-tertiary text-text-primary focus:outline-none focus:bg-surface-canvas shadow-inner"
                  placeholder="Search your claimed deals..."
                  type="text"
                />
              </div>
              <div className="relative shrink-0">
                <button
                  className="h-10 px-3 bg-surface-subtle hover:bg-surface-container-high rounded-lg flex items-center gap-1.5 font-label-sm text-label-sm text-text-primary transition-colors"
                  type="button"
                >
                  <Icon name="near_me" className="text-[18px] text-primary" />
                  <span>All Abuja Hubs</span>
                  <Icon name="arrow_drop_down" className="text-[16px] text-text-tertiary" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                  Your Active Passes (2)
                </span>
                <span className="font-caption text-caption text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  <span>Sync Updated Just Now</span>
                </span>
              </div>

              {PASSES.map((pass) => {
                const isSelected = selectedPass === pass.id;
                return (
                  <article
                    key={pass.id}
                    onClick={() => setSelectedPass(pass.id)}
                    className={`relative flex flex-col bg-surface-canvas rounded-xl overflow-hidden cursor-pointer transition-all group ${
                      isSelected ? 'shadow-md hover:shadow-lg' : 'shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container z-10" />}
                    <div className="flex p-3 gap-3">
                      <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-high">
                        <img
                          alt={pass.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={pass.image}
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-tight">
                          {pass.discount}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-caption text-caption text-text-tertiary flex items-center gap-1.5">
                              <Icon name={pass.zoneIcon} className={`text-[14px] ${pass.zoneIcon === 'storefront' ? 'text-primary' : ''}`} />
                              <span>{pass.zone}</span>
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-caption text-caption ${pass.badgeClass}`}
                            >
                              {pass.badge === 'Ready' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                              <span>{pass.badge}</span>
                            </span>
                          </div>
                          <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate mt-0.5">
                            {pass.title}
                          </h3>
                          <p className="font-body-md text-body-md text-text-secondary line-clamp-1">{pass.desc}</p>
                        </div>
                        <div className="flex items-baseline justify-between mt-0.5 pt-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                              {pass.price}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary line-through">
                              {pass.oldPrice}
                            </span>
                            <span className="font-caption text-caption text-badge-discount-text font-medium">
                              {pass.save}
                            </span>
                          </div>
                          <span
                            className={`font-caption text-caption font-medium flex items-center gap-1 ${pass.expiryClass}`}
                          >
                            <Icon name={pass.expiryIcon} className="text-[14px]" />
                            <span>{pass.expiry}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-surface-subtle flex items-center justify-between text-text-secondary font-caption text-caption">
                      <span className="flex items-center gap-1.5">
                        <Icon name="schedule" className="text-[15px] text-text-tertiary" />
                        <span>{pass.claimed}</span>
                      </span>
                      {isSelected ? (
                        <span className="text-primary font-medium flex items-center gap-0.5">
                          <span>Viewing Pass</span>
                          <Icon name="arrow_forward" className="text-[14px]" />
                        </span>
                      ) : (
                        <span className="text-text-tertiary group-hover:text-primary transition-colors flex items-center gap-0.5 font-medium">
                          <span>Select to inspect</span>
                          <Icon name="chevron_right" className="text-[14px]" />
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}

              <div className="p-4 rounded-xl bg-surface-subtle flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0 text-primary">
                  <Icon name="cloud_off" className="text-[20px]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                    Instant Offline Verification
                  </h4>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
                    Your passes are cryptographically stored on your device. Present the dynamic QR code directly to
                    the merchant even without active MTN or Airtel data signal.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-high/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Icon name="explore" className="text-[18px]" />
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Looking for coffee or treats?
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      4 limited vouchers unlock in Apo District at noon.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNav('deals')}
                  className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  type="button"
                >
                  Explore →
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-4 sticky top-24">
              <div className="relative bg-surface-canvas rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-surface-container-lowest via-surface-canvas to-surface-tint-blue/30 relative">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-heading-md text-heading-md flex items-center justify-center font-bold shadow-md">
                        UG
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-bold">
                            VEMTAP PASS ID
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                            <Icon name="verified" className="text-[12px]" />
                            <span>Verified Partner</span>
                          </span>
                        </div>
                        <h2 className="font-heading-md text-heading-md text-text-primary font-bold tracking-tight">
                          Urban Grill &amp; Bistro
                        </h2>
                        <p className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                          <Icon name="location_on" className="text-[14px] text-primary" />
                          <span>Plot 482, Guzape Junction, Apo District, Abuja • 0.8 km away</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                        <span>Ready to Redeem</span>
                      </span>
                      <p className="font-caption text-caption text-text-tertiary mt-1">Claimed Today 10:42 AM</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-surface-container-low/70 backdrop-blur flex items-center justify-between">
                    <div>
                      <span className="font-caption text-caption text-text-tertiary">Entitlement Offer</span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary">
                        Prime 3-Course Lunch Combo &amp; Craft Beverage
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-caption text-caption text-text-tertiary">Claim Price</span>
                      <p className="font-heading-sm text-heading-sm font-bold text-primary">
                        ₦9,600 <span className="font-caption text-caption text-text-tertiary font-normal">(-20%)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-8 flex items-center justify-between px-0 bg-surface-container-lowest">
                  <div className="w-4 h-8 bg-surface-canvas rounded-r-full -ml-0 shadow-inner" />
                  <div className="flex-1 mx-3 border-b-2 border-dashed border-border-subtle" />
                  <div className="w-4 h-8 bg-surface-canvas rounded-l-full -mr-0 shadow-inner" />
                </div>

                <div className="p-6 pt-3 bg-surface-container-lowest flex flex-col items-center">
                  <div className="w-full max-w-sm flex flex-col items-center p-4 rounded-2xl bg-surface-subtle shadow-sm relative group">
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-text-primary text-on-primary font-caption text-caption font-semibold flex items-center gap-1.5 shadow-sm">
                      <Icon name="wifi_off" className="text-[13px] text-badge-discount-text" />
                      <span>Offline POS Authorized</span>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-md my-2 relative">
                      <svg className="w-48 h-48 text-text-primary" fill="currentColor" viewBox="0 0 160 160">
                        <path d="M10,10 h45 v45 h-45 z M20,20 v25 h25 v-25 z M27,27 h11 v11 h-11 z" />
                        <path d="M105,10 h45 v45 h-45 z M115,20 v25 h25 v-25 z M122,27 h11 v11 h-11 z" />
                        <path d="M10,105 h45 v45 h-45 z M20,115 v25 h25 v-25 z M27,122 h11 v11 h-11 z" />
                        <rect height="8" width="8" x="62" y="15" />
                        <rect height="8" width="8" x="76" y="15" />
                        <rect height="8" width="8" x="90" y="15" />
                        <rect height="8" width="8" x="15" y="62" />
                        <rect height="8" width="8" x="15" y="76" />
                        <rect height="8" width="8" x="15" y="90" />
                        <rect className="text-primary" height="30" width="30" x="65" y="65" />
                        <rect fill="#ffffff" height="14" width="14" x="73" y="73" />
                        <rect height="8" width="10" x="40" y="65" />
                        <rect height="10" width="12" x="110" y="65" />
                        <rect height="10" width="15" x="130" y="70" />
                        <rect height="12" width="10" x="65" y="40" />
                        <rect height="10" width="12" x="65" y="110" />
                        <rect height="15" width="15" x="85" y="105" />
                        <rect height="15" width="10" x="105" y="90" />
                        <rect height="10" width="20" x="125" y="100" />
                        <rect height="15" width="15" x="110" y="125" />
                        <rect height="10" width="15" x="40" y="85" />
                        <rect height="20" width="10" x="35" y="105" />
                        <rect height="15" width="25" x="70" y="130" />
                        <rect height="15" width="15" x="130" y="135" />
                      </svg>
                      <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-primary" />
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-primary" />
                      <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-primary" />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-primary" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-caption text-caption text-text-tertiary">Voucher Code:</span>
                      <span
                        className="font-heading-sm text-heading-sm font-mono font-bold tracking-widest text-text-primary"
                        id="voucherCode"
                      >
                        VT-48F2G1
                      </span>
                      <button
                        aria-label="Copy Voucher Code"
                        onClick={() => navigator.clipboard.writeText('VT-48F2G1')}
                        className="p-1 rounded-md text-text-secondary hover:text-primary hover:bg-surface-canvas transition-colors"
                        id="copyCodeBtn"
                        title="Copy Voucher Code"
                        type="button"
                      >
                        <Icon name="content_copy" className="text-[16px]" />
                      </button>
                    </div>
                    <p className="font-caption text-caption text-text-tertiary mt-0.5 text-center">
                      Merchant scans using VEMTAP Smart POS or enters code manually.
                    </p>
                  </div>

                  <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface-subtle">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Pass Holder
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        Zainab Ahmed
                      </p>
                      <p className="font-caption text-caption text-text-secondary">+234 803 555 0192</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-subtle">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Validity Window
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        Mon–Fri, 12:00 PM – 4:00 PM
                      </p>
                      <p className="font-caption text-caption text-error font-medium">
                        Expires: Saturday, Oct 19, 2024
                      </p>
                    </div>
                  </div>

                  <div className="w-full mt-3 p-3 rounded-xl bg-surface-subtle">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Included Items in this Claim
                      </span>
                      <span className="font-caption text-caption text-primary font-medium">3 of 3 Included</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 font-body-md text-body-md text-text-primary">
                      {INCLUDED.map((item) => (
                        <li className="flex items-center gap-2" key={item}>
                          <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                          <span>
                            <strong>1x</strong> {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full mt-3 p-3 rounded-xl bg-surface-tint-blue/80 flex items-start gap-2 text-text-primary">
                    <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption leading-relaxed">
                      <strong>Settlement Notice:</strong> Pay <strong>₦9,600</strong> directly to Urban Grill &amp;
                      Bistro cashier at redemption via card or cash. Zero upfront checkout fees charged by VEMTAP.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-surface-subtle flex flex-col gap-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    <button
                      className="h-12 px-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                      type="button"
                    >
                      <Icon name="download" className="text-[20px]" />
                      <span>Download Pass</span>
                    </button>
                    <button
                      className="h-12 px-3 rounded-xl bg-surface-canvas hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm transition-all"
                      type="button"
                    >
                      <Icon name="share" className="text-[20px] text-badge-discount-text" />
                      <span>Share WhatsApp</span>
                    </button>
                    <button
                      className="h-12 px-3 rounded-xl bg-surface-canvas hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm transition-all"
                      type="button"
                    >
                      <Icon name="call" className="text-[20px] text-primary" />
                      <span>Call Venue</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2 px-1">
                    <button
                      className="font-label-sm text-label-sm text-text-tertiary hover:text-error transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <Icon name="cancel" className="text-[16px]" />
                      <span>Cancel Claim &amp; Release Spot</span>
                    </button>
                    <button
                      onClick={() => onNav('storefront')}
                      className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span>View Merchant Menu &amp; Location Map</span>
                      <Icon name="open_in_new" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl bg-surface-subtle flex items-center justify-between text-text-secondary">
                <div className="flex items-center gap-2">
                  <Icon name="verified_user" className="text-badge-discount-text text-[18px]" />
                  <span className="font-caption text-caption">
                    VEMTAP NDPR Protected • Encrypted Token: VT-SEC-84092-ABJ
                  </span>
                </div>
                <button className="font-caption text-caption text-primary hover:underline" type="button">
                  Voucher Policy
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DesktopPage>
  );
}
