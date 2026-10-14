import { useEffect, useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useLocation } from '../context/LocationContext';
import { useProfile } from '../context/ProfileContext';
import {
  activeAnnouncements,
  type AnnouncementDestination,
  type AnnouncementTone,
} from './announcementsData';

export type DashboardTarget =
  | 'my-deals'
  | 'orders'
  | 'savings'
  | 'notifications'
  | 'cart'
  | 'scan'
  | 'activity'
  | 'saved'
  | 'subscription'
  | 'dashboard'
  | 'featured-deals';

interface DashboardScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onNavigate: (target: DashboardTarget) => void;
  onShowQR: () => void;
}

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAGcj-Xo05mODE-zuEXBzOj1Bd66jabbptVILeXsmmD5oVopE1Fwkp8fDpBSgxyHTRQSZPWfLiiJb_lKil8T4d89y6I2_fWbPs72szZV1FTvQLJEjYwu0uYhUxCik0UYSqWD6bqxc_-Z8qqi3chAZ2cTdGtmKSQMWxmJeUxHfzLaAuVOiBKzMvDVkZC2pdcK8gXOwEvnPt3xsdT6IiYiEoiJGk_PxXzCqBSL4Z3ezIbxK0iHWEeoMBWQg';

const CAFE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCgCwLd5w58QXLgV11MHD52EEti1eL21CVWe5XjaydFi7gB0n_HlN0ZRXV3yob4ZVn5VXviRWWZGYsv1AaFBYmLz5MGyZoBIQR2PaZJDI_Hy-6Q8Q2qX_UNm3TBcOS5Clrs17aHV0AbIlu45JooU-HWsPtb3bHzQbC2hp0eLB-F0K_mX7KOrm8At7tLg-OaWWH65X7PtLDGbNibqkIdLveIrO70jZrzaDghvLUUoFza5ZW1bMN8Ce0DQw';

const BURGER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCKUS0WwZYhFtl0KRQ8cL8Hr770L0Ls4JAHNUXCVRDplZ9ou9wSYBgO_j_kIOloOjjEEcnB1-3pwPxRYDmFguixph8sTmC3ix2crAreunKt8kxZmmJ2-MTt99BHKZGGUOTaQPFtYaNOrjKiOOvDDFh9FiBELRLLUsp7Is1PkB94raBEKxQrtZLHBHYhA2sd18QY2vVcn5opY7jym0RXQtI_pUdHhMvtm_R32Bo0CjoRtfAlGA7qfZPp5w';

const SPA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAUht6A5A8VJ2HVlciOxmOfSNjrxImixN6H4ySSvfeIstmp4yModG1rl0m4ECsbrxVAV8pTA38yVQ8e2us9V0WqpxW9ApXdSL7mq3OZRdaY6o0S4LIcXDDtbHQMWJEL2Sy5nylvEMstB6f0RmvU5bDO1WyOQeSqrvRpAV3nvIpFumqvEsCGt1kwrVPQ5vpREyevCJrPxEitPQF-pjFYRAGrKYxjwVhamRnG5lIlaXpHwoUcODTXMFjgJQ';

const BAKERY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQA9EUANK-qSWLc0YDbdaY7FBQTZMqGaJgfFAg6jdO2ZYEMjGP3nW-9BS4AE72LDZu_HKJ1fK300URqAnhtBqtb3rbJpKTy5gRvie_6Agz1LUsNvBrHp5XSpKFsM6k9UpmFRhScPALBdM44BCq7FpqkVzk_xeJg_VopE1LSJN6_oZOUXdkApMCUNwKd3N0EzBzGE5AbSkQt5ccJkn7Pxpz3FgY48x137irv2I-7lq7RLAetVnPqZCIXw';

const ROOFTOP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeAtQWLIyjDZGAe_fGVP6-PK-Lk91gGmK43js0O1SG0JI8juksx-Y5XG-gKRg-1EgZYzOc3jX33vXfe-mpI7w313488dgKy5JIV8SMnK7-0Ei5EH5KRDURZq289Tt4LG6hhlrwFy8dhbVG9Ber29ljbzVK0Ov5hUoyRSnPB_WMxFJ-yqeKTY_VwxLq02F9hmq2X8QqN3nBgucmRXuu4h8ytG-Jrb1Ncfl-FAvp74kGc9Pmoc6FG8yhBA';

