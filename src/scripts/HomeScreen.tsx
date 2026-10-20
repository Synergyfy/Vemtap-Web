import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { useLocation } from '../context/LocationContext';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { URBAN_PRODUCTS } from './catalogueData';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

const IMAGES = {
  dining:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiY_iENnE0_gULcgR0NDCqk6Kq3rgCPj9DF359T-LyeFJWB7z4VMHdARNHQeTTxaT4MiH_xMPLODviqw6_g4l50CwXnKwBrq6CQIuKBPTJ5PaasBnvsfniUvz2Oy9Vn5eguCjJ_CuTMKeUodWVLfHa5QV5UaTWJOtOFkXuzN4cYIDGKMq-sweeOEBfus9N8WLC_OkWiUkIw3S5qhnVtMq670laaL_UzGfesQ-k5inJfjattlJVEofGA',
  burger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiY_iENnE0_gULcgR0NDCqk6Kq3rgCPj9DF359T-LyeFJWB7z4VMHdARNHQeTTxaT4MiH_xMPLODviqw6_g4l50CwXnKwBrq6CQIuKBPTJ5PaasBnvsfniUvz2Oy9Vn5eguCjJ_CuTMKeUodWVLfHa5QV5UaTWJOtOFkXuzN4cYIDGKMq-sweeOEBfus9N8WLC_OkWiUkIw3S5qhnVtMq670laaL_UzGfesQ-k5inJfjattlJVEofGA',
  sneakers:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD0uBBlT-uAfF0xrF1R99Fygm4HWKLPrmL3WWpZt71dQGS3NkBlOQ4kU1osW9GuFYORifIsd4FKPUSG5g0t3TLX3YCVkdzeSvXt8QGqexEQ1P-sIUWyEygPSrdpBw8m264KPQ8HPkV4WdVLSEFg85dV-lo5N986QTpH7FkxewwUwqnLessEGS_HR1U8_BQumYABPPSiKY4F_J8kKkA5DPYDJSiPWrecAlMg5bja0jfXHc29cF55C8j7AQ',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApSo_d-6tUpRdyPfedGt9FAOlIdJc5ZDlE8rU2ZXsK3L_Ngq-PkICWqvfgL4jRE5FKwg9eHcpFiQ6YSnP-Umn_itGHcmoD9cZnzcCU1GNk7vtchytPdKH2G5zC-nNqqtPDmUtp7UTnSn_qFQ5nlenJBVonmFpDAwZcJarDcov4sO9lX4TmZJexfLK08XOnsNsho-AhfccOs9h7pJEtq2JaTsp6Z0SEs_DgoMwbM3PQoV6Yqk-9EcDuEQ',
  coffee:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDhaveynjDuWtPu2JE7hXGvL4JUNYbbcSzUA_e17tE-fQ2ekG5_Bmpiq2FT5U99sDs4VVEYLgM9SedUAzXAR8xYGa2WmPIAVHHLHm5fWEAbFTRgkq4ECuGkRFZXPaj6susJy4hs1U_ga0O2fsnB6yIbLLXil_gLH47nnCpUvo7xTQfoLwPb2A56609PWjT7OTe4zOBInx0APBPGBDi49B3GWJHlIBCLXKmVZGsOCyGIC5X6_O31zQUZxw',
  earbuds:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDsBRsob4EKwYByIQTuO6GU90ExWU8JCcctC-NI5iY3aL0_BBtl9xAuKFqqx4v7_XxO_okOz69Jm9Y2b95TR_r2yodhXvfvk3pm_iFVHJKv-iik8hEiWqN_y3Z9zGkpv-hJyXEQd7jWXrLYRnt0stkgx3WqeJF-EeIEbjGImZRDsRud1qdg_XSuY7GkTbDbYqr1G65ZgIIcXELZeFyOdb8nEw1xYeif19napJIH41m_t_YoWgG7xqaGGQ',
  bakery:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD1UnrRr6q7a_AFGUGaAzW7CxKa41ij-Dq7MSs6zrQOpdQ5byQvCedfk3LlXgxH4Dq1MlVnO4uBwcOTdXi97p32hcfnUPXlWW5g5UArur823YpM65b3neu5AJYhI1twGBIdh52pf5f9tQU5eKO_pZp2gwExAUGUfJ2R-tc77Rb4-SVHoacLVV0qMV1ub-0y8BJngW0H9AlpNkZ0Vxg_tVCdBdetLO8xZcVX5sNDW5Js16tO7lFbjSBQRA',
  gym: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS9qJx2iVnmOvBVSdJUkx05ADwwb0MEKqrAT3WknZ81uF45n0AkMGAyvUfU4odSg8M7y4DXAvpHyQjEbOV0E7_MciEkE_bINj9qpiKbs4HNXWnAV9ffNRiIwSby0bMugn3_MhbOtYuY6w8wXqNcqC3OUqqsnuBPt2CKKsp7uEADyY-U2V0-ewWXR9BljHEu9ikkCtvDQRXadzl30xIkirEgxpd7NnGIC8gbxDyWOlQQCA7jTZJcU9daA',
  tailoring:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDwovKiEqsZikbIErXm_GIvn-5jIcj2O7_9XZeGCpI2q8vqe8fs3YH7RDViht3YQCVx8T_DI5T7Wk3Gpaov0fpXwKFxBQZBSfmWzi5xdJJi56seuVYTlueaC1q2Y2d9C5oGwYeJXvT2qO-UORd5dyKqH7El7RATjmLYqFOCL_-ewQnng3vHYqTa1rtrSW6m7D50oR6kr-KojQBFdG95UkpElNnXIRoiGAfo_hIf2CKXS7yUdoapisAitQ',
  coldBrew:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAlu--zdTIFndoE_re3e7d2ZWRT66DCUwWSFuJ_o8tTQxAb-n4vobtrAVj0tyo4lLPedtoxx3qS4vmvz3MoB2zsrcJt2r7XjjvW1Mzru9aaFm58dRac7fc_d_jJMIA-Hx5RlFed4TJNLfUIa1skDV2Cbrw8XHr7kGIaA4VSxbk39Z6TP2toIFsK6OzNPVSdR90_BJVYtz6xG_ECuBhxw9Xmqix6DishY1dkDV84M8iyKggHLOkw_25KZg',
  tote: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl3DhxgtDFpU09y36kgIuvcv9jP98sFWO7v-7_DaTXaxzwZZu_4cAfj7zUCRbxqFHM7KWpgEnAraIT6NzaaMDeKwfmPJSixIOSUvCZYLK429TEailKfOgc0aN8yMPRSXkNU2eUaJCftiXfH2HuBgPQ1wyQG8FSLa5D9wXOhl7nsMiSWRlUVUEj0VOPm3_NhgKN2ORlYHY8rKI64KH0hc8OIuTxUF-_SZxjJ8DRDSMedAJGRhSChFmGxA',
};

