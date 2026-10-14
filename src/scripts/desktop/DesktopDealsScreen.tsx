import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation } from '../../context/LocationContext';

interface DesktopDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeal: () => void;
  onClaim?: (onClaimed?: () => void) => void;
}

const DEAL_OF_DAY_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_l35VLFaK11RltRrE-nzB22BkuA_N75zreMrW6RsT9blVALkpXOAXKbAn-lFN7t03ty5K377JuUw39bCaUxSTVQcHS3Dmr4ahhy5GFgVK2hPI0sGkeYaxf1d4joa1uxsJeNRwJ9-e8PPl5ObqKpgnkji83P015ig14H-AAPPhXw0JC7obYa-ebKvoJIkE-nX7kF-TW34CZ_t1p-J7y8FMqvweALg7JOeOIZGSf0D8';

const DEAL_OF_DAY_ALT =
  'High-end rooftop fine dining experience at sunset featuring a lavish 5-course gourmet meal with artisanal wine pairings, glowing warm amber candlelight, panoramic Abuja skyline views, elegant plating with modern culinary aesthetics, vibrant rich warm colors, and editorial food photography lighting';

interface DiscoveryDeal {
  image: string;
  imageAlt: string;
  discount: string;
  extra?: { label: string; className: string };
  timer: string;
  store: string;
  distance: string;
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
  save: string;
}

