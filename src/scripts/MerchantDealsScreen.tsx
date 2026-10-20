import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface MerchantDealsScreenProps {
  business?: { name?: string; slug?: string; venue?: 'urban' | 'spa' } | null;
  onBack: () => void;
  onOpenDeal: (from: 'storefront') => void;
  onBusinessSetup: () => void;
  onShowGrid: () => void;
  onClaim?: (onClaimed?: () => void) => void;
}

const LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA9gxwW_2EtTxuige5b0F1RIR-WaOXBqAQU1LgSiRCWLn-LWtel_tA5ivKA6iF_UvDwG1IIhOhdM4JiH_ZlPECTlRXmzTX7Wv7L5nZaW62nie5iGJW03ZKtyruFhl2b54iLIvSCfRasowDm3CJ3CbyCrqW3E0D2Ed26bmrlmvoUOB941Ors4GCvgwXmoXYssjlcU2LBjXfOkZuz0DfLE7uacT5Or2m3SvVGnczaLUHYMHJVFDCnIx1erA';

const DEAL_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWryZTrKKURa3xETCKtxpGFDYUImoSkH6YEmNBVTa46IsyNsAybwGYQJfGjqBQZrW9XcPRGmY3LLaz30oRC2HtmAcJERhLQRVi5Bb8daMoHmG3C_qfC9WMxxXUW2Q0ko4x29OWs-ShEp5YpeYpxfKTMMdUZBw4LdSoH64GruvK4YF440qkRGd44VvQQznvurBf6c8ZFdZXw55IcCTR7B0LZFh4_ofWggm6COUsHImCQkhs1qrjtCjehA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCcDEdclTcQ8ugMpoI6zigRjJEQ0DnSq8zogGL7BT4IMReademzZ-VGWiHqhtMaxjsW_6yUb54YCrxIJ8zH1h1zAlOePhE6MNhSROdAjRGvHiIjDXg4WyDSZnVbYNEMgahZlBDMHjZhpdnyVzxNmwvnx1r6WVI4Lm7vFIju5jd2SMl2L2ytdUTkBsWk_JR8eCHYD5SUV2eHxzoa7akAoj0oWDrluc2hEe_D53AmKxwlxBjEKxFDOR81bA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAOhOm9GIE9HL-kMvTsWriVQFnPKvUqEjCQsz5yEypOHa42kz56PDa60fgOz1i9S8EbiDpQnDRtFSmoax1hZeSUEupBH-udRZDq4HdaD4vGgO2B_jsIIzWgq4_QsOdLoHTL5o5KmRPusBOX_VJfLB66UfHitSlK3nJPZjue0zcpHurNqc6De6x280iqxCFyEJKaR1ftbzJpa6fSPjv45a7D-sS7OLkd0PT2_T8X69gXyvRTO3qgewtwig',
];

const NEARBY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA78T6Z7DBrfH8DUpzFZEf2u0YL34xivpogO0LCrSNycoTDP3CcQl5js8Rf8I0eZd4OYwZRQzZErpKR3wU0vz1EWVGhP0XmLicy8nSGjYYcyOL5DEfppQXodXQRq3k70jZotWlPQYAfzw_BgmrD5OBAMMx44Je5zCTHnrwD1DJLsIqVHfAgv4cpS-s48Bha6u61If1ysJf9du5dAEroREDfo9H0ve7RfQ6XDoL0SafKlrQ3ct99c_XLfA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD6roMhzL-j1s3Yqp4_W7B4ZYCUPc3by9u-grcS3pqvRb317J4_Ve0Ue0-hDlU2O3Pbtz38wAhsp-VsC3nFz-9kjKjSQKlhsn9NORYNSuCwqn3XWNkX_nH5pqAY51ZTTkCUL24xMlncav_uTQ0YrO7ByOq-7_o5o5lUwEnrYQxDsdiehXSD58PR_P2kL1D1YyXuK4ZO66ocXh6uLa9lQ5iI2_T1vhAcaIRcXpVFnQZipRccBIwFnrhjKA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDYn8VcDzi2AFelMEWgMxcZfKywncFTCYkEzlIhSmHp91HkTQZaE7_RZqm8TSdGvwsdMpkxB78gtUZC_jT4JZV3A7WrhKX4o92ogH-hRJNtpfqDcp2Nj88bffQqeG4VuVFp3n4MKGvb_YLDD8sDzBX2R6QanxwWk2U2u4VfmPk8QhvU44CeiDg2opiDrp1wUSZ_1PToxJOU0Gr33aGA1bUmdIgmaMSvKn2PfyfkU9ls12Mnp6Mk2RhhDQ',
];