const CATEGORIES: { label: string; icon: string }[] = [
  { label: 'All', icon: '' },
  { label: 'Food', icon: 'restaurant' },
  { label: 'Fashion', icon: 'checkroom' },
  { label: 'Beauty', icon: 'spa' },
  { label: 'Electronics', icon: 'bolt' },
  { label: 'Groceries', icon: 'shopping_cart' },
  { label: 'Services', icon: 'content_cut' },
];

const TRENDING = [
  {
    id: 'spa',
    image: IMAGES.spa,
    imageAlt:
      'A tranquil wellness spa sanctuary with warm ambient lighting, stacked smooth basalt massage stones, aromatic essential oils and fresh bamboo shoots, serene soothing luxury aesthetic.',
    badge: '25% OFF',
    business: 'Glow & Serenity Spa',
    title: 'Weekend Glow Facial & Sauna',
    price: '₦18,500',
    was: '₦25,000',
    distance: '1.4 km away',
    likes: '184',
    comments: '19',
  },
  {
    id: 'coffee',
    image: IMAGES.coffee,
    imageAlt:
      'Two beautiful ceramic cups of artisanal espresso latte art with heart designs placed side-by-side on a rustic timber coffee table, roasted beans scattered nearby, warm coffee shop ambience.',
    badge: '50% OFF',
    business: 'Cafe Neo Artisan',
    title: 'Buy 1 Get 1 Free Roast Coffee',
    price: '₦3,200',
    was: '₦6,400',
    distance: '600m away',
    likes: '320',
    comments: '44',
  },
  {
    id: 'earbuds',
    image: IMAGES.earbuds,
    imageAlt:
      'Sleek matte black premium wireless earbuds resting on their opened charging case with glowing LED battery indicator, modern minimal tech photography on deep navy background.',
    badge: '37% OFF',
    business: 'Gadget Hub Abuja',
    title: 'Wireless Noise-Canceling Buds',
    price: '₦22,000',
    was: '₦35,000',
    distance: '2.1 km away',
    likes: '95',
    comments: '12',
  },
];

