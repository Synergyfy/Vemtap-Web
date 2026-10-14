import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useLocation } from '../../context/LocationContext';
import { useProfile } from '../../context/ProfileContext';

interface DesktopDashboardScreenProps {
  onNav: (key: DesktopNavKey) => void;
}

const STATS = [
  {
    label: 'Active Deals',
    value: '2',
    suffix: 'Ready to Redeem',
    suffixClass: 'text-badge-discount-text',
    note: 'potential savings remaining',
    noteStrong: '₦7,400',
    noteIcon: 'savings',
    noteIconClass: 'text-badge-discount-text',
    icon: 'local_offer',
    iconBg: 'bg-surface-tint-blue text-primary',
    bubble: 'bg-surface-tint-blue opacity-60',
  },
  {
    label: 'Lifetime Saved',
    value: '₦38,500',
    suffix: '',
    suffixClass: '',
    note: 'Across 9 local merchants in FCT',
    noteStrong: '',
    noteIcon: 'storefront',
    noteIconClass: 'text-primary',
    icon: 'account_balance_wallet',
    iconBg: 'bg-badge-discount-bg text-badge-discount-text',
    bubble: 'bg-badge-discount-bg opacity-70',
  },
  {
    label: 'Upcoming Bookings',
    value: '1',
    suffix: 'Scheduled',
    suffixClass: 'text-primary',
    note: 'Tomorrow, 1:15 PM • Glow & Serenity',
    noteStrong: '',
    noteIcon: '',
    noteIconClass: '',
    icon: 'calendar_today',
    iconBg: 'bg-surface-container text-primary',
    bubble: 'bg-surface-container-high opacity-60',
  },
  {
    label: 'Saved Spots',
    value: '14',
    suffix: 'Favorites',
    suffixClass: 'text-text-secondary',
    note: 'Bookmarked in Apo & Maitama Hubs',
    noteStrong: '',
    noteIcon: '',
    noteIconClass: '',
    icon: 'bookmark',
    iconBg: 'bg-surface-subtle text-text-secondary',
    bubble: 'bg-surface-container-high opacity-60',
  },
];

const SHORTCUTS = [
  { icon: 'confirmation_number', label: 'My Deals & Vouchers', iconBg: 'bg-surface-tint-blue text-primary', trail: 'dot' as const, target: 'my-deals' as DesktopNavKey },
  { icon: 'receipt_long', label: 'Orders & Bookings', iconBg: 'bg-surface-subtle text-text-secondary', trail: 'text' as const, trailText: '1 Active', target: 'orders' as DesktopNavKey },
  { icon: 'bookmark', label: 'Saved Items & Stores', iconBg: 'bg-surface-subtle text-text-secondary', trail: 'text' as const, trailText: '14', target: 'cart' as DesktopNavKey },
  { icon: 'chat', label: 'Merchant In-App Chats', iconBg: 'bg-badge-discount-bg text-badge-discount-text', trail: 'badge' as const, trailText: '2 new', target: 'messages' as DesktopNavKey },
  { icon: 'manage_accounts', label: 'Account & Security', iconBg: 'bg-surface-subtle text-text-secondary', trail: 'chevron' as const, target: 'account-settings' as DesktopNavKey },
];

const CURATED = [
  {
    name: 'Artisan Bakery & Cafe',
    desc: 'Sourdough & Breakfast Combo',
    price: '₦4,500',
    discount: '25%',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwlLJgn3Lo4pCUOSZ-nT8ThfxxcKg5Piru5gtuk4-6fMWIxXIvhQFt4dldSA95dzgnkZ6FEonZdZ1WC9OqVcMeWiwba31vawVYe3kqqD-jY3CSkcAPKeMerrCkuRURnREWiMYbva2pjOmeeHvy4oYtAXd9FT-IhL7h_-PwExycuLeUCRiT24Hy-QL2iC95hc6l1_Rks3n0wJwoipPmHsSjcXBI8SEoYHxB0avDmOm3',
    alt: 'Golden crisp freshly baked artisanal sourdough loaf and flaky croissants with specialty hot pour-over coffee on marble table at high-end artisan bakery Abuja',
  },
  {
    name: 'Sole District Boutique',
    desc: 'Weekend Sneaker Drop Collection',
    price: '₦28,000',
    discount: '30%',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9LjM89m0lPfe4nvzVnfl5ah1Dz94580SSeIZLuIc_B8E1HA9JcfNsH9TR_atSi4yqFF_cfwt3r92vgQJZp2znh4grrPmsuxvLBQdb2Mo9mPPqE9ryjdUQOR3qs77YuAlT5RDUi109ooVN9-yNm9gs_utwLMdrP5bd9FqnMPkisHwoghhoyZ7eZDW8Gc5YLwdgK2u3M0rMu1nUyJVyzGQm4xMLhnc36b1pmThRvIP',
    alt: 'Clean minimalist display of limited edition premium athletic sneakers on polished concrete pedestal in designer streetwear boutique store in Abuja',
  },
];