const DISCOVERY_DEALS: DiscoveryDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    imageAlt:
      'Close up of a savory gourmet beef smash burger alongside crispy truffle fries and a chilled craft soda presented on a rustic dark slate board inside Urban Grill Apo, soft ambient restaurant lighting, commercial food shoot',
    discount: '20% OFF',
    timer: '4h left',
    store: 'Urban Grill',
    distance: '0.8km away',
    title: 'Prime 3-Course Lunch Combo',
    copy: 'Succulent dry-aged cuts paired with artisan brioche sides and freshly pressed mint cooler.',
    price: '₦9,600',
    oldPrice: '₦12,000',
    save: '-₦2,400',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYU9CHvad8mmB1n7HZebj-9-RJNU48y8c41IO7GzzEk_4mD-lhgfd9MReQAi7YmYcbcDcZHGy4JlFEc8Y_xvGS6GKTRikmdwO8inJNNZQsqJthBLoFuxRSpANFde0IjudqyzaZd9ctxXpfJ_cpK_TFjTBltS6O6CxRYEBNCjzmWBdHm6GkyB7QsKUssO8D-I_atfFeR6xo6CqLFnTTx60Hn6je8raKJ2qdZ15i07to',
    imageAlt:
      'Trendy streetwear boutique sneaker wall showcasing limited edition high-top kicks and modern minimalist urban apparel bathed in striking neon blue and warm spotlighting, high end fashion retail concept',
    discount: '30% OFF',
    extra: { label: 'Hot', className: 'bg-tertiary-fixed text-on-tertiary-fixed font-bold' },
    timer: '18h left',
    store: 'Sole District',
    distance: '1.2km away',
    title: 'Weekend Streetwear Drop & Sneakers',
    copy: 'Exclusive store voucher applicable toward selected premium retro sneakers and cargo essentials.',
    price: '₦28,000',
    oldPrice: '₦40,000',
    save: '-₦12,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8LxbXWebu4BeWFCBPcQnwZ3yOVjHO9H4S9ZOfPGV9cMmACi2aZB_Hhu0JontfNGmJN7KDb9t8ObRhK6kcgRU9c1neHq-t6gNg7HFK2Z7F6XMKJNJcoMQCUei7KQvEMOdk3yYtVf3e5Ie3aMnIgjAIYTBFhfC430FSqSmLEtAuHlaO5BSCLUxZ4BFq5qVHBfhvErtWg7n15YG4LtYJ5TbHhVwyxpqngk-At1VnoQZ5',
    imageAlt:
      'Serene luxury spa treatment room with soft warm bamboo styling, organic facial essential oils, neatly stacked white towels, burning aromatic scented candle, and tranquil wellness aesthetic',
    discount: '25% OFF',
    extra: { label: 'Popular', className: 'bg-secondary-fixed text-on-secondary-fixed font-semibold' },
    timer: '1d left',
    store: 'Glow & Serenity Spa',
    distance: '2.4km away',
    title: 'Weekend Glow Facial & Massage',
    copy: 'Hydrating botanical facial therapy accompanied by a 45-minute hot stone tension release session.',
    price: '₦18,500',
    oldPrice: '₦24,600',
    save: '-₦6,100',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6mVwJbVAhXMM6239ZPfDxwph2u7rXh0Me0cneDcRhckqCG_zdKDD2N_U8F7OK8e3jF5BJ2M0prZjgOX_1rQUbl5SJSX27asdG82U5vIYoaeC-SwhTYdK3Tr-da_MBPcs00hrZX4a8XBjl4JD9J6BTr3RflgchtVCldlT7yQzQOdSScCg7yC1Zagz_1EsP-7VUerTf5jQH7KjI-KelSjRNCL8gD9QySyXtULI9QIWC',
    imageAlt:
      'Chilled bottle of artisanal single-origin cold brew coffee with fresh flaky golden croissants in a chic modern cafe setting with soft natural sunlight on wooden counter, coffeehouse aesthetic',
    discount: 'BOGO FREE',
    extra: { label: '15% OFF', className: 'bg-surface-tint-blue text-primary font-semibold' },
    timer: '2d left',
    store: 'Cafe Neo Artisanal',
    distance: '3.1km away',
    title: 'Cold Brew 1L & Pastry Box',
    copy: 'Slow-steeped Arabica cold brew bottle packed with 4 warm almond butter pastries of your pick.',
    price: '₦4,500',
    oldPrice: '₦7,000',
    save: '-₦2,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Eg_JS8x1JFRVATxQeOiiQ3TMoMDrh4EhAiR9-wIDqscysVxQV1cCp4l-BDSgx3n_UAd_vD-1tD_Xv4YcSei9qtvi0YKwPPv08-rYPo0-tGJXM-rbpQI8WxkvYpP_0XqQymVLOAf7kewqDGZSq29JRiMRtfD-j5v-HuOyD3WFf7C10KeQzNGI2zaE14CE6XtUY04jA2LMw-juPENi_JB9-S82f_5yhQUbX8OwN1Ux',
    imageAlt:
      'Sophisticated bespoke fashion atelier showing tailored modern traditional suits, measuring tape, premium Nigerian brocade fabrics, and vintage sewing tools in warm luxury lighting',
    discount: '35% OFF',
    extra: { label: 'Featured', className: 'bg-primary-fixed text-on-primary-fixed font-semibold' },
    timer: '12h left',
    store: 'Velvet Stitch Couture',
    distance: '1.8km away',
    title: 'Bespoke Tailoring & Custom Fitting',
    copy: 'Complete styling consultation and master craftsmanship for 1 two-piece custom-made traditional wear.',
    price: '₦32,000',
    oldPrice: '₦49,000',
    save: '-₦17,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDw6OkTPzKZR-Uae5KgRNwRpUUxHaV3xjDrt5alZPyfzQGcTbbQheK-zj4nl_miWFG2OWSmboQrFlaGFe3I1xrwjcKJCDeDPENEwo1M-q80Ga_OS2k4ycSjvl2jC0OeWXco2dM0vutx9HI45LEYTchDYLvsiWjJhEBl_0xoCB8xKnaoY7oz85z63k3LQ3HpD4jN1Y4bXp_TAOxaNuP01gTe1kwBTtvSNc1dGNDTXHGW',
    imageAlt:
      'High tech athletic fitness center featuring modern rows of cardio equipment, clean dumbbell racks, motivational floor graphics, and crisp bright studio illumination',
    discount: '40% OFF',
    extra: { label: 'Limited', className: 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold' },
    timer: '5h left',
    store: 'Pulse Fitness & Gym',
    distance: '1.5km away',
    title: 'Monthly Pass + Personal Trainer',
    copy: 'Unlimited premium gym access, 4 one-on-one conditioning sessions, and personalized nutrition plan.',
    price: '₦15,000',
    oldPrice: '₦25,000',
    save: '-₦10,000',
  },
];