const BUSINESSES = [
  {
    id: 'bakery',
    image: IMAGES.bakery,
    imageAlt:
      'Warm golden freshly baked sourdough bread loaves and buttery croissants displayed in a modern rustic bakery window, close-up texture shot.',
    name: 'Artisan Bakery & Cafe',
    meta: 'Bakery & Cafe • 0.5 km away',
    rating: '4.9',
    reviews: '(128)',
    deals: '4 Active Deals',
  },
  {
    id: 'gym',
    image: IMAGES.gym,
    imageAlt:
      'High-end fitness gym interior with row of sleek treadmills, free weights, and warm architectural track lighting, clean lifestyle wellness photography.',
    name: 'Pulse Fitness & Wellness',
    meta: 'Health & Gym • 1.1 km away',
    rating: '4.8',
    reviews: '(94)',
    deals: '2 Active Deals',
  },
  {
    id: 'tailoring',
    image: IMAGES.tailoring,
    imageAlt:
      'Bespoke fashion atelier cutting table with vibrant African silk fabrics, vintage tailor shears, and tailor measuring tape, elegant fashion craftsmanship detail.',
    name: 'Velvet Stitch Couture',
    meta: 'Tailoring & Fashion • 1.8 km away',
    rating: '5.0',
    reviews: '(62)',
    deals: 'Special Offers',
  },
];

interface FeaturedSlide {
  image: string;
  imageAlt: string;
  badge: string;
  ends: string;
  merchant: string;
  title: string;
  price: string;
  was: string;
  distance: string;
  likes: number;
  comments: number;
}

const FEATURED_SLIDES: FeaturedSlide[] = [
  {
    image: IMAGES.dining,
    imageAlt:
      'Luxury dining experience with gourmet grilled steak, fine wine glasses, elegant table setting in an upscale restaurant',
    badge: '50% OFF',
    ends: 'Ends Tonight',
    merchant: 'The Sky Lounge & Grill • Maitama',
    title: "50% Off Chef's 5-Course Tasting Menu",
    price: '₦24,500',
    was: '₦49,000',
    distance: '2.4 km away • Maitama Heights',
    likes: 620,
    comments: 76,
  },
  {
    image: URBAN_PRODUCTS[0].image,
    imageAlt: URBAN_PRODUCTS[0].imageAlt,
    badge: '20% OFF',
    ends: 'Ends in 4h',
    merchant: 'Urban Grill & Bistro • Apo',
    title: '20% Off Prime 3-Course Lunch Combo',
    price: '₦9,600',
    was: '₦12,000',
    distance: '0.8 km away • Apo District',
    likes: 480,
    comments: 64,
  },
  {
    image: IMAGES.spa,
    imageAlt:
      'A tranquil wellness spa sanctuary with warm ambient lighting, stacked smooth basalt massage stones, aromatic essential oils and fresh bamboo shoots, serene soothing luxury aesthetic.',
    badge: '25% OFF',
    ends: 'Ends in 2 days',
    merchant: 'Glow & Serenity Spa • Maitama',
    title: '25% Off Weekend Glow Facial & Sauna',
    price: '₦18,500',
    was: '₦25,000',
    distance: '1.4 km away • Maitama',
    likes: 345,
    comments: 41,
  },
];

export interface HomeScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeals: () => void;
  onOpenDeal: () => void;
  onOpenBusiness: () => void;
  onOpenNotifications: () => void;
  onEnroll: () => void;
  onAccount: () => void;
}

function dealCardProps(onOpenDeal: () => void) {
  return {
    onClick: onOpenDeal,
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpenDeal();
      }
    },
  };
}