const ACTIVE_DEALS = [
  {
    badge: '20% OFF',
    distance: '0.4 km away',
    category: 'Fine Dining • Apo Legislative Quarters',
    title: 'Urban Grill & Bistro',
    validity: 'Valid 48h',
    validityClass: 'bg-surface-tint-blue text-primary',
    validityIcon: 'timer',
    desc: "Prime 3-Course Lunch Combo (Includes Chef's Signature Wagyu Skewers, Truffle Mash, & Hibiscus Sorbet)",
    price: '₦9,600',
    oldPrice: '₦12,000',
    save: 'Save ₦2,400',
    id: 'ID: #VT-48F2G1',
    secondAction: 'Contact Business',
    secondIcon: 'chat',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_Nt5D77WYU_81CtHjxldVcvlVCIcRl2U4WJUUtgI0NVk_piCcgKnLUErciZi71PDQVZVYZaVid1N4ptyjz6EXEYa291zPNo9ax-6Xk3pRxTkwi0Ot9Np7UV26p_CbHm9yBThqZ0LxTfeICILiJ2Bbdn2fXHQuvl1WCPe3GRU0GKNXJEQQo2RblYGsGwcN_mjSnQ3_AlP8KGdCLrAYYsi0OQFKhEQEOmq1SUDdvroZ',
    alt: 'A beautifully plated woodfire grilled prime 3-course gourmet meal with tender steak, seasonal greens, and fine artisanal sauce at Urban Grill & Bistro in Abuja, warm elegant cinematic restaurant lighting with natural depth',
  },
  {
    badge: '50% OFF',
    distance: '1.2 km away',
    category: 'Lounge & Rooftop • Apo Central',
    title: 'The Sky Lounge',
    validity: 'Valid Until Sunday',
    validityClass: 'bg-surface-container-high text-on-surface',
    validityIcon: 'event_seat',
    desc: "Chef's 5-Course Signature Tasting Menu with Sommelier Pairings for Two Guests",
    price: '₦24,500',
    oldPrice: '₦49,000',
    save: 'Save ₦24,500',
    id: 'ID: #VT-99B12',
    secondAction: 'Directions',
    secondIcon: 'location_on',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAzXojjX_EFWQZATg_OWvrkzltnD-2lBbruMnZI09f_3YK_zYYUgwVEEW0IVgdspzPgaFAL27hZWdXmiBvFACY6_gP_7zxLstkJlaJ2BpCypasZPxh247i28b8YlpTEZMkumAQ1b38vNQgg9M1NMSbAzQ48kXMNFucudqcrGc4N223WNhOMNniFS-2G-oE249QPsUYwWxT_OGLeJIoRdkwwz5BJUyRDj0Mf1JO5YW9-',
    alt: 'Stunning rooftop sunset dining view with a masterfully styled five-course tasting menu plate at The Sky Lounge Abuja, moody architectural luxury, gold and deep navy ambient lighting, pristine modern culinary presentation',
  },
];