interface HeroSlide {
  image: string;
  pill: string;
  title: string;
  subtitle: string;
  cta?: string;
  destination?: AnnouncementDestination;
}

const TONE_LABEL: Record<AnnouncementTone, string> = {
  promo: 'Promo',
  info: 'Update',
  upgrade: 'Upgrade',
  alert: 'Alert',
};

const HERO_SLIDES: HeroSlide[] = [
  {
    image: CAFE_IMG,
    pill: 'Weekend Special',
    title: 'Weekend Deals Are Here',
    subtitle: 'Explore curated flash discounts from top-rated dining spots near Apo.',
  },
  {
    image: SPA_IMG,
    pill: 'Wellness Week',
    title: 'Glow Season at the Spa',
    subtitle: 'Up to 25% off facials and sauna rituals at Glow & Serenity Spa this week.',
  },
  {
    image: ROOFTOP_IMG,
    pill: 'After Work',
    title: 'Sunset Rooftop Nights',
    subtitle: 'Cocktails and small plates with skyline views at The Sky Lounge.',
  },
];

interface RecommendedDeal {
  id: string;
  image: string;
  imageAlt: string;
  badge: string;
  badgeClass: string;
  distance: string;
  business: string;
  item: string;
  price: string;
  was: string;
}

const RECOMMENDED: RecommendedDeal[] = [
  {
    id: 'bakery',
    image: BAKERY_IMG,
    imageAlt:
      'Golden crisp freshly baked artisanal croissants and pain au chocolat pastries neatly arranged in a wicker basket in a high end Abuja French bakery cafe.',
    badge: '15% OFF',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: '0.5 km away',
    business: 'Artisan Bakery & Cafe',
    item: 'Sourdough & Pastries Combo',
    price: '₦4,500',
    was: '₦5,300',
  },
  {
    id: 'rooftop',
    image: ROOFTOP_IMG,
    imageAlt:
      'Chic rooftop lounge in Abuja at golden hour sunset with modern cocktail glasses garnished with herbs, appetizers and city skyline views.',
    badge: 'BOGO FREE',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    distance: '1.2 km away',
    business: 'The Sky Lounge',
    item: 'Cocktails & Small Plates',
    price: '₦8,000',
    was: '₦16,000',
  },
];

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading-sm text-heading-sm text-on-surface">{title}</h2>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center"
        >
          {action}
          <Icon name="chevron_right" className="text-[16px]" />
        </button>
      )}
    </div>
  );
}

