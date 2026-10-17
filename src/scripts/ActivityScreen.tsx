import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { downloadCsv } from '../utils/exportCsv';

interface ActivityScreenProps {
  onBack: () => void;
  onOpenReceipt: () => void;
  onWriteReview: () => void;
  onOpenOrders: () => void;
  onOpenService: () => void;
  onBrowse: () => void;
}

type ActivityTab = 'all' | 'recent' | 'visits' | 'reviews';

const TABS: Array<{ key: ActivityTab; label: string; icon: string }> = [
  { key: 'all', label: 'All Activity', icon: 'dynamic_feed' },
  { key: 'recent', label: 'Recently Viewed', icon: 'history' },
  { key: 'visits', label: 'Visits & Claims', icon: 'receipt_long' },
  { key: 'reviews', label: 'My Reviews', icon: 'rate_review' },
];

const URBAN_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBeyRMDHoGyxIEomHPy5Hyw-daupqu4GkwSvioxqtJRZU2gX1m5f75Ee5yYGHkRBN5yCAdsyzFZTQ_qLvO7Ear6acv8qKRwY2BFyGCRLE4AihxR_XZNAnDoa8owrMvOCgNgMRZbEjzPrvZymIfV2bk7ZmB1LQ4Awu16lcTgG0MsdHAEb_ijhfpkdRVUAWAh9ZpfqrMmgq8JyLlHkDFJEBuLg2L1v96JFP-yJr-wfXRtPp4dE1fXwFvV-w';
const KNEAD_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvDFzjPTW7THzDxxP8IVliLHcPT6Y2Al-pY3AiNUPiO3WRYJx1_U3sqcu_NxV_eP3vN4f2O6nNA54AYOlizMXvcjM4jtmLLJtbUzGbwBlrb_rPIXFPh6NfHStndowyBjN4NrI-v1R0fTBkzSGhDjbZtYE39OlF0Vt8vkhQlGmsmG8HwhStTYHb2jGx4f9XRrxdtLolxrq6yUay4tV-4TtUJkjWyqfJ-jBznPiltwdm0qGwTqCPFim4zQ';
const SPA_CARD_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2h7p6DFv-Oga8QJftzzpUcRbbQa_7jJkasofoJi263Fht8mnA-xeMQR4qc9iMr_M5fqJ5hulmV6dfrmcWryI5FmVh-bnISd7VSIC-FnFwPEI85QfKMq9tN300ZIgvQJ4BHp1DmyaQICaNo2477nt-BrTKQ3fBO1uUeMtXNptwxoPHr_BzIQZ6vB03JilD6PYMw1Y_D7Y-Pw3-BU5QPOzttpKOXCnbcf9QVQhzzBdte00eUwrw4FaZeA';
const SKY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAU5MXjmprxvQVRPHcI0CmYQQO93i-jnVZGxmkcoFfTfHKa2oyJZPzla9XJA3cpXd2TvrJdDeTG9DGikRvFgSQ7-8s7Pe1FYrwqpCL1n5qJB0QkihwBV398yKj2s2R-agoRqbkYgia-TyTlJTMGnrlwJ9jvliOQaqhGE-i91x8ZsyUS0LL0o0ksX-DodX6iU-gtnD3Owebyip9u9RFfS8zpxu2jO4VHELx5t3RMpmDIfFEfnr9OTpLxVw';
const CAFE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC1hvuQIUSpBEAzlnfkCFejYhI1L9msQtY6ni5dEaZNMKinq1gQTc9pnjzZvQi3nA6bywjxxFXEcxfEiSS4fc2kcG5JDNo6vPPKCSte7XTHIYuj9T63HObE7GviiKzFoi1ysuGvLZnvA7LdBtsy9FW_aZ8kI5rRI0LZYl2pIKHUEg9iK_Sr-On4MGYPdhFDMYFphFiik5xshfdTOZEn2KnRQMJdpcS-mqe72E-FN0GrUviXVOSESPwidw';

const RECENT_CARDS = [
  {
    id: 'spa-card',
    image: SPA_CARD_IMG,
    alt: 'Serene luxury spa treatment room with warm stone massage bed aromatic steam candlelit relaxation atmosphere',
    badge: 'Save 25%',
    merchant: 'Glow & Serenity Spa',
    title: 'Weekend Glow Facial & Sauna',
    price: '₦18,500',
    was: '₦24,500',
    special: null as string | null,
    favorite: true,
    action: 'service' as const,
  },
  {
    id: 'sky-card',
    image: SKY_IMG,
    alt: 'Exquisite five course fine dining plated dessert with edible flowers artistic sauce reduction luxury rooftop restaurant night view',
    badge: '50% OFF',
    merchant: 'The Sky Lounge',
    title: "Chef's 5-Course Tasting Menu",
    price: '₦24,500',
    was: '₦49,000',
    special: null as string | null,
    favorite: false,
    action: 'browse' as const,
  },
  {
    id: 'cafe-card',
    image: CAFE_IMG,
    alt: 'Bottled specialty cold brew coffee on wooden coffeehouse table with fresh ice droplets and condensed glass reflections',
    badge: null as string | null,
    merchant: 'Cafe Neo',
    title: 'Cold Brew Bottle (1L)',
    price: '₦4,500',
    was: null as string | null,
    special: 'Special Edition',
    favorite: false,
    action: 'browse' as const,
  },
];