const DEALS = [
  {
    badges: ['20% OFF', 'Ends in 4h'],
    badgeIcons: ['', 'schedule'],
    rightBadge: 'Lunch Special',
    location: 'Urban Grill & Bistro â€¢ Apo',
    title: 'Prime 3-Course Lunch Combo & Drinks',
    price: 'â‚¦9,600',
    was: 'â‚¦12,000',
    save: 'Save â‚¦2,400 on this meal',
    voucher: '1 voucher / table',
    valid: 'Valid 12 PM - 4 PM',
    image: DEAL_IMAGES[0],
    imageAlt: 'Gourmet prime grilled steak meal served with roasted herb potatoes, grilled asparagus, and warm demi-glace sauce on a rustic ceramic plate, ambient warm bistro table lighting',
  },
  {
    badges: ['15% OFF', 'Weekdays Only'],
    badgeIcons: ['', ''],
    rightBadge: '',
    title: "Chef's Signature Dinner Platter for Two",
    desc: 'Includes full rack ribs, 4 skewers, sides & house mocktails',
    price: 'â‚¦18,500',
    was: 'â‚¦21,000',
    save: 'Save â‚¦2,500',
    image: DEAL_IMAGES[1],
    imageAlt: 'Generous chef dinner platter with smoky barbecue pork ribs, glazed chicken skewers, grilled sweet corn, and artisan dipping sauces, high-end food photography with deep contrast',
  },
  {
    badges: ['10% OFF', 'Weekend Brunch'],
    badgeIcons: ['', ''],
    rightBadge: '',
    title: 'Gourmet Wagyu Burger & Truffle Fries',
    desc: 'Grass-fed wagyu patty, parmesan truffle oil fries & craft soda',
    price: 'â‚¦7,200',
    was: 'â‚¦8,000',
    save: 'Save â‚¦800',
    image: DEAL_IMAGES[2],
    imageAlt: 'Artisan wagyu beef burger stacked with melted cheddar cheese, caramelized onions, and crisp arugula beside a basket of golden truffle fries, shot in bright natural daytime daylight',
  },
];

const NEARBY = [
  {
    image: NEARBY_IMAGES[0],
    imageAlt: 'Artisanal cold brew glass bottle paired with freshly baked almond croissants and chocolate pastries arranged on marble counter, soft morning sunbeams',
    badge: 'BOGO',
    name: 'Cafe Neo Artisanal',
    distance: '0.3 km',
    title: 'Cold Brew 1L & Pastry Box',
    price: 'â‚¦4,500',
    was: 'â‚¦6,000',
  },
  {
    image: NEARBY_IMAGES[1],
    imageAlt: 'Upscale rooftop sunset dining setup featuring fine wine glasses, gourmet amuse-bouche, and panoramic city lights in the golden hour dusk',
    badge: '50% OFF',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    name: 'The Sky Lounge & Grill',
    distance: '1.1 km',
    title: "Chef's Sunset Tasting Menu",
    price: 'â‚¦22,500',
    was: 'â‚¦45,000',
  },
  {
    image: NEARBY_IMAGES[2],
    imageAlt: 'Serene luxury spa treatment room with essential oil diffusers, bamboo towels, smooth basalt massage stones, and soft tranquil candle lighting',
    badge: '25% OFF',
    name: 'Glow & Serenity Spa',
    distance: '1.4 km',
    title: 'Weekend Glow Facial & Massage',
    price: 'â‚¦18,500',
    was: 'â‚¦25,000',
  },
];