export function DesktopDashboardScreen({ onNav }: DesktopDashboardScreenProps) {
  const { fullName } = useProfile();
  const { district, city } = useLocation();
  const firstName = fullName.trim().split(/\s+/)[0] || 'there';
  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="dashboard">
      <div className="w-full bg-surface-canvas pb-14">
        <div className="w-full bg-surface-subtle pb-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="pt-6 pb-2 flex items-center justify-between">
              <nav className="flex items-center gap-2 text-text-tertiary font-caption text-caption">
                <button
                  className="hover:text-primary transition-colors"
                  onClick={() => onNav('discover')}
                  type="button"
                >
                  VEMTAP
                </button>
                <span>/</span>
                <span className="text-text-primary font-medium">Customer Dashboard</span>
              </nav>
              <div className="hidden sm:flex items-center gap-2 bg-surface-canvas px-3 py-1.5 rounded-full shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption text-text-secondary">
                  Connected to Apo NFC Grid Node • 0.3ms latency
                </span>
              </div>
            </div>

            <section className="mt-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-surface-tint-blue text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold">
                  <Icon name="verified" className="text-[16px]" />
                  <span>VEMTAP Elite Consumer Tier</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Hello, {firstName} 👋
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary">
                  Here is your neighborhood activity, active deals, and saved spots in {district}, {city}.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-canvas hover:bg-surface text-text-primary font-label-md text-label-md shadow-sm transition-all"
                  type="button"
                >
                  <Icon name="qr_code_scanner" className="text-[18px] text-text-secondary" />
                  <span>Tap to Scan POS</span>
                </button>
                <button
                  onClick={() => onNav('deals')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all"
                  type="button"
                >
                  <Icon name="explore" className="text-[18px]" />
                  <span>Explore Apo Deals</span>
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-surface-canvas rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div
                    className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full group-hover:scale-110 transition-transform ${stat.bubble}`}
                  />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                        {stat.label}
                      </span>
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                        <Icon name={stat.icon} className="text-[20px]" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display-hero text-display-hero text-text-primary">{stat.value}</span>
                        {stat.suffix && (
                          <span className={`font-label-md text-label-md font-semibold ${stat.suffixClass}`}>
                            {stat.suffix}
                          </span>
                        )}
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1.5">
                        {stat.noteIcon && (
                          <Icon name={stat.noteIcon} className={`text-[14px] ${stat.noteIconClass}`} />
                        )}
                        <span>
                          {stat.noteStrong && <strong>{stat.noteStrong}</strong>}
                          {stat.noteStrong ? ' ' : ''}
                          {stat.note}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-10 min-w-0">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="verified_user" className="text-primary text-[24px]" />
                      <h2 className="font-heading-lg text-heading-lg text-text-primary">Active Deals &amp; Passes</h2>
                      <span className="px-2.5 py-0.5 bg-primary-container text-on-primary font-caption text-caption rounded-full font-bold ml-2">
                        2 ACTIVE
                      </span>
                    </div>
                    <button
                      onClick={() => onNav('my-deals')}
                      className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span>Browse All Vouchers</span>
                      <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>
                  {ACTIVE_DEALS.map((deal) => (
                    <div
                      key={deal.title}
                      className="bg-surface-canvas rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
                    >
                      <div className="md:w-52 h-44 rounded-lg overflow-hidden shrink-0 relative">
                        <img alt={deal.alt} className="w-full h-full object-cover" src={deal.image} />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold rounded-md shadow-sm">
                          {deal.badge}
                        </span>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-inverse-surface/80 backdrop-blur-sm text-surface-canvas font-caption text-caption rounded">
                          {deal.distance}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                                {deal.category}
                              </span>
                              <h3 className="font-heading-md text-heading-md text-text-primary">{deal.title}</h3>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-caption text-caption font-semibold rounded ${deal.validityClass}`}
                            >
                              <Icon name={deal.validityIcon} className="text-[14px]" />
                              <span>{deal.validity}</span>
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-text-secondary mb-3">{deal.desc}</p>
                          <div className="flex items-center gap-4 font-label-md text-label-md mb-4">
                            <span className="text-text-primary font-bold text-heading-sm">{deal.price}</span>
                            <span className="text-text-tertiary line-through font-caption text-caption">
                              {deal.oldPrice}
                            </span>
                            <span className="text-badge-discount-text font-caption text-caption font-semibold bg-badge-discount-bg px-2 py-0.5 rounded">
                              {deal.save}
                            </span>
                            <span className="text-text-tertiary text-caption font-mono">{deal.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-3 pt-3 border-t border-surface-subtle">
                          <button
                            onClick={() => onNav('my-deals')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm"
                            type="button"
                          >
                            <Icon name="qr_code_2" className="text-[18px]" />
                            <span>View Voucher QR Pass</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-primary font-label-md text-label-md transition-colors"
                            type="button"
                          >
                            <Icon name={deal.secondIcon} className="text-[18px] text-text-secondary" />
                            <span>{deal.secondAction}</span>
                          </button>
                          <button
                            aria-label="Share Deal"
                            className="ml-auto p-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-secondary"
                            type="button"
                          >
                            <Icon name="share" className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="history" className="text-primary text-[24px]" />
                      <h2 className="font-heading-lg text-heading-lg text-text-primary">
                        Recent Orders &amp; Bookings
                      </h2>
                    </div>
                    <button
                      onClick={() => onNav('orders')}
                      className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span>Full Ledger History</span>
                      <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>

                  <div className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container" />
                    <div className="flex items-start gap-4 pl-1">
                      <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                        <Icon name="spa" className="text-[26px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>UPCOMING APPOINTMENT</span>
                          </span>
                          <span className="font-caption text-caption text-text-tertiary">• Booking #GS-810</span>
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary">Glow &amp; Serenity Spa &amp; Salon</h3>
                        <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                          Deep Hydration Radiance Facial &amp; Luxury Gel Manicure
                        </p>
                        <p className="font-caption text-caption text-text-tertiary mt-0.5 flex items-center gap-1.5">
                          <Icon name="schedule" className="text-[14px]" />
                          <span>Thu, Oct 17 • 1:15 PM (Assigned Specialist: Amara K.)</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold rounded-full">
                        <Icon name="check_circle" className="text-[14px]" />
                        <span>Confirmed by Host</span>
                      </span>
                      <button
                        onClick={() => onNav('spa-storefront')}
                        className="w-full md:w-auto px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-primary font-label-md text-label-md transition-colors text-center"
                        type="button"
                      >
                        View Booking Details
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-badge-discount-text" />
                    <div className="flex items-start gap-4 pl-1">
                      <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center text-text-secondary shrink-0">
                        <Icon name="restaurant" className="text-[26px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-text-secondary font-caption text-caption font-bold">
                            IN-STORE NFC TAP
                          </span>
                          <span className="font-caption text-caption text-text-tertiary">• Yesterday, 8:42 PM</span>
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary">Urban Grill &amp; Bistro</h3>
                        <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                          Woodfire Aged Ribeye, Garlic Rosemary Potatoes &amp; House Spritz (Table #07)
                        </p>
                        <p className="font-caption text-caption text-badge-discount-text mt-0.5 flex items-center gap-1.5 font-medium">
                          <Icon name="loyalty" className="text-[14px]" />
                          <span>Earned +190 VEMTAP Reward Credits</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦19,000</span>
                      <button
                        onClick={() => onNav('orders')}
                        className="w-full md:w-auto px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-primary font-label-md text-label-md transition-colors text-center"
                        type="button"
                      >
                        Reorder / View Receipt
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon name="near_me" className="text-primary text-[22px]" />
                      <h3 className="font-heading-md text-heading-md text-text-primary">Apo Active Partner Radar</h3>
                    </div>
                    <span className="font-caption text-caption text-text-secondary">Radius: 5.0 km</span>
                  </div>
                  <div className="w-full h-56 rounded-xl bg-surface-subtle relative overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center p-6 bg-surface-canvas/90 backdrop-blur-md rounded-xl shadow-lg max-w-sm">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-1 shadow-md">
                        <Icon name="explore" className="text-[20px]" />
                      </div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary">
                        18 Local Merchants Active Near You
                      </h4>
                      <p className="font-caption text-caption text-text-secondary mt-1">
                        Instant Tap savings enabled across Apo Resettlement, Legislative Zone &amp; Durumi Axis.
                      </p>
                      <button
                        onClick={() => onNav('discover')}
                        className="mt-3 px-4 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors"
                        type="button"
                      >
                        Open Interactive Map View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary mb-4">Quick Shortcuts</h3>
                  <div className="flex flex-col gap-1.5">
                    {SHORTCUTS.map((shortcut) => (
                      <button
                        key={shortcut.label}
                        onClick={() => onNav(shortcut.target)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-subtle transition-colors group text-left w-full"
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${shortcut.iconBg}`}
                          >
                            <Icon name={shortcut.icon} className="text-[20px]" />
                          </div>
                          <span className="font-label-md text-label-md text-text-primary font-medium">
                            {shortcut.label}
                          </span>
                        </div>
                        {shortcut.trail === 'dot' && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        {shortcut.trail === 'text' && (
                          <span className="font-caption text-caption text-text-tertiary">{shortcut.trailText}</span>
                        )}
                        {shortcut.trail === 'badge' && (
                          <span className="px-2 py-0.5 bg-primary text-on-primary font-caption text-caption font-bold rounded-full">
                            {shortcut.trailText}
                          </span>
                        )}
                        {shortcut.trail === 'chevron' && (
                          <Icon name="chevron_right" className="text-text-tertiary text-[18px]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name="auto_awesome" className="text-tertiary-container text-[20px]" />
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">Curated For You</h3>
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">Based on your taste</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {CURATED.map((item) => (
                      <div
                        key={item.name}
                        className="flex gap-3 group cursor-pointer hover:bg-surface-subtle p-2 rounded-xl transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative">
                          <img alt={item.alt} className="w-full h-full object-cover" src={item.image} />
                          <span className="absolute top-1 left-1 px-1 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold rounded">
                            {item.discount}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>
                            <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{item.desc}</p>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-label-md text-label-md text-text-primary font-bold">{item.price}</span>
                            <button
                              onClick={() => onNav('deal-detail')}
                              className="text-primary font-label-sm text-label-sm font-semibold hover:underline"
                              type="button"
                            >
                              View Deal →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-tint-blue rounded-xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
                        <Icon name="verified_user" className="text-[18px]" />
                      </div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary">VEMTAP Buyer Guarantee</h4>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary">
                      All vouchers redeemed via VEMTAP are covered by our 100% merchant fulfillment promise. Instant
                      dispute resolution available 24/7.
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1.5"
                        type="button"
                      >
                        <span>Learn how you are protected</span>
                        <Icon name="arrow_forward" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 text-center">
                  <p className="font-caption text-caption text-text-tertiary">
                    Own a retail outlet or restaurant in Abuja?
                  </p>
                  <button
                    onClick={() => onNav('for-merchants')}
                    className="font-label-md text-label-md text-primary font-semibold hover:underline mt-1 inline-flex items-center gap-1.5"
                    type="button"
                  >
                    <span>Set up your business on VEMTAP</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