export function DashboardScreen({ onTab, onNavigate, onShowQR }: DashboardScreenProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const [hero, setHero] = useState(0);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const { fullName } = useProfile();

  const firstName = fullName.trim().split(/\s+/)[0] || 'there';

  // Admin-configured announcements rotate in the dashboard banner; when the
  // (local stand-in for `GET /announcements`) list is empty we keep the
  // editorial slides so the banner never renders blank.
  const banners = useMemo<HeroSlide[]>(() => {
    const active = activeAnnouncements();
    if (active.length === 0) return HERO_SLIDES;
    return active.map((item) => ({
      image: item.image || CAFE_IMG,
      pill: TONE_LABEL[item.tone],
      title: item.title,
      subtitle: item.message,
      cta: item.cta,
      destination: item.destination,
    }));
  }, []);

  const goToDestination = (destination?: AnnouncementDestination) => {
    if (!destination) {
      onTab('deals');
      return;
    }
    if (destination === 'deals' || destination === 'featured') onTab('deals');
    else onNavigate(destination === 'dashboard' ? 'dashboard' : destination);
  };

  useEffect(() => {
    const id = window.setInterval(() => setHero((current) => (current + 1) % banners.length), 5000);
    return () => window.clearInterval(id);
  }, [banners.length]);

  const slide = banners[hero % banners.length] ?? banners[0];

  const toggleFav = (id: string) => setFavs((current) => ({ ...current, [id]: !current[id] }));

  return (
    <AppScreen>
      <main className="flex flex-col w-full gap-space-lg pb-28">
        <section className="flex items-center justify-between px-margin pt-space-xs">
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight truncate">
              Hello, {firstName} 👋
            </h1>
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors text-left mt-0.5"
            >
              <Icon name="location_on" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md text-text-secondary font-medium">
                {district}, {city}
              </span>
              <Icon name="expand_more" className="text-[16px] text-text-tertiary" />
            </button>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Cart"
              type="button"
              onClick={() => onNavigate('cart')}
              className="relative w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shadow-sm active:scale-95"
            >
              <Icon name="shopping_bag" className="text-[20px]" />
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-primary-container text-on-primary-container font-caption text-[10px] font-bold flex items-center justify-center leading-none">
                2
              </span>
            </button>
            <button
              aria-label="Notifications"
              type="button"
              onClick={() => onNavigate('notifications')}
              className="relative w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shadow-sm active:scale-95"
            >
              <Icon name="notifications" className="text-[20px]" />
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-error text-on-error font-caption text-[10px] font-bold flex items-center justify-center leading-none">
                3
              </span>
            </button>
            <button
              aria-label="Account"
              type="button"
              onClick={() => onTab('account')}
              className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm bg-surface-container-highest active:scale-95 transition-transform"
            >
              <img className="w-full h-full object-cover" alt="Zainab Ahmed" src={AVATAR} />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-badge-discount-text ring-2 ring-surface" />
            </button>
          </div>
        </section>

        <section className="px-margin">
          <div className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-sm">
            <div
              className="relative h-48 w-full overflow-hidden bg-cover bg-center flex flex-col justify-between p-space-md"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/70 to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-caption text-caption font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                  <Icon name="local_fire_department" className="text-tertiary-container text-[14px]" filled />
                  FEATURED CAMPAIGN
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-canvas/80 text-text-primary font-caption text-[11px] font-semibold">
                  {slide.pill}
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-space-2xs">
                <h2 className="font-heading-md text-heading-md text-on-primary font-bold leading-tight">{slide.title}</h2>
                <p className="font-body-md text-caption text-surface-container-highest line-clamp-1">{slide.subtitle}</p>
                <div className="flex items-center justify-between mt-space-2xs">
                  <button
                    type="button"
                    onClick={() => goToDestination(slide.destination)}
                    className="h-9 px-space-md rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary flex items-center gap-1 shadow-md hover:bg-primary transition-colors active:scale-95"
                  >
                    <span>{slide.cta ?? 'Explore Deals'}</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                  <div className="flex items-center gap-1.5 pr-1">
                    {banners.map((item, index) => (
                      <button
                        key={`${item.title}-${index}`}
                        type="button"
                        aria-label={`Slide ${index + 1}`}
                        onClick={() => setHero(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === hero ? 'w-5 bg-surface-canvas' : 'w-1.5 bg-surface-canvas/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">My Activity</h2>
            <span className="font-caption text-caption text-text-tertiary">Real-time sync</span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs">
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-canvas shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary-container mb-space-2xs">
                <Icon name="confirmation_number" className="text-[18px]" />
              </div>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">3</span>
              <span className="font-caption text-caption text-text-secondary truncate">Active Deals</span>
            </div>
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-canvas shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary mb-space-2xs">
                <Icon name="stars" className="text-[18px]" filled />
              </div>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">2,450</span>
              <span className="font-caption text-caption text-text-secondary truncate">VEM Points</span>
            </div>
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-canvas shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text mb-space-2xs">
                <Icon name="account_balance_wallet" className="text-[18px]" />
              </div>
              <span className="font-heading-md text-heading-md text-badge-discount-text font-bold">₦24.5k</span>
              <span className="font-caption text-caption text-text-secondary truncate">Saved Total</span>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-xs">
          <h2 className="font-label-md text-label-md text-text-secondary font-semibold uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-space-xs">
            <button
              type="button"
              onClick={() => onTab('deals')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container mb-1">
                <Icon name="explore" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Explore</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('savings')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed-variant mb-1">
                <Icon name="featured_seasonal_and_gifts" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Rewards</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scan')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-1">
                <Icon name="qr_code_scanner" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Scan QR</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-1">
                <Icon name="history" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Activity</span>
            </button>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Your Active Deals</h2>
              <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container font-caption text-[11px] font-bold flex items-center justify-center">
                2
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-deals')}
              className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center"
            >
              View All My Deals
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          </div>

          <div className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex gap-space-sm min-w-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                  <img className="w-full h-full object-cover" alt="Prime lunch combo" src={BURGER_IMG} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption font-semibold text-text-secondary flex items-center gap-1 truncate">
                    <Icon name="storefront" className="text-primary text-[14px]" />
                    Urban Grill &amp; Bistro
                  </span>
                  <h3 className="font-button-primary text-button-primary text-text-primary truncate">
                    20% Off Prime Lunch Combo
                  </h3>
                  <span className="font-caption text-caption text-tertiary flex items-center gap-1 mt-0.5 font-medium">
                    <Icon name="timer" className="text-[14px]" />
                    Expires in 2 days
                  </span>
                </div>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold shrink-0">
                Ready to Redeem
              </span>
            </div>
            <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle">
              <div className="flex flex-col">
                <span className="font-caption text-[10px] text-text-tertiary uppercase tracking-wider">Pass Code</span>
                <span className="font-label-md text-label-md font-bold text-on-surface tracking-wider">VT-48F261</span>
              </div>
              <button
                type="button"
                onClick={onShowQR}
                className="h-9 px-space-md rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Icon name="qr_code_2" className="text-[18px]" />
                <span>Show QR</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex gap-space-sm min-w-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                  <img className="w-full h-full object-cover" alt="Spa treatment room" src={SPA_IMG} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption font-semibold text-text-secondary flex items-center gap-1 truncate">
                    <Icon name="spa" className="text-primary text-[14px]" />
                    Glow &amp; Serenity Spa
                  </span>
                  <h3 className="font-button-primary text-button-primary text-text-primary truncate">
                    Deep Hydration Facial &amp; Manicure
                  </h3>
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                    <Icon name="event_available" className="text-[14px] text-primary" />
                    Thu, Oct 17 • 1:15 PM
                  </span>
                </div>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary-container font-caption text-[11px] font-semibold shrink-0">
                Confirmed
              </span>
            </div>
            <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle">
              <div className="flex items-center gap-2">
                <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
                <span className="font-caption text-caption text-text-secondary font-medium">Slot Reserved</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="h-9 px-space-md rounded-xl bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center gap-1 shadow-sm hover:bg-surface-container-highest transition-colors active:scale-95"
              >
                <span>View Pass</span>
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
          </div>
        </section>

        <section className="px-margin">
          <div className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <Icon name="workspace_premium" className="text-tertiary-container text-[20px]" filled />
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Your Rewards</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center"
              >
                View Rewards
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-surface-subtle p-space-sm rounded-xl">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Tier Status</span>
                <span className="font-button-primary text-button-primary text-text-primary">Gold Member • Tier 3</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-caption text-caption text-text-tertiary">Balance</span>
                <span className="font-heading-sm text-heading-sm text-tertiary-container font-bold">2,450 pts</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-caption text-caption text-text-secondary">
                <span>Progress to Platinum</span>
                <span className="font-semibold text-text-primary">2,450 / 3,000 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '81%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-2xs text-text-secondary">
              <span className="font-caption text-caption flex items-center gap-1">
                <Icon name="redeem" className="text-badge-discount-text text-[16px]" />
                <strong>3 rewards</strong> available to unlock right now
              </span>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="text-primary-container font-label-sm text-label-sm font-semibold hover:underline"
              >
                Claim
              </button>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-sm">
          <SectionHeader title="Recent Activity" action="View Activity" onAction={() => onNavigate('activity')} />
          <div className="rounded-xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden">
            <div className="flex items-center justify-between p-space-sm hover:bg-surface-subtle transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
                  <Icon name="local_activity" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                    Deal Claimed
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Urban Grill &amp; Bistro • Today, 10:42 AM
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-badge-discount-text shrink-0">+100 pts</span>
            </div>

            <div className="flex items-center justify-between p-space-sm hover:bg-surface-subtle transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                  <Icon name="qr_code" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                    In-Store QR Redemption
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Sole District Boutique • Yesterday, 4:15 PM
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-label-sm text-label-sm font-bold text-badge-discount-text">Saved ₦4,000</span>
                <span className="font-caption text-[11px] text-text-tertiary">+200 pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-space-sm hover:bg-surface-subtle transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed-variant shrink-0">
                  <Icon name="rate_review" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                    Review Submitted
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Cafe Neo Artisan • Oct 14, 2:30 PM
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-badge-discount-text shrink-0">+50 pts</span>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-sm">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Deals You May Like</h2>
              <Icon name="auto_awesome" className="text-primary-container text-[20px]" />
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Based on your visits and dining taste in Apo
            </p>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            {RECOMMENDED.map((deal) => (
              <div key={deal.id} className="flex flex-col rounded-xl bg-surface-canvas shadow-sm overflow-hidden group">
                <div className="relative h-28 w-full bg-surface-container overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onTab('deals')}
                    className="block w-full h-full"
                    aria-label={`Open ${deal.business}`}
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={deal.imageAlt}
                      src={deal.image}
                    />
                  </button>
                  <span
                    className={`absolute top-2 left-2 px-space-xs py-0.5 rounded-full font-caption text-[11px] font-bold shadow-sm ${deal.badgeClass}`}
                  >
                    {deal.badge}
                  </span>
                  <button
                    aria-label="Favorite"
                    type="button"
                    onClick={() => toggleFav(deal.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center justify-center text-on-surface shadow-sm"
                  >
                    <Icon name={favs[deal.id] ? 'favorite' : 'favorite_border'} className="text-[16px]" filled />
                  </button>
                </div>
                <div className="p-space-xs flex flex-col flex-grow justify-between gap-space-2xs">
                  <div>
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Icon name="location_on" className="text-[12px] text-primary" />
                      <span className="font-caption text-[11px] truncate">{deal.distance}</span>
                    </div>
                    <h3 className="font-button-secondary text-button-secondary text-text-primary font-semibold truncate mt-0.5">
                      {deal.business}
                    </h3>
                    <p className="font-caption text-caption text-text-secondary line-clamp-1">{deal.item}</p>
                  </div>
                  <div className="flex items-center justify-between pt-space-2xs">
                    <div className="flex items-baseline gap-1">
                      <span className="font-button-primary text-button-primary text-text-primary">{deal.price}</span>
                      <span className="font-caption text-[11px] text-text-tertiary line-through">{deal.was}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onTab('deals')}
                      aria-label={`Add ${deal.business} deal`}
                      className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary-container flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onTab('deals')}
            className="w-full h-12 rounded-xl bg-surface-canvas text-primary-container font-button-primary text-button-primary flex items-center justify-center gap-1.5 shadow-sm hover:bg-surface-container-low transition-colors mt-space-xs active:scale-[0.99]"
          >
            <span>Explore More Deals in Apo</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </section>

        <div className="px-margin flex flex-col items-center justify-center gap-1 text-center mt-2">
          <div className="flex items-center gap-1 text-text-tertiary">
            <Icon name="verified_user" className="text-[14px] text-primary" />
            <span className="font-caption text-caption">VEMTAP Verified Local Guarantee</span>
          </div>
          <span className="font-caption text-[11px] text-text-tertiary">One Tap. Lifetime Customer.</span>
        </div>
      </main>

      <LocationRadiusModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onApply={setLocation}
        district={district}
        radius={radius}
      />
      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