function LikeButton({
  count,
  liked,
  onToggle,
}: {
  count: number;
  liked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 transition-colors ${
        liked ? 'text-error' : 'text-text-secondary hover:text-error'
      }`}
    >
      <Icon name="favorite" className="text-[18px]" filled={liked} />
      <span className="font-label-sm text-label-sm">{count}</span>
    </button>
  );
}

function GreetingHeader({
  onLocation,
  onNotifications,
  onAccount,
}: {
  onLocation: () => void;
  onNotifications: () => void;
  onAccount: () => void;
}) {
  const { district, city, radius } = useLocation();
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="px-margin py-3 flex items-center justify-between gap-space-2xs min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-space-2xs">
            <span className="font-caption text-caption text-text-secondary">Good evening</span>
            <Icon name="waving_hand" className="text-sm" />
          </div>
          <button
            type="button"
            onClick={onLocation}
            className="flex flex-nowrap items-center gap-1.5 text-left group transition-transform active:scale-95 min-w-0 whitespace-nowrap"
          >
            <Icon name="location_on" className="text-primary text-[20px] filled shrink-0" />
            <span className="font-button-primary text-button-primary text-text-primary truncate min-w-0">
              {district}, {city}
            </span>
            <Icon
              name="keyboard_arrow_down"
              className="text-text-secondary text-[18px] group-hover:translate-y-0.5 transition-transform shrink-0"
            />
            <span className="ml-1 shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[11px] font-medium">
              Within {radius} km
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            aria-label="Notifications"
            type="button"
            onClick={onNotifications}
            className="relative w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-text-primary shadow-sm active:scale-95 transition-transform"
          >
            <Icon name="notifications" className="text-[22px]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
          </button>
          <button
            type="button"
            aria-label="Account"
            onClick={onAccount}
            className="relative w-10 h-10 rounded-full p-0.5 bg-primary-fixed flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="w-full h-full rounded-full overflow-hidden bg-secondary-fixed block">
              <img
                className="w-full h-full object-cover"
                alt=""
                src={AVATAR}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className="relative w-full">
      <div className="flex items-center h-[50px] px-4 rounded-2xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-canvas focus-within:shadow-md">
        <Icon name="search" className="text-text-tertiary text-[22px] mr-3" />
        <input
          className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
          placeholder="Search deals, businesses or products"
          type="text"
        />
        <button
          aria-label="Filter options"
          type="button"
          onClick={onOpenFilters}
          className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-transform"
        >
          <Icon name="tune" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
}

function TrendingSection({ onSeeAll, onOpenDeal }: { onSeeAll: () => void; onOpenDeal: () => void }) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">Trending Deals</h2>
          <Icon name="local_fire_department" className="text-base" />
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-label-md text-label-md text-primary font-semibold hover:underline"
        >
          See All
        </button>
      </div>
      <div className="relative -mx-margin px-margin overflow-x-auto no-scrollbar flex gap-3.5 pb-2">
        {TRENDING.map((item) => (
          <article
            key={item.id}
            {...dealCardProps(onOpenDeal)}
            className="w-[260px] shrink-0 flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.98] cursor-pointer"
          >
            <div className="relative h-32 w-full bg-surface-container overflow-hidden">
              <img className="w-full h-full object-cover" alt={item.imageAlt} src={item.image} />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold">
                {item.badge}
              </span>
            </div>
            <div className="p-3.5 flex flex-col space-y-2">
              <span className="font-caption text-caption text-text-secondary truncate">{item.business}</span>
              <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">
                {item.title}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="font-label-md text-label-md text-text-primary font-bold">{item.price}</span>
                <span className="font-caption text-caption text-text-tertiary line-through">{item.was}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary pt-1 font-caption text-caption">
                <span>{item.distance}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Icon name="favorite" className="text-[14px]" /> {item.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Icon name="chat_bubble_outline" className="text-[14px]" /> {item.comments}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BusinessesSection({
  onSeeAll,
  onOpenBusiness,
}: {
  onSeeAll: () => void;
  onOpenBusiness: () => void;
}) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Businesses Around You</h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-label-md text-label-md text-primary font-semibold hover:underline"
        >
          See All
        </button>
      </div>
      <div className="flex flex-col space-y-3">
        {BUSINESSES.map((business) => (
          <div
            key={business.id}
            {...dealCardProps(onOpenBusiness)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                <img className="w-full h-full object-cover" alt={business.imageAlt} src={business.image} />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                  {business.name}
                </h3>
                <span className="font-caption text-caption text-text-secondary">{business.meta}</span>
                <div className="flex items-center gap-1 pt-0.5">
                  <Icon name="star" className="text-amber-500 text-[14px]" filled />
                  <span className="font-caption text-caption text-text-primary font-semibold">
                    {business.rating}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">{business.reviews}</span>
                </div>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              {business.deals}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularSection({ onSeeAll, onOpenDeal }: { onSeeAll: () => void; onOpenDeal: () => void }) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Popular Near You</h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-label-md text-label-md text-primary font-semibold hover:underline"
        >
          See All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <article
          {...dealCardProps(onOpenDeal)}
          className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-transform active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full aspect-square bg-surface-container overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Clear glass bottle containing dark artisanal cold brew coffee with minimalist label, frosted water condensation droplets on glass surface, styled product photography."
              src={IMAGES.coldBrew}
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
              15% voucher
            </span>
          </div>
          <div className="p-3 flex flex-col space-y-1">
            <span className="font-caption text-caption text-text-secondary truncate">Cafe Neo</span>
            <h3 className="font-label-sm text-label-sm text-text-primary font-medium line-clamp-1">
              Cold Brew (1L)
            </h3>
            <span className="font-label-md text-label-md text-text-primary font-bold">₦4,500</span>
          </div>
        </article>
        <article
          {...dealCardProps(onOpenDeal)}
          className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-transform active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full aspect-square bg-surface-container overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Caramel tan genuine Italian leather tote bag styled against a soft neutral stone background with subtle minimalist studio lighting, luxury fashion accessory."
              src={IMAGES.tote}
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-surface-canvas/90 text-primary font-caption text-[11px] font-bold">
              Hot Deal
            </span>
          </div>
          <div className="p-3 flex flex-col space-y-1">
            <span className="font-caption text-caption text-text-secondary truncate">Sole District</span>
            <h3 className="font-label-sm text-label-sm text-text-primary font-medium line-clamp-1">
              Leather Tote Bag
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="font-label-md text-label-md text-text-primary font-bold">₦34,000</span>
              <span className="font-caption text-caption text-text-tertiary line-through">₦45,000</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function EnrollmentPrompt({ onEnroll }: { onEnroll: () => void }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-tint-blue shadow-sm flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="font-caption text-caption text-text-secondary">Own a local business in Abuja?</span>
        <button
          type="button"
          onClick={onEnroll}
          className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1 group text-left"
        >
          <span>Put your deals on VEMTAP</span>
          <Icon
            name="arrow_forward"
            className="text-[16px] group-hover:translate-x-0.5 transition-transform"
          />
        </button>
        <span className="font-caption text-[11px] text-text-tertiary pt-0.5">
          Set up in 3 minutes • Instant discovery
        </span>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
        <Icon name="storefront" className="text-[22px]" />
      </div>
    </div>
  );
}

export function HomeScreen({
  onTab,
  onOpenFilters,
  onOpenFeatured,
  onOpenDeals,
  onOpenDeal,
  onOpenBusiness,
  onOpenNotifications,
  onEnroll,
  onAccount,
}: HomeScreenProps) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [category, setCategory] = useState('All');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, radius, setLocation } = useLocation();
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [featured, setFeatured] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const featuredTouchX = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFeatured((current) => (current + 1) % FEATURED_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [featured]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const toggleLike = (key: string) =>
    setLikes((prev) => ({ ...prev, [key]: !prev[key] }));

  const switcherContainer =
    view === 'list'
      ? 'flex items-center bg-surface-container-low p-0.5 rounded-lg border-subtle'
      : 'flex items-center p-0.5 rounded-lg bg-surface-container border border-subtle';

  const inactiveSwitcher =
    'w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary transition-all';

  const activeSwitcher =
    'w-7 h-7 rounded-md flex items-center justify-center bg-surface-container-lowest text-primary shadow-sm transition-all';

  return (
    <AppScreen>
      <GreetingHeader
        onLocation={() => setLocationOpen(true)}
        onNotifications={onOpenNotifications}
        onAccount={onAccount}
      />

      <div className="flex flex-col relative w-full px-margin pt-20 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-6 space-y-6">
          <SearchBar onOpenFilters={onOpenFilters} />

          <div className="relative -mx-margin px-margin overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
            {CATEGORIES.map((item) => {
              const isActive = category === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCategory(item.label)}
                  className={`shrink-0 h-9 rounded-full font-label-md text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
                    isActive
                      ? 'px-4 bg-primary-container text-on-primary'
                      : 'px-3.5 bg-surface-container-lowest text-text-primary hover:bg-surface-container-low'
                  }`}
                >
                  {item.icon && <Icon name={item.icon} className="text-[17px]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <section className="flex flex-col space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Featured Deals</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-caption text-[11px] font-semibold">
                  Promoted
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenFeatured}
                className="font-label-md text-label-md text-primary font-semibold hover:underline"
              >
                See All
              </button>
            </div>
            <div
              className="overflow-hidden rounded-2xl shadow-md border-active ring-1 ring-primary/10 transition-transform active:scale-[0.99]"
              onTouchStart={(event) => {
                featuredTouchX.current = event.touches[0].clientX;
              }}
              onTouchEnd={(event) => {
                const start = featuredTouchX.current;
                featuredTouchX.current = null;
                if (start == null) return;
                const delta = event.changedTouches[0].clientX - start;
                if (Math.abs(delta) < 40) return;
                const direction = delta > 0 ? -1 : 1;
                setFeatured((current) => (current + direction + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${featured * 100}%)` }}
              >
                {FEATURED_SLIDES.map((slide, index) => (
                  <article
                    key={slide.title}
                    {...dealCardProps(onOpenDeal)}
                    className="min-w-full flex flex-col bg-surface-container-lowest cursor-pointer"
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover"
                        alt={slide.imageAlt}
                        src={slide.image}
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm backdrop-blur-sm">
                        {slide.badge}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 text-tertiary font-label-sm text-label-sm font-medium shadow-sm backdrop-blur-sm flex items-center gap-1">
                        <Icon name="schedule" className="text-[15px]" />
                        <span>{slide.ends}</span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col space-y-2.5">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="font-label-sm text-label-sm font-medium">{slide.merchant}</span>
                        <span className="flex items-center gap-0.5 font-caption text-caption text-primary font-semibold">
                          <Icon name="verified" className="text-[14px]" /> Partner
                        </span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug">{slide.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{slide.price}</span>
                        <span className="font-body-md text-body-md text-text-tertiary line-through">{slide.was}</span>
                      </div>
                      <div className="flex items-center gap-1 font-caption text-caption text-text-secondary pt-0.5">
                        <Icon name="near_me" className="text-[16px] text-text-tertiary" />
                        <span>{slide.distance}</span>
                      </div>
                      <div
                        className="flex items-center justify-between pt-3 text-text-secondary"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center gap-4">
                          <LikeButton
                            count={slide.likes + (likes[`featured-${index}`] ? 1 : 0)}
                            liked={Boolean(likes[`featured-${index}`])}
                            onToggle={() => toggleLike(`featured-${index}`)}
                          />
                          <button
                            type="button"
                            onClick={() => showToast('Comments open on the deal page')}
                            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <Icon name="chat_bubble_outline" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm">{slide.comments}</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Deal link copied to clipboard')}
                          className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                        >
                          <Icon name="ios_share" className="text-[18px]" />
                          <span className="font-label-sm text-label-sm">Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {FEATURED_SLIDES.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Show featured deal ${index + 1}`}
                  onClick={() => setFeatured(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === featured ? 'w-6 bg-primary' : 'w-2 bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Deals Near You</h2>
              <div className="flex items-center gap-2.5">
                <div className={switcherContainer} role="group" aria-label="View layout switcher">
                  <button
                    type="button"
                    aria-label="List view"
                    title="List view"
                    onClick={() => setView('list')}
                    className={view === 'list' ? activeSwitcher : inactiveSwitcher}
                  >
                    <Icon name="view_agenda" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Grid view"
                    title="Grid view"
                    onClick={() => setView('grid')}
                    className={view === 'grid' ? activeSwitcher : inactiveSwitcher}
                  >
                    <Icon name="grid_view" className="text-[18px]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onOpenDeals}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline"
                >
                  See All
                </button>
              </div>
            </div>

            {view === 'list' ? (
              <>
                <article
                  {...dealCardProps(onOpenDeal)}
                  className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.99] cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="A gourmet artisanal double cheeseburger with melted cheddar cheese dripping, crispy thick potato wedges, served on a modern dark slate plate in a cozy trendy bistro restaurant, sharp appetizing food photography with vibrant warm colors."
                      src={IMAGES.burger}
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm backdrop-blur-sm">
                      20% OFF
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 text-tertiary font-label-sm text-label-sm font-medium shadow-sm backdrop-blur-sm flex items-center gap-1">
                      <Icon name="schedule" className="text-[15px]" />
                      <span>Expires in 4h</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between text-text-secondary">
                      <span className="font-label-sm text-label-sm font-medium">
                        Urban Grill &amp; Bistro • Apo District
                      </span>
                      <span className="flex items-center gap-0.5 font-caption text-caption text-primary">
                        <Icon name="verified" className="text-[14px]" /> Verified
                      </span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug">
                      20% Off Prime Lunch Combo
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦9,600</span>
                      <span className="font-body-md text-body-md text-text-tertiary line-through">₦12,000</span>
                    </div>
                    <div className="flex items-center gap-1 font-caption text-caption text-text-secondary pt-0.5">
                      <Icon name="near_me" className="text-[16px] text-text-tertiary" />
                      <span>0.8 km away • Apo Boulevard</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 text-text-secondary" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        <LikeButton
                          count={248 + (likes.urban ? 1 : 0)}
                          liked={Boolean(likes.urban)}
                          onToggle={() => toggleLike('urban')}
                        />
                        <button
                          type="button"
                          onClick={() => showToast('Comments open on the deal page')}
                          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <Icon name="chat_bubble_outline" className="text-[18px]" />
                          <span className="font-label-sm text-label-sm">32</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Deal link copied to clipboard')}
                        className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                      >
                        <Icon name="ios_share" className="text-[18px]" />
                        <span className="font-label-sm text-label-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </article>

                <article
                  {...dealCardProps(onOpenDeal)}
                  className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.99] cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="High-end streetwear limited edition sneaker pair displayed on a polished concrete surface with modern urban lighting and soft shadows, crisp fashion product photography."
                      src={IMAGES.sneakers}
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm backdrop-blur-sm">
                      30% OFF
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm backdrop-blur-sm">
                      Exclusive
                    </div>
                  </div>
                  <div className="p-4 flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between text-text-secondary">
                      <span className="font-label-sm text-label-sm font-medium">
                        Sole District Boutique • Garki Area
                      </span>
                      <span className="flex items-center gap-0.5 font-caption text-caption text-primary">
                        <Icon name="local_fire_department" className="text-[14px]" /> Hot
                      </span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug">
                      Weekend Sneaker Drop &amp; Apparel
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦28,000</span>
                      <span className="font-body-md text-body-md text-text-tertiary line-through">₦40,000</span>
                    </div>
                    <div className="flex items-center gap-1 font-caption text-caption text-text-secondary pt-0.5">
                      <Icon name="near_me" className="text-[16px] text-text-tertiary" />
                      <span>1.2 km away • Area 11 Commercial Arcade</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 text-text-secondary" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        <LikeButton
                          count={412 + (likes.sole ? 1 : 0)}
                          liked={Boolean(likes.sole)}
                          onToggle={() => toggleLike('sole')}
                        />
                        <button
                          type="button"
                          onClick={() => showToast('Comments open on the deal page')}
                          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <Icon name="chat_bubble_outline" className="text-[18px]" />
                          <span className="font-label-sm text-label-sm">58</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Deal link copied to clipboard')}
                        className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                      >
                        <Icon name="ios_share" className="text-[18px]" />
                        <span className="font-label-sm text-label-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </article>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <article
                  {...dealCardProps(onOpenDeal)}
                  className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="Gourmet burger and wedges"
                      src={IMAGES.burger}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold shadow-sm backdrop-blur-sm">
                      20% OFF
                    </span>
                    <button
                      aria-label="Save Prime Lunch Combo"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike('gridUrban');
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        likes.gridUrban ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'
                      }`}
                    >
                      <Icon name="favorite" className="text-[16px]" filled={Boolean(likes.gridUrban)} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                    <div>
                      <div className="flex items-center gap-1 text-text-secondary text-[11px] font-caption">
                        <span className="truncate">Urban Grill</span>
                        <Icon name="verified" className="text-[12px] text-primary shrink-0" />
                      </div>
                      <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">
                        Prime Lunch Combo
                      </h3>
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-label-md text-label-md text-text-primary font-bold">₦9,600</span>
                        <span className="font-caption text-caption text-text-tertiary line-through text-[11px]">
                          ₦12,000
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary font-caption text-[11px] pt-1">
                        <span className="flex items-center gap-0.5">
                          <Icon name="near_me" className="text-[13px] text-text-tertiary" />0.8 km
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Icon name="thumb_up" className="text-[13px]" />
                          {248 + (likes.gridUrban ? 1 : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>

                <article
                  {...dealCardProps(onOpenDeal)}
                  className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="Streetwear sneaker limited drop"
                      src={IMAGES.sneakers}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold shadow-sm backdrop-blur-sm">
                      30% OFF
                    </span>
                    <button
                      aria-label="Save Sneaker Drop and Tees"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike('gridSole');
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        likes.gridSole ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'
                      }`}
                    >
                      <Icon name="favorite" className="text-[16px]" filled={Boolean(likes.gridSole)} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                    <div>
                      <div className="flex items-center gap-1 text-text-secondary text-[11px] font-caption">
                        <span className="truncate">Sole District</span>
                        <Icon name="local_fire_department" className="text-[12px] text-primary shrink-0" />
                      </div>
                      <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">
                        Sneaker Drop &amp; Tees
                      </h3>
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-label-md text-label-md text-text-primary font-bold">₦28,000</span>
                        <span className="font-caption text-caption text-text-tertiary line-through text-[11px]">
                          ₦40,000
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary font-caption text-[11px] pt-1">
                        <span className="flex items-center gap-0.5">
                          <Icon name="near_me" className="text-[13px] text-text-tertiary" />1.2 km
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Icon name="thumb_up" className="text-[13px]" />
                          {412 + (likes.gridSole ? 1 : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>

                <article
                  {...dealCardProps(onOpenDeal)}
                  className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="Artisanal coffee and breakfast combo"
                      src={IMAGES.coffee}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold shadow-sm backdrop-blur-sm">
                      BOGO
                    </span>
                    <button
                      aria-label="Save Buy 1 Get 1 Latte"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike('gridCafe');
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        likes.gridCafe ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'
                      }`}
                    >
                      <Icon name="favorite" className="text-[16px]" filled={Boolean(likes.gridCafe)} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                    <div>
                      <div className="flex items-center gap-1 text-text-secondary text-[11px] font-caption">
                        <span className="truncate">Cafe Neo</span>
                        <Icon name="verified" className="text-[12px] text-primary shrink-0" />
                      </div>
                      <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">
                        Buy 1 Get 1 Latte
                      </h3>
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-label-md text-label-md text-text-primary font-bold">₦3,200</span>
                        <span className="font-caption text-caption text-text-tertiary line-through text-[11px]">
                          ₦6,400
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary font-caption text-[11px] pt-1">
                        <span className="flex items-center gap-0.5">
                          <Icon name="near_me" className="text-[13px] text-text-tertiary" />600m
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Icon name="thumb_up" className="text-[13px]" />
                          {320 + (likes.gridCafe ? 1 : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>

                <article
                  {...dealCardProps(onOpenDeal)}
                  className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="Spa wellness facial therapy"
                      src={IMAGES.spa}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold shadow-sm backdrop-blur-sm">
                      25% OFF
                    </span>
                    <button
                      aria-label="Save Facial and Sauna Pass"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike('gridSpa');
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        likes.gridSpa ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'
                      }`}
                    >
                      <Icon name="favorite" className="text-[16px]" filled={Boolean(likes.gridSpa)} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                    <div>
                      <div className="flex items-center gap-1 text-text-secondary text-[11px] font-caption">
                        <span className="truncate">Glow Spa</span>
                        <Icon name="verified" className="text-[12px] text-primary shrink-0" />
                      </div>
                      <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">
                        Facial &amp; Sauna Pass
                      </h3>
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-label-md text-label-md text-text-primary font-bold">₦18,500</span>
                        <span className="font-caption text-caption text-text-tertiary line-through text-[11px]">
                          ₦25,000
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary font-caption text-[11px] pt-1">
                        <span className="flex items-center gap-0.5">
                          <Icon name="near_me" className="text-[13px] text-text-tertiary" />1.4 km
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Icon name="thumb_up" className="text-[13px]" />
                          {184 + (likes.gridSpa ? 1 : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </section>

          <TrendingSection onSeeAll={onOpenDeals} onOpenDeal={onOpenDeal} />
          <BusinessesSection onSeeAll={() => onTab('discover')} onOpenBusiness={onOpenBusiness} />
          <PopularSection onSeeAll={onOpenDeals} onOpenDeal={onOpenDeal} />
          <EnrollmentPrompt onEnroll={onEnroll} />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}

      <MobileTabBar active="home" onTab={onTab} />
      <LocationRadiusModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onApply={setLocation}
        district={district}
        radius={radius}
      />
    </AppScreen>
  );
}