export function MerchantDealsScreen({
  business,
  onBack,
  onOpenDeal,
  onBusinessSetup,
  onShowGrid,
  onClaim,
}: MerchantDealsScreenProps) {
  const [claimed, setClaimed] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const businessName = business?.name?.trim() || 'Business storefront';

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary hover:bg-surface-subtle transition-colors shrink-0"
            >
              <Icon name="arrow_back_ios_new" className="text-[22px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Merchant Details</h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 pr-space-xs">
            <button
              aria-label="Share"
              type="button"
              onClick={() => showToast('Merchant link copied to clipboard')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="share" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative w-full pt-16 pb-safe bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <section className="px-space-md pt-space-md pb-space-xs">
            <div className="bg-surface-subtle rounded-xl p-space-md shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt={`Professional modern logo badge for ${businessName} featuring clean typography, premium hospitality branding, and polished storefront identity`} src={LOGO_URL} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-on-primary">
                    <Icon name="verified" className="text-[11px]" filled />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-space-2xs">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{businessName}</h2>
                  </div>
                  <div className="flex items-center gap-space-2xs mt-0.5 text-text-secondary">
                    <Icon name="star" className="text-[16px] text-tertiary-container" filled />
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">4.8</span>
                    <span className="font-caption text-caption text-text-tertiary">(142 reviews)</span>
                  </div>
                  <div className="flex items-center gap-space-2xs mt-1">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span className="font-label-sm text-label-sm text-badge-discount-text font-medium">3 active offers right now</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-sm pt-space-xs bg-surface-canvas rounded-lg px-space-sm py-space-2xs flex items-center justify-between text-text-secondary">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="near_me" className="text-[16px] text-primary" />
                  <span className="font-caption text-caption font-medium text-text-primary">0.8 km away</span>
                  <span className="text-text-tertiary">â€¢</span>
                  <span className="font-caption text-caption text-text-secondary">Apo, Abuja</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Icon name="restaurant" className="text-[14px]" />
                  <span className="font-caption text-caption font-medium">Dine-in & Takeaway</span>
                </div>
              </div>
            </div>
          </section>

          <section className="px-space-md py-space-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-baseline gap-space-2xs">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Current Deals</h3>
                <span className="font-label-sm text-label-sm text-text-tertiary font-normal">(3)</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="font-caption text-caption text-text-secondary">Exclusive on VEMTAP</span>
                <div className="inline-flex items-center bg-surface-subtle p-0.5 rounded-lg">
                  <button
                    aria-label="List view"
                    type="button"
                    onClick={() => showToast('Already in list view')}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-canvas text-primary shadow-sm transition-colors"
                  >
                    <Icon name="view_list" className="text-[18px]" />
                  </button>
                  <button
                    aria-label="Grid view"
                    type="button"
                    onClick={onShowGrid}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <Icon name="grid_view" className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>

            {DEALS.map((deal, idx) => (
              <article
                key={deal.title}
                onClick={() => onOpenDeal('storefront')}
                role="button"
                className={`bg-surface-canvas rounded-xl shadow-md overflow-hidden mb-space-md active:scale-[0.99] transition-transform ${idx === 0 ? 'cursor-pointer' : ''}`}
              >
                <div className="relative w-full h-48 bg-surface-container">
                  <img className="w-full h-full object-cover" alt={deal.imageAlt} src={deal.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-text-primary/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {deal.badges[0]}
                    </span>
                    {deal.badges[1] && (
                      <span className="bg-surface-canvas text-text-primary font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        {deal.badgeIcons[1] && <Icon name={deal.badgeIcons[1]} className="text-[14px] text-tertiary" />}
                        {deal.badges[1]}
                      </span>
                    )}
                  </div>
                  {deal.rightBadge && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary-container text-on-primary font-label-sm text-label-sm font-medium px-2 py-0.5 rounded-full">
                        {deal.rightBadge}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-on-primary">
                    <p className="font-caption text-caption text-surface-subtle font-medium">{deal.location}</p>
                    <h4 className="font-heading-sm text-heading-sm text-on-primary truncate">{deal.title}</h4>
                  </div>
                </div>
                <div className="p-space-md bg-surface-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-space-2xs">
                        <span className="font-heading-md text-heading-md text-text-primary font-bold">{deal.price}</span>
                        <span className="font-body-md text-body-md text-text-tertiary line-through">{deal.was}</span>
                      </div>
                      <p className="font-caption text-caption text-badge-discount-text font-semibold">{deal.save}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-text-secondary">
                        <Icon name="confirmation_number" className="text-[14px]" />
                        <span className="font-caption text-caption">{deal.voucher}</span>
                      </div>
                      <p className="font-caption text-caption text-text-tertiary">{deal.valid}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim?.(() => setClaimed((prev) => ({ ...prev, [idx]: true })));
                    }}
                    className={`mt-space-sm w-full h-11 flex items-center justify-center gap-space-2xs rounded-xl font-button-primary text-button-primary shadow-md active:scale-[0.98] transition-transform ${
                      claimed[idx]
                        ? 'bg-badge-discount-text text-white'
                        : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    <Icon name={claimed[idx] ? 'done' : 'local_activity'} className="text-[20px]" />
                    <span>{claimed[idx] ? 'Claimed' : 'Claim Deal'}</span>
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-space-md bg-surface-container-low pt-space-lg pb-space-xl px-space-md">
            <div className="mb-space-md">
              <div className="flex items-center gap-space-2xs text-primary mb-1">
                <Icon name="explore" className="text-[18px]" />
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide">Explore Neighborhood</span>
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Deals You May Also Like Nearby</h3>
              <p className="font-caption text-caption text-text-secondary mt-0.5">Top-rated dining & lifestyle spots within 2 km of Urban Grill & Bistro</p>
            </div>
            <div className="flex flex-col gap-space-md">
              {NEARBY.map((item) => (
                <div key={item.name} className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex gap-space-sm">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" alt={item.imageAlt} src={item.image} />
                    <span className={`absolute bottom-1 left-1 font-caption text-caption font-bold px-1.5 py-0.2 rounded ${
                      item.badgeClass || 'bg-badge-discount-bg text-badge-discount-text'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-text-secondary truncate">{item.name}</span>
                        <span className="font-caption text-caption text-text-tertiary">{item.distance}</span>
                      </div>
                      <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate mt-0.5">{item.title}</h4>
                    </div>
                    <div className="flex items-center justify-between mt-space-xs">
                      <div>
                        <span className="font-label-md text-label-md font-bold text-text-primary">{item.price}</span>
                        <span className="font-caption text-caption text-text-tertiary line-through ml-1">{item.was}</span>
                      </div>
                      <button
                        type="button"
                        className="px-space-sm py-1 bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold rounded-lg hover:bg-surface-container active:scale-95 transition-transform"
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-space-lg text-center">
              <p className="font-caption text-caption text-text-secondary">
                Own a business in Apo?
                <button
                  type="button"
                  onClick={onBusinessSetup}
                  className="text-primary font-semibold inline-flex items-center gap-0.5 ml-1 hover:underline"
                >
                  <span>Set up your business on VEMTAP</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