interface CatalogDeal {
  image: string;
  imageAlt: string;
  discount: string;
  extra?: { label: string; className: string; icon?: string; iconFilled?: boolean };
  distance: string;
  store: string;
  verified: boolean;
  badge?: { label: string; className: string };
  rating: string;
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
  save: string;
}

const CATALOG_DEALS: CatalogDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAm_UT0z4RFY74FAD1RofAbJEzfrBXfwx7_sPp3IqkDFRJYeRgU2np6hTl96-YrVZIz2EzO0HApwv0tzkQKSfZH1iuYTG-t6cSKH2KOlXnJI-rffu8XnsGX7rQiQdWpwJY5O19q9saGtn2BNkhcPvAN9qPel_aJOZDLJki1bor5-nLgCyie7_qFIbNjkGsVBWKOdSdhXRkjWXPhnSV8dGQu9JFzYiYOwoTRKTZc7CnM',
    imageAlt:
      'A gourmet artisanal stacked beef burger with melted aged cheddar, crisp lettuce, charred brioche bun, and golden rustic french fries arranged on a slate plate inside an ambient, warm industrial restaurant in Apo, Abuja. Professional culinary lighting with warm reflections.',
    discount: '20% OFF',
    distance: '0.8 km away',
    store: 'Urban Grill – Apo',
    verified: true,
    rating: '4.9',
    title: 'Prime 3-Course Lunch Combo & Craft Drink',
    copy: 'Valid weekdays 12pm-4pm. Includes Angus burger, signature sides & drink.',
    price: '₦9,600',
    oldPrice: '₦12,000',
    save: 'Save ₦2,400',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZEi5c854POZ4AICs5MN7gIdvpHFb2SI3Uxzhq2xvHqARL7pDGRWFav8eyjrQOV3clq3FH2MaV0kDIr0dwoLLrxpTKkYeZxUItz6ypB3PEoHLp4m6kKSwJxcBEvYtamci5RitB-vx-F6bKt9YhZfRm2CzU4Jx7gluWTfMXmOgc1j8zCYND41ntkMm0m4ZQh1eEXhSzHw6m6jF4pwqLwt01UQRZUa3DpJA7mkrOY6_G',
    imageAlt:
      'A curated display of high-end urban designer sneakers and streetwear hoodies on sleek acrylic pedestals in a minimalist modern boutique. Bright contemporary architectural gallery lighting with subtle blue reflections.',
    discount: '30% OFF',
    extra: {
      label: 'Hot',
      className: 'bg-error-container text-on-error-container',
      icon: 'local_fire_department',
      iconFilled: true,
    },
    distance: '1.2 km away',
    store: 'Sole District Boutique',
    verified: false,
    badge: { label: 'HOT', className: 'bg-surface-container-high text-primary' },
    rating: '4.8',
    title: 'Weekend Streetwear Drop & Sneakers',
    copy: 'Applicable to selected vintage low tops and graphic oversized tees.',
    price: '₦28,000',
    oldPrice: '₦40,000',
    save: 'Save ₦12,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCp0NgHxcJ3z5eanfpjf6SxbMpNWp59dpo9z7KjHlkggD3N3-LxISAb6UzWiFFOjzZ9h0r0JbKYwYivHJ6DcyLdXqBAaZCfhFbcIi5nYffDQ0Q9GdGoiK4AnPcCGwxKeT067PBCJxlQViWj6alGM5U5iTDGpD9LS0myrcKsuRHgibPxZ2lTS1i4wh-kJ7ADYxNmMrAMBEJx-FPEIDWZCIF-mbHZjNgELHrNxYVGzDRT',
    imageAlt:
      'A tranquil wellness spa sanctuary in Abuja with polished black river massage stones, warm essential massage oil bottles, fluffy rolled white cotton towels, and subtle soft candle illumination.',
    discount: '25% OFF',
    extra: {
      label: 'Popular',
      className: 'bg-secondary-fixed text-on-secondary-fixed',
      icon: 'trending_up',
    },
    distance: '2.4 km away',
    store: 'Glow & Serenity Spa',
    verified: false,
    badge: { label: 'TOP RATED', className: 'bg-surface-tint-blue text-primary' },
    rating: '5.0',
    title: 'Weekend Glow Facial & Massage',
    copy: '60-minute organic deep tissue session with lavender aromatherapy.',
    price: '₦18,500',
    oldPrice: '₦25,000',
    save: 'Save ₦6,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhGznbs92qp68XDygsvb-5-9fjS5K8CLQ1pWyi6vx2TC7H70EAqyMGwI-JSDM0zkB31FVy_WedExHj0vik7TFI73nD8Zeb7KKo6vnPQ2ROO-pfYQ3pjI-lHZ6ppMOrTtRidyxOVmV3uUplZoR5wOVfN7wsQg0-G7T9EjYWFNJHlf104YmhUMlRs5ZgzP9N_0sQYpE8YriIwdpFfB58va0nmJ02bjscySDUNch6059r',
    imageAlt:
      'Chilled glass amber bottle of cold brew coffee next to fresh buttery golden croissants on an aesthetic terrazzo coffee shop counter with morning sunlight streaming through.',
    discount: 'BOGO Free',
    extra: { className: 'bg-badge-discount-bg text-badge-discount-text', label: '15% OFF' },
    distance: '3.1 km away',
    store: 'Cafe Neo Artisanal',
    verified: false,
    rating: '4.7',
    title: 'Cold Brew 1L & Pastry Box',
    copy: 'Steeped 24 hours. Paired with 2 almond croissants of your choice.',
    price: '₦4,500',
    oldPrice: '₦6,000',
    save: 'Save ₦1,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALVh9jzJkC-WymKf5PQws4vtf7RlvCLgC75qaDVoohniWLYrNhZhlAbyVG2hj28GYAjVk25bQVqhaFlDBxKxam_IeBumKlfgC9HXoJYIHqyOM0FQ-a2_sZFAreKbhqjb2DJ-rf9GRt5IQsEAb2lDt2M7Z6xDwFQcjxIw-KvcMtg9q0kOv8PRa4_QBvUf9F9D3uLfEpNNXko0YFcf6bPW9td63bEnJ_oAl1xVK0CfFE',
    imageAlt:
      'An artisanal haute couture bespoke tailoring atelier in Nigeria, featuring premium linen fabrics, tape measures, dressmaker mannequin with tailored suit jacket and warm interior wood styling.',
    discount: '35% OFF',
    extra: { label: 'Featured', className: 'bg-surface-tint-blue text-primary', icon: 'stars' },
    distance: '1.8 km away',
    store: 'Velvet Stitch Couture',
    verified: true,
    rating: '4.9',
    title: 'Bespoke Tailoring & Custom Fitting',
    copy: 'Personal measurement session and rush delivery on traditional Kaftans.',
    price: '₦32,000',
    oldPrice: '₦49,000',
    save: 'Save ₦17,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvTeFkPu7sZ9lbavkG2NNZEGRio8gb8YQE_qUIv1QgAfuSB7GwV-19yicMTW42FzeYYhFfcvTxktABntL8xSw64eycXRuzSnpkQcCQ4Xgjs1btijpTY5GyF__Id5pPJpLcGys11zVCutV_FgO1Z_1Pt5JMs6iCCii0xLt7KZFCisxZY_Wn2CQ8G1V_faq2t3XscJ76jdv8MbbJb93EVZwa45gvJe55B0m4p59EvjHt',
    imageAlt:
      'High-end modern fitness studio with clean rows of dumbbells, state-of-the-art cardiovascular running machines, ambient recessed overhead blue illumination, and polished rubber floor.',
    discount: '40% OFF',
    extra: { label: 'Limited', className: 'bg-primary text-on-primary', icon: 'bolt' },
    distance: '1.5 km away',
    store: 'Pulse Fitness & Gym',
    verified: true,
    rating: '4.9',
    title: 'Monthly Pass + Personal Trainer',
    copy: 'Full locker access, steam room privileges and 4 dedicated coaching drills.',
    price: '₦15,000',
    oldPrice: '₦25,000',
    save: 'Save ₦10,000',
  },
];