// Backs the "Export Activity (CSV)" button — mirrors the visit feed shown above.
const ACTIVITY_LOG: Array<{ type: string; merchant: string; detail: string; date: string; location: string; value: string }> = [
  {
    type: 'Redemption',
    merchant: 'Urban Grill & Bistro',
    detail: 'Redeemed 20% Off Prime Lunch',
    date: 'Oct 15, 2024 • 1:15 PM',
    location: 'Apo Blvd',
    value: 'Saved ₦4,200',
  },
  {
    type: 'Visit',
    merchant: 'The Daily Knead Bakery',
    detail: 'Purchased 2x Artisan Loaves',
    date: 'Oct 11, 2024',
    location: 'Wuse II',
    value: '',
  },
];

export function ActivityScreen({
  onBack,
  onOpenReceipt,
  onWriteReview,
  onOpenOrders,
  onOpenService,
  onBrowse,
}: ActivityScreenProps) {
  const [tab, setTab] = useState<ActivityTab>('all');
  const [cleared, setCleared] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(RECENT_CARDS.filter((card) => card.favorite).map((card) => card.id));
  const [helpfulCount, setHelpfulCount] = useState(12);
  const [helpfulOn, setHelpfulOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const toggleFavorite = (id: string, title: string) => {
    setFavorites((current) => {
      if (current.includes(id)) {
        showToast(`Removed "${title}" from favorites`);
        return current.filter((item) => item !== id);
      }
      showToast(`Saved "${title}" to favorites`);
      return [...current, id];
    });
  };

  const showVisits = !cleared && (tab === 'all' || tab === 'visits');
  const showRecent = !cleared && (tab === 'all' || tab === 'recent');
  const showReviews = !cleared && (tab === 'all' || tab === 'reviews');

  const tabClass = (key: ActivityTab) =>
    key === tab
      ? 'px-4 h-9 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0'
      : 'px-4 h-9 rounded-full bg-surface-container-lowest text-text-secondary font-label-sm text-label-sm hover:text-on-surface flex items-center gap-1.5 active:scale-95 transition-all shrink-0';

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs flex-1 min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate pr-space-xs">User Activity</h1>
          </div>
          <div className="flex items-center gap-space-xs pr-space-xs shrink-0">
            <button
              aria-label="More options"
              type="button"
              onClick={() => showToast('Activity options: export, privacy & help')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pb-space-2xl pt-space-md gap-space-lg">
        <div className="flex items-center justify-between pt-space-xs gap-space-xs">
          <div className="flex items-center gap-space-2xs text-text-secondary min-w-0">
            <Icon name="verified_user" className="text-[18px] text-primary shrink-0" />
            <span className="font-label-sm text-label-sm text-text-secondary truncate">Lifetime Verified Activity</span>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              type="button"
              onClick={() => showToast('Showing October 2024 activity')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-text-secondary hover:bg-surface-container hover:text-on-surface transition-all active:scale-95"
            >
              <Icon name="calendar_month" className="text-[16px] text-primary" />
              <span className="font-label-sm text-label-sm font-semibold">Oct 2024</span>
              <Icon name="expand_more" className="text-[14px]" />
            </button>
            <button
              aria-label="Filter activity"
              type="button"
              onClick={() => showToast('Filters: showing all activity types')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-text-secondary hover:text-on-surface active:scale-95 transition-all"
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low p-space-md shadow-sm space-y-space-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm text-text-secondary tracking-wide uppercase font-semibold">
              Your Local Footprint
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <Icon name="trending_up" className="text-[12px]" /> Top 5% Saver
            </span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs pt-space-2xs">
            <div className="flex flex-col p-space-xs rounded-lg bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-1 text-primary mb-1">
                <Icon name="account_balance_wallet" className="text-[16px]" />
              </div>
              <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight font-bold">₦48,500</span>
              <span className="font-caption text-caption text-text-tertiary mt-0.5">Total Saved</span>
            </div>
            <div className="flex flex-col p-space-xs rounded-lg bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-1 text-primary mb-1">
                <Icon name="local_activity" className="text-[16px]" />
              </div>
              <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight font-bold">14</span>
              <span className="font-caption text-caption text-text-tertiary mt-0.5">Deals Claimed</span>
            </div>
            <div className="flex flex-col p-space-xs rounded-lg bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-1 text-primary mb-1">
                <Icon name="storefront" className="text-[16px]" />
              </div>
              <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight font-bold">8</span>
              <span className="font-caption text-caption text-text-tertiary mt-0.5">Spots Visited</span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-space-xs min-w-max" role="tablist">
            {TABS.map((item) => (
              <button key={item.key} type="button" role="tab" onClick={() => setTab(item.key)} className={tabClass(item.key)}>
                <Icon name={item.icon} className="text-[16px]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {cleared ? (
          <div className="flex flex-col items-center justify-center text-center py-space-xl px-space-md gap-space-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <Icon name="history" className="text-[32px]" />
            </div>
            <div className="flex flex-col gap-1 max-w-[280px]">
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Activity history cleared</h3>
              <p className="font-body-md text-body-md text-text-secondary">
                Your local activity log has been removed from this device. New visits and claims will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-space-xl">
            {showVisits && (
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="store" className="text-[20px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Recent Store Visits &amp; Redemptions
                    </h2>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">2 this month</span>
                </div>

                <article className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex items-start gap-space-sm min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                        <img className="w-full h-full object-cover" src={URBAN_IMG} alt="Urban Grill & Bistro" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-label-md text-label-md text-text-primary font-bold truncate">
                            Urban Grill &amp; Bistro
                          </h3>
                          <Icon name="verified" className="text-[16px] text-primary shrink-0" />
                        </div>
                        <p className="font-label-sm text-label-sm text-primary font-semibold truncate mt-0.5">
                          Redeemed 20% Off Prime Lunch
                        </p>
                        <div className="flex items-center gap-1.5 text-text-tertiary font-caption text-caption mt-1">
                          <span>Oct 15, 2024 • 1:15 PM</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 truncate">
                            <Icon name="location_on" className="text-[12px]" /> Apo Blvd
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                      Saved ₦4,200
                    </span>
                  </div>
                  <div className="pt-space-xs flex items-center justify-end gap-space-xs">
                    <button
                      type="button"
                      onClick={onOpenReceipt}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-medium hover:bg-surface-container hover:text-on-surface active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="receipt" className="text-[16px]" />
                      <span>View Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={onWriteReview}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="edit_note" className="text-[16px]" />
                      <span>Write Review</span>
                    </button>
                  </div>
                </article>

                <article className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-xs hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex items-start gap-space-sm min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                        <img className="w-full h-full object-cover" src={KNEAD_IMG} alt="The Daily Knead Bakery" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-label-md text-label-md text-text-primary font-bold truncate">
                            The Daily Knead Bakery
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium shrink-0">
                            Visited
                          </span>
                        </div>
                        <p className="font-label-sm text-label-sm text-text-secondary truncate mt-0.5">
                          Purchased 2x Artisan Loaves
                        </p>
                        <div className="flex items-center gap-1.5 text-text-tertiary font-caption text-caption mt-1">
                          <span>Oct 11, 2024</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 truncate">
                            <Icon name="location_on" className="text-[12px]" /> Wuse II
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      aria-label="Order details"
                      type="button"
                      onClick={onOpenOrders}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-on-surface active:scale-95 transition-transform shrink-0"
                    >
                      <Icon name="chevron_right" className="text-[20px]" />
                    </button>
                  </div>
                </article>
              </section>
            )}

            {showRecent && (
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="visibility" className="text-[20px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Recently Viewed Deals &amp; Products
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFavorites([]);
                      showToast('Cleared viewed favorites');
                    }}
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex gap-space-sm overflow-x-auto pb-space-xs -mx-margin px-margin no-scrollbar">
                  {RECENT_CARDS.map((card) => (
                    <div
                      key={card.id}
                      className="w-60 shrink-0 rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      <div className="relative h-28 w-full bg-surface-container">
                        <img className="w-full h-full object-cover" src={card.image} data-alt={card.alt} alt={card.alt} />
                        {card.badge && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                            {card.badge}
                          </span>
                        )}
                        <button
                          aria-label="Favorite deal"
                          type="button"
                          onClick={() => toggleFavorite(card.id, card.title)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-canvas/90 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Icon
                            name="favorite"
                            className={`text-[16px] ${favorites.includes(card.id) ? 'text-primary' : 'text-text-tertiary'}`}
                            filled={favorites.includes(card.id)}
                          />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => (card.action === 'service' ? onOpenService() : onBrowse())}
                        className="p-space-xs flex-1 flex flex-col justify-between text-left"
                      >
                        <div>
                          <p className="font-caption text-caption text-text-tertiary truncate">{card.merchant}</p>
                          <h3 className="font-label-md text-label-md text-text-primary font-bold line-clamp-1 mt-0.5">
                            {card.title}
                          </h3>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="font-label-md text-label-md text-primary font-bold">{card.price}</span>
                          {card.was && <span className="font-caption text-caption text-text-tertiary line-through">{card.was}</span>}
                          {card.special && (
                            <span className="font-caption text-caption text-badge-discount-text font-semibold">
                              {card.special}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showReviews && (
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="reviews" className="text-[20px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">My Reviews &amp; Ratings</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('You have 3 verified reviews')}
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  >
                    See All (3)
                  </button>
                </div>
                <article className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-xs">
                  <div className="flex items-start justify-between gap-space-xs">
                    <div>
                      <h3 className="font-label-md text-label-md font-bold text-text-primary">Glow &amp; Serenity Spa</h3>
                      <p className="font-caption text-caption text-text-tertiary">Reviewed on Sep 28, 2024</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full">
                      <Icon name="star" className="text-[15px]" filled />
                      <span className="font-label-sm text-label-sm font-bold">5.0</span>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    “Amara is incredible, the facial was soothing and booking through VEMTAP saved ₦5,000 without
                    hassle! Will definitely be visiting again.”
                  </p>
                  <div className="pt-space-2xs flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setHelpfulOn((current) => !current);
                          setHelpfulCount((current) => (helpfulOn ? current - 1 : current + 1));
                        }}
                        className={`flex items-center gap-1 font-caption text-caption font-semibold transition-all active:scale-95 ${
                          helpfulOn ? 'text-primary' : 'text-text-tertiary hover:text-primary'
                        }`}
                      >
                        <Icon name="thumb_up" className="text-[16px]" filled={helpfulOn} />
                        <span>Helpful ({helpfulCount})</span>
                      </button>
                      <span className="text-text-tertiary">•</span>
                      <span className="inline-flex items-center gap-1 text-badge-discount-text font-caption text-caption font-medium">
                        <Icon name="verified" className="text-[14px]" /> Verified Claim
                      </span>
                    </div>
                    <button
                      aria-label="Review options"
                      type="button"
                      onClick={() => showToast('Review options: edit, share or report')}
                      className="text-text-tertiary hover:text-on-surface"
                    >
                      <Icon name="more_horiz" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="mt-space-xs p-space-xs rounded-lg bg-surface-container-low flex items-start gap-space-xs">
                    <Icon name="reply" className="text-primary text-[18px] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-sm text-label-sm font-bold text-text-primary">
                          Glow &amp; Serenity Spa
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">Merchant Reply</span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary">
                        “Thank you so much! We are thrilled Amara gave you a stellar experience. See you soon!”
                      </p>
                    </div>
                  </div>
                </article>
              </section>
            )}
          </div>
        )}

        <div className="pt-space-md pb-space-lg flex flex-col items-center justify-center space-y-space-xs">
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              onClick={() => {
                downloadCsv(
                  'vemtap_activity_log',
                  ['Type', 'Merchant', 'Detail', 'Date', 'Location', 'Value'],
                  ACTIVITY_LOG.map((entry) => [entry.type, entry.merchant, entry.detail, entry.date, entry.location, entry.value]),
                );
                showToast('Activity CSV export downloaded');
              }}
              className="flex items-center gap-1 font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors active:scale-95"
            >
              <Icon name="download" className="text-[16px]" />
              <span>Export Activity (CSV)</span>
            </button>
            <span className="text-outline-variant">•</span>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 font-label-sm text-label-sm text-error hover:opacity-80 transition-colors active:scale-95"
            >
              <Icon name="delete_outline" className="text-[16px]" />
              <span>Clear History</span>
            </button>
          </div>
          <p className="font-caption text-caption text-text-tertiary text-center max-w-xs">
            Activity log is securely synced with your encrypted VEMTAP wallet and hyper-local merchant ledger.
          </p>
        </div>
      </main>

      {confirmClear && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmClear(false);
          }}
        >
          <div className="w-full max-w-lg bg-surface rounded-t-2xl p-space-lg shadow-2xl flex flex-col space-y-space-md pb-safe">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
                  <Icon name="delete_outline" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">Clear activity history?</h3>
              </div>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setConfirmClear(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              This removes your visits, claims, and recently viewed log from this device. Your reviews and savings
              ledger stay untouched.
            </p>
            <div className="flex gap-space-xs">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary active:bg-surface-container transition-colors"
              >
                Keep History
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClear(false);
                  setCleared(true);
                  showToast('Activity history cleared');
                }}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-button-secondary text-button-secondary font-semibold active:scale-[0.98] transition-transform"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