const CONTEXT_CATEGORIES = ['All Deals (6)', 'Food & Dining', 'Fashion & Wear', 'Wellness & Spa', 'Fitness'];

export function DesktopDealsScreen({ onNav, onOpenFilters, onOpenFeatured, onOpenDeal, onClaim }: DesktopDealsScreenProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const [category, setCategory] = useState(CONTEXT_CATEGORIES[0]);
  const [heroLiked, setHeroLiked] = useState(false);
  const [heroClaimed, setHeroClaimed] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const claimTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    const timers = claimTimers.current;
    return () => {
      window.clearTimeout(toastTimer.current);
      Object.values(timers).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const claimDeal = (key: string) => {
    if (claimed[key]) {
      return;
    }
    setClaimed((prev) => ({ ...prev, [key]: true }));
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 3000);
    window.clearTimeout(claimTimers.current[key]);
    claimTimers.current[key] = window.setTimeout(() => {
      setClaimed((prev) => ({ ...prev, [key]: false }));
      delete claimTimers.current[key];
    }, 3500);
  };

  const toggleHeroLike = () => {
    setHeroLiked((prev) => !prev);
  };

  const claimToast = toast ? (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface p-space-sm px-space-md rounded-2xl shadow-xl">
      <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
        <Icon name="check" className="text-[18px]" />
      </div>
      <div>
        <p className="font-label-md text-label-md font-semibold">Deal Claimed Successfully!</p>
        <p className="font-caption text-caption opacity-80">Saved to your wallet. Present QR in-store to redeem.</p>
      </div>
    </div>
  ) : null;

  if (view === 'list') {
    return (
      <>
        <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
          <section className="relative w-full max-w-7xl mx-auto px-margin pb-space-3xl">
            <div className="w-full pt-space-lg pb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="space-y-space-2xs">
                <div className="flex items-center gap-space-xs text-text-tertiary font-label-sm text-label-sm">
                  <span>Explore Exclusive Savings</span>
                  <span>•</span>
                  <span className="flex items-center text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary-container inline-block animate-pulse mr-1.5" />
                    Real-time neighborhood inventory
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs">
                  <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                    Good evening
                  </h1>
                  <button
                    className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-high text-on-surface text-label-md font-label-md shadow-sm"
                    type="button"
                    onClick={() => setLocationOpen(true)}
                  >
                    <Icon name="location_on" className="text-primary text-[18px]" />
                    <span className="font-semibold text-text-primary">
                      {district}, {city}
                    </span>
                    <span className="text-text-tertiary">Within {radius}km</span>
                    <Icon name="keyboard_arrow_down" className="text-text-secondary text-[16px]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1 max-w-full">
                {CONTEXT_CATEGORIES.map((item) => {
                  const active = item === category;
                  return (
                    <button
                      key={item}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-medium'
                          : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md mb-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-[0_4px_20px_-4px_rgba(13,37,76,0.03)]">
              <div className="flex items-center gap-space-md w-full sm:w-auto">
                <div className="flex items-center gap-space-xs">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">Showing 6 deals</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-caption font-caption font-bold">
                    VERIFIED LOCAL
                  </span>
                </div>
                <div className="h-4 w-px bg-surface-container-highest hidden sm:block" />
                <p className="hidden sm:inline font-caption text-caption text-text-tertiary">
                  Tap &apos;Claim&apos; to lock in redeemable vouchers
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-space-sm">
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
                  <button
                    aria-label="Grid View"
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-text-tertiary hover:text-text-primary transition-all"
                    type="button"
                    onClick={() => setView('grid')}
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                  <button
                    aria-label="List View"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-container-lowest text-primary shadow-sm transition-all"
                    type="button"
                  >
                    <Icon name="view_list" className="text-[20px]" filled />
                  </button>
                </div>

                <button
                  className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-low text-text-primary hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors shadow-sm"
                  type="button"
                  onClick={onOpenFilters}
                >
                  <Icon name="tune" className="text-primary text-[18px]" />
                  <span>Filters</span>
                  <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary text-caption font-bold flex items-center justify-center">
                    2
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {CATALOG_DEALS.map((deal) => (
                <article
                  key={deal.title}
                  role="button"
                  tabIndex={0}
                  onClick={onOpenDeal}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal();
                    }
                  }}
                  className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_18px_-2px_rgba(13,37,76,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(6,108,244,0.12)] transition-all duration-300 cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={deal.imageAlt}
                      src={deal.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-space-2xs">
                      <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-tight shadow-sm">
                        {deal.discount}
                      </span>
                      {deal.extra ? (
                        <span
                          className={`px-2.5 py-1 rounded-full font-caption text-caption font-semibold flex items-center gap-1 shadow-sm ${deal.extra.className}`}
                        >
                          {deal.extra.icon ? (
                            <Icon
                              name={deal.extra.icon}
                              className="text-[13px]"
                              filled={deal.extra.iconFilled ?? false}
                            />
                          ) : null}
                          {deal.extra.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-text-primary text-caption font-caption font-semibold">
                      <Icon name="near_me" className="text-primary text-[14px]" />
                      <span>{deal.distance}</span>
                    </div>
                  </div>

                  <div className="p-space-lg flex-1 flex flex-col justify-between">
                    <div className="space-y-space-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-sm text-label-sm font-semibold text-text-secondary">
                            {deal.store}
                          </span>
                          {deal.verified ? (
                            <Icon name="verified" filled className="text-primary text-[16px]" />
                          ) : null}
                          {deal.badge ? (
                            <span
                              className={`px-1.5 py-0.5 rounded font-caption text-caption font-bold ${deal.badge.className}`}
                            >
                              {deal.badge.label}
                            </span>
                          ) : null}
                        </div>
                        <span className="flex items-center text-amber-500 text-caption font-caption font-semibold gap-0.5">
                          <Icon name="star" filled className="text-[14px]" />
                          {deal.rating}
                        </span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                      <p className="font-caption text-caption text-text-tertiary line-clamp-1">{deal.copy}</p>
                    </div>

                    <div className="pt-space-md mt-space-md flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading-md text-heading-md text-text-primary font-bold">
                            {deal.price}
                          </span>
                          <span className="font-caption text-caption text-text-tertiary line-through">
                            {deal.oldPrice}
                          </span>
                        </div>
                        <span className="inline-flex px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                          {deal.save}
                        </span>
                      </div>
                      <button
                        className={`h-11 px-6 rounded-xl font-button-primary text-button-primary font-semibold transition-all active:scale-95 ${
                          claimed[deal.title]
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-primary-container hover:bg-primary text-on-primary shadow-[0_4px_14px_rgba(6,108,244,0.3)]'
                        }`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim?.(() => claimDeal(deal.title));
                        }}
                      >
                        {claimed[deal.title] ? 'Claimed!' : 'Claim'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-space-2xl bg-surface-tint-blue rounded-2xl p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary shrink-0 shadow-md">
                  <Icon name="verified" className="text-[24px]" />
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Zero-Risk VEMTAP Guarantee
                  </h4>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Claim online for free. Show your barcode to the cashier and pay the discounted price in Apo.
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-space-2xs text-primary font-label-md text-label-md font-semibold hover:underline shrink-0"
                type="button"
              >
                <span>How claiming works</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </section>

          {claimToast}
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

  return (
    <>
      <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
        <section className="w-full bg-surface-canvas shadow-sm">
          <div className="max-w-7xl mx-auto px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md w-full md:w-auto">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Deals &amp; Offers</h1>
              </div>
              <button
                className="group/location relative bg-surface-tint-blue px-space-sm py-1.5 rounded-full flex items-center gap-space-xs shadow-sm hover:bg-secondary-fixed transition-colors"
                type="button"
                onClick={() => setLocationOpen(true)}
              >
                <Icon name="location_on" className="text-primary text-[18px]" />
                <span className="font-label-md text-label-md text-primary font-semibold">
                  {district}, {city} • Within {radius}km
                </span>
                <Icon name="keyboard_arrow_down" className="text-primary text-[16px]" />
              </button>
            </div>

            <div className="flex items-center gap-space-sm w-full md:w-auto flex-1 max-w-xl justify-end">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
                />
                <input
                  className="w-full h-11 pl-10 pr-space-md bg-surface-subtle rounded-xl text-on-surface placeholder:text-text-tertiary font-body-md text-body-md outline-none focus:bg-surface-canvas shadow-sm transition-all"
                  placeholder="Search deals, businesses or products..."
                  type="search"
                />
              </div>
              <button
                className="h-11 px-space-sm bg-surface-subtle hover:bg-surface-container-high rounded-xl flex items-center gap-space-2xs text-text-primary font-label-md text-label-md shadow-sm transition-colors"
                type="button"
                onClick={onOpenFilters}
              >
                <Icon name="tune" className="text-[18px]" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                aria-label="Notifications"
                className="relative w-11 h-11 bg-surface-subtle hover:bg-surface-container-high rounded-xl flex items-center justify-center text-text-primary shadow-sm transition-colors"
                type="button"
              >
                <Icon name="notifications" className="text-[20px]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-container" />
              </button>
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary font-heading-sm text-heading-sm shadow-sm">
                JD
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-2xl">
          <section className="w-full relative rounded-2xl bg-surface-canvas shadow-md overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full overflow-hidden">
                <img
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={DEAL_OF_DAY_ALT}
                  src={DEAL_OF_DAY_IMAGE}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent lg:hidden" />
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-space-xs z-10">
                  <span className="px-space-sm py-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold rounded-full shadow-sm">
                    50% OFF
                  </span>
                  <span className="px-space-sm py-1 bg-surface-canvas/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-semibold rounded-full shadow-sm flex items-center gap-1">
                    <Icon name="star" className="text-[14px]" />
                    Top Pick
                  </span>
                  <span className="px-space-sm py-1 bg-primary text-on-primary font-label-sm text-label-sm font-semibold rounded-full shadow-sm">
                    Special Promo
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-1.5 rounded-full shadow-sm text-on-surface">
                  <Icon name="timer" className="text-tertiary-container text-[18px]" />
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">Ends in 07h 48m 12s</span>
                </div>
              </div>

              <div
                className="lg:col-span-5 p-space-xl flex flex-col justify-between bg-surface-canvas relative z-10 cursor-pointer"
                onClick={onOpenFeatured}
              >
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                      <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
                        Deal of the Day
                      </span>
                    </div>
                    <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption">
                      <Icon name="distance" className="text-[15px] text-primary" />
                      <span>Apo Legacy Tower • 1.1km</span>
                    </div>
                  </div>

                  <div className="space-y-space-2xs">
                    <span className="font-label-md text-label-md text-primary font-semibold">The Sky Lounge &amp; Grill</span>
                    <h2 className="font-heading-lg text-heading-lg font-bold text-text-primary leading-tight">
                      Chef&apos;s 5-Course Sunset Tasting Menu &amp; Wine Pairing
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary">
                      Immerse your senses with signature slow-roasted cuts, fresh Atlantic bites, and sommelier-curated
                      vintage reserves.
                    </p>
                  </div>

                  <div className="p-space-sm bg-surface-subtle rounded-xl space-y-space-2xs">
                    <div className="flex items-baseline gap-space-sm">
                      <span className="font-display-hero text-display-hero text-primary font-bold">₦22,500</span>
                      <span className="font-body-lg text-body-lg text-text-tertiary line-through">₦45,000</span>
                      <span className="px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                        Save ₦22,500
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-text-secondary font-caption text-caption pt-1">
                      <span>
                        Vouchers remaining: <strong className="text-text-primary">12 of 30 left</strong>
                      </span>
                      <span className="text-tertiary font-semibold">Claimed fast</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-space-md flex items-center justify-between gap-space-md border-t border-transparent">
                  <div className="flex items-center gap-space-md text-text-secondary">
                    <button
                      className="flex items-center gap-1 transition-colors text-text-secondary hover:text-primary"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleHeroLike();
                      }}
                    >
                      <Icon
                        name="favorite"
                        className={`text-[20px] ${heroLiked ? 'text-error' : 'text-tertiary'}`}
                        filled={heroLiked}
                      />
                      <span className="font-label-sm text-label-sm">148</span>
                    </button>
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors text-text-secondary"
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Icon name="chat_bubble_outline" className="text-[20px]" />
                      <span className="font-label-sm text-label-sm">32</span>
                    </button>
                  </div>
                  <button
                    className={`px-space-lg h-12 font-button-primary text-button-primary rounded-xl flex items-center gap-space-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      heroClaimed
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-primary-container hover:bg-primary text-on-primary shadow-md shadow-primary-container/20'
                    }`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClaim?.(() => setHeroClaimed(true));
                    }}
                  >
                    <span>{heroClaimed ? 'Claimed!' : 'Claim Deal'}</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h3 className="font-heading-md text-heading-md text-text-primary font-bold">
                  Deals in {district}, {city}{' '}
                  <span className="text-text-tertiary font-normal text-heading-sm">(6)</span>
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Hand-picked exclusive vouchers from verified neighborhood spots.
                </p>
              </div>

              <div className="flex items-center gap-space-sm self-start sm:self-auto">
                <div className="bg-surface-subtle p-1 rounded-xl flex items-center shadow-sm">
                  <button
                    aria-label="List View"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-canvas transition-colors"
                    type="button"
                    onClick={() => setView('list')}
                  >
                    <Icon name="format_list_bulleted" className="text-[20px]" />
                  </button>
                  <button
                    aria-label="Grid View"
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-canvas text-primary shadow-sm font-semibold"
                    type="button"
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                </div>
                <div className="h-6 w-px bg-surface-container-high" />
                <button
                  className="flex items-center gap-1 text-primary font-label-md text-label-md hover:underline"
                  type="button"
                >
                  <span>Nearest first</span>
                  <Icon name="sort" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {DISCOVERY_DEALS.map((deal) => (
                <article
                  key={deal.title}
                  role="button"
                  tabIndex={0}
                  onClick={onOpenDeal}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal();
                    }
                  }}
                  className="bg-surface-canvas rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={deal.imageAlt}
                      src={deal.image}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                        {deal.discount}
                      </span>
                      {deal.extra ? (
                        <span
                          className={`px-space-xs py-0.5 rounded-full font-caption text-caption shadow-sm ${deal.extra.className}`}
                        >
                          {deal.extra.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-surface-canvas/90 backdrop-blur-md px-2 py-0.5 rounded-md font-caption text-caption text-text-primary font-semibold shadow-sm flex items-center gap-1">
                      <Icon name="timer" className="text-[13px] text-tertiary" />
                      <span>{deal.timer}</span>
                    </div>
                  </div>

                  <div className="p-space-md flex-1 flex flex-col justify-between gap-space-md">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                        <span className="font-medium text-text-secondary">{deal.store}</span>
                        <span className="flex items-center gap-0.5">
                          <Icon name="near_me" className="text-[13px] text-primary" />
                          {deal.distance}
                        </span>
                      </div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h4>
                      <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{deal.copy}</p>
                    </div>

                    <div className="pt-space-xs flex items-center justify-between gap-space-sm border-t border-surface-subtle">
                      <div className="flex flex-col">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{deal.price}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-caption text-caption text-text-tertiary line-through">
                            {deal.oldPrice}
                          </span>
                          <span className="font-caption text-caption text-badge-discount-text font-semibold">
                            {deal.save}
                          </span>
                        </div>
                      </div>
                      <button
                        className={`h-10 px-space-md rounded-xl font-button-secondary text-button-secondary flex items-center justify-center transition-colors ${
                          claimed[deal.title]
                            ? 'bg-badge-discount-bg text-badge-discount-text font-semibold'
                            : 'bg-primary-container hover:bg-primary text-on-primary'
                        }`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim?.(() => claimDeal(deal.title));
                        }}
                      >
                        {claimed[deal.title] ? 'Claimed!' : 'Claim'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-space-lg flex justify-center">
              <button
                className="px-space-xl py-space-sm bg-surface-subtle hover:bg-surface-container-high rounded-full font-label-md text-label-md text-primary font-semibold flex items-center gap-space-2xs shadow-sm transition-all hover:gap-space-xs"
                type="button"
              >
                <span>Load More Apo Neighborhood Offers</span>
                <Icon name="keyboard_arrow_down" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </>
  );
}
