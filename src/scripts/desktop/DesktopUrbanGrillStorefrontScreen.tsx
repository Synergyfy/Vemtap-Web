import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useCart } from '../../context/CartContext';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import { findBusinessBySlug } from '../businessData';
import { naira, nairaToNumber } from '../catalogueData';

interface DesktopUrbanGrillStorefrontScreenProps {
  business?: { name?: string; slug?: string } | null;
  onNav: (key: DesktopNavKey) => void;
  activeNav?: DesktopNavKey;
  onClaim?: (onClaimed?: () => void) => void;
  /** Review the tray and submit the order (goes to checkout). */
  onCheckout: () => void;
}

const COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBrSfIC9lnN7T75rDz6EEswO324vMkUk8hyVDyfl-HwGeyklv08F72WJ0iwuuK-Y96WszEoQFHwo6sMChU7OwBzE_rqnjyiZ9FCDAputJQBX7146Gbe68DWRaPodEECPgdSu5dXwTC8gwz48NWIAX-dBUptZLbzlo6zi2TGB1nncOSCdq_pEjyIj6QlXPAS_E11i3Jtj0OPoDFNQOGhscrHCeyHnR5Kmd9WNjh9fVqc';

const COVER_ALT =
  'Warm atmospheric interior of a high-end contemporary steakhouse and bistro named Urban Grill in Abuja Nigeria, showing exposed warm wood paneling, glowing Edison filament bulbs, modern dark marble tables set with crystal glassware, and an open fire grill in background with vibrant flame embers, shot in cinematic commercial photography with soft golden lighting.';

const THUMBNAILS = [
  {
    alt: 'Close up gourmet plating of prime cut medium-rare ribeye steak drizzled with herb butter and smoked sea salt with rosemary sprig',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtXxr7nX8Q78g8WLp2MMzJUVHZRH3I4koyjP19cJ9PQemqvMHgJHCOY0aUon1aEjIS-qH18AoO0xcKlBYxdgB9W7BPslaRQ7VKkLd1v2NEMGa42DUfETVc1l-M_b053b5opysmSFLt2mkFy3H8AvYe5c8MeKt6srhWf81ARiBX23fAaSp_oJZ6MTcZ8VjZyq-sXXgBNZhcWMlEHHT-_VIySMJC9_fnEbh4I2eE7INz',
  },
  {
    alt: 'Artisanal stacked double smash cheeseburger on toasted brioche bun with crispy caramelized onions and melted aged cheddar',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXZbdhOarL0D4JU8TwpKqVIeU9xsbIzmP9WFKEgKt6hTPSAnIgawSGTchcMETLN7rwBBefCEGIYu33MNiaxFsGoNAGwVP3OYjrt_hPdr_8c-zFBVUDwdgls87kUOuqVu1zGhfhYdVrS5lrxz1SaP6s_vf1nlxQrqlH3W-gaNORc0mWzLFV9z7VwN6i57kvDtZqDPJfTjIjcXqEqirZwONZRtXlpnIJre-Q_jGCRqoH',
  },
  {
    alt: 'Craft peach iced tea cocktail in tall highball glass filled with clear ice cubes, fresh mint bouquet and sliced dried citrus',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv9WuM11yJpOrZJwsk6eLStLy9AwoqydVv9Akv7DkLP4hkwEMA6psjLHUmRn_VKaIPJqCipG5QP2n0VSdE4VZRdbtgs1BYFLxALaBWb3QRnxlINEiuzQxHLucYk_hWSYtNWU4WafyeekvdCN3zP1CGiGUQ8vK-Ih78jYAAT8CK7yjwUSUDE87VB7rv2yu8Rviq7cyJoik1cny3rfFo-RO3aLFXq7nmuDtbQbVdrCWE',
  },
];

const CATEGORIES = ['all', 'grills', 'burgers', 'sides', 'beverages', 'desserts'] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  all: 'All Items (34)',
  grills: 'Grills & Steaks',
  burgers: 'Burgers & Sandwiches',
  sides: 'Sides & Starters',
  beverages: 'Craft Beverages',
  desserts: 'Desserts',
};

interface Product {
  title: string;
  category: (typeof CATEGORIES)[number];
  searchTitle: string;
  description: string;
  price: string;
  image: string;
  alt: string;
  badge?: { label: string; className: string; icon?: string };
  meta?: string;
  deal?: boolean;
  featured?: boolean;
}

const PRODUCTS: Product[] = [
  {
    title: 'Woodfire Aged Ribeye Steak',
    category: 'grills',
    searchTitle: 'woodfire aged ribeye steak',
    description:
      '250g 28-day dry aged Prime Angus cut, basted with charred rosemary, sea salt crystals, and whipped black garlic compound butter.',
    price: '₦16,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwhxEjxDNfaEPLRYfZ9vbyKfafBbne7EMcexQzOWDivdaABrvkg1h5KlCgyWUamWiendAoVto_vfoe5H-ZB0aQSRDUrlC5_ujVkjMN1KrZhmQlQbP3Y6gbkYodtb3kSyAmuMTd3kWR5Fn8m3i7mdJUegKKr5a3M6No94FgFd0ev8wZUIL3SVfyAsGu3MyJx9zA_TdCaw37CGbJtBlwdHo37zeDG1e9-7SpGACQlv1L',
    alt: 'Plated medium rare woodfire grilled Angus ribeye steak resting on dark stoneware slate with melted compound thyme butter and charred cherry tomatoes',
    badge: { label: 'Chef Choice', className: 'bg-tertiary-container text-on-tertiary-container' },
    meta: '250g Prime',
  },
  {
    title: 'Double Smash Burger Deluxe',
    category: 'burgers',
    searchTitle: 'double smash burger deluxe',
    description:
      'Twin smashed chuck patties, slow caramelized onion jam, aged cheddar crust, pickles, and signature black truffle aioli on toasted brioche.',
    price: '₦6,500',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqvFoVcq0kBsNqezOIhy3EtOERfCGZAcI9X3_n-mx27ARU3RfMdwIErZq58TA-Dsjkq828FRu9lJWqDG_LGV9b8WLSkcFIulO77_PQC88qpLvrUH3pq1grenfhSDlQOYlR56XnL8SCmXP3tq83470kc2_ZDHcnhpitqXPZRvsYKboNpa3aFACYiBEgUHffBgHScpmfuUp2TkWYmY3E-Odyyz9QLCJGPXU_axCkKnsy',
    alt: 'Juicy double smash burger with melted sharp cheddar cheese, glistening balsamic caramelized onions, and house truffle aioli dripping over toasted buttery brioche bun',
    badge: { label: 'Top Seller', className: 'bg-primary-container text-on-primary-container' },
  },
  {
    title: 'Truffle Parmesan Hand-Cut Fries',
    category: 'sides',
    searchTitle: 'truffle parmesan hand-cut fries',
    description:
      'Double-fried Idaho russets, white truffle aroma, micro-planed 24-month Parmigiano-Reggiano, and chilled roast garlic dip.',
    price: '₦3,200',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwjE1H_DxxVrykkMTmnlOAszctltEMKAsu6rP-eyAg-rXNHdxN6bARSqG4gZ422Aoiv3AdsdzVyzVQy_TAvPAgIFIe_EFKZIbkzzmKzvN4T31Pw_3aYVtGdcU3IsD3K7VvGTlF-Wz0oUALDju4yHoHVsUCbHmJuhWuGFZG96MR6l71V9E2BpM6MbicS91oj6xcH-uy7d5VOvrLwpcwxjIR350mgLWliq-YaB-DaTAu',
    alt: 'Crispy golden hand-cut russet potato fries tossed with freshly grated white parmesan shavings, aromatic parsley flakes and served in silver cone with roasted garlic aioli dip',
  },
  {
    title: 'Charcoal BBQ Glazed Wings',
    category: 'sides',
    searchTitle: 'charcoal bbq glazed wings',
    description:
      'Hickory slow-smoked crispy chicken wings tossed in house tamarind molasses barbecue sauce with crushed sesame.',
    price: '₦4,800',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB42l73epIsgk7B_tY1WUgXkAMqupiWNuv_ESkPB4zFMGLJHAUbnkL3kSTaxvcdRGKX61AgsAXlCuxsu3Awt-sk3zxg4usFKI5P96mVC5E5nxuvlodT9YegySP-4LUk4qAzAgbAUEcO6ln8qQ0qKDUaXawe66WclpwBtDJSsgjAP5Tk7nDB_Q7wo2km_0PUq7QSX0D9WihtFoIqGltzqwZ684yj_egxL_WwbltvIGHX',
    alt: 'Six pieces of smoked chicken jumbo wings coated in sticky dark amber charcoal barbecue glaze sprinkled with toasted sesame seeds and fresh scallions',
    meta: '6 Pieces',
  },
  {
    title: 'Prime 3-Course Lunch Combo Pass',
    category: 'grills',
    searchTitle: 'prime 3-course lunch combo pass',
    description:
      'Complete dining package: 180g Sirloin cut + Truffle hand-cut fries + Signature craft peach iced tea.',
    price: '₦9,600',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA660DBbL4p5hdOqDxPgDA4Ajl4WEqysOI95IjBc1LsMBzWNA3rffVBm4P_4vIKE-twAe4Ppj6VMgYLuq0e7Y7sIGV8Qe2la8vCq52rfp7Yu8OmPEjeZB0aalsAdgsOt4ZtRq_YeIf2AEduQ0OS5BQYF2_Iq8TcJ-pN5anghOI3fHE-JCrjTdnWRE2J8qSE1W32sOCgCF-ra_GJKR9BRGwiFfREayGH5y801aK96dLb',
    alt: 'Complete restaurant lunch presentation featuring sliced tender sirloin steak, golden fries, and tall iced peach tea in an elegant bistro tabletop layout',
    badge: {
      label: '20% OFF Deal',
      className: 'bg-badge-discount-bg text-badge-discount-text',
      icon: 'high_res',
    },
    deal: true,
    featured: true,
  },
  {
    title: 'House Craft Cold Peach Iced Tea',
    category: 'beverages',
    searchTitle: 'house craft cold peach iced tea',
    description:
      'Slow-steeped Earl Grey tea infused with ripe white peach nectar, garden mint, Madagascar vanilla pod, and raw cane sugar.',
    price: '₦2,200',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_jIJuzHuQCibCcry0R3zeTk5u_vXIYhZ2WC4Gz83GfmAjU5GA7MPYsyb7Qz6Re1W9p5NaZ2XrzMyk19j_vNJLOTQhpp_tpmj8qHaL6W-Xo1jgtMpOHfwZLgrkQe9ovRDbV-Bu6jFFCA1ly91B04mNs2jdyMq0cE4yBaraOicB1CZ60yjoQG_ILANAScJjJyn-KD9KE-IYVLTQWJli1uGidzO0IUmJx_vTbbv8GSn8',
    alt: 'Refreshing glass tumbler of cold brewed peach iced tea filled with sparkling condensation, crushed ice, mint sprigs and fresh peach slices',
    badge: { label: 'House Crafted', className: 'bg-surface-tint-blue text-primary' },
  },
];

const HOURS = [
  { days: 'Monday – Thursday', time: '11:30 AM – 10:30 PM', active: true },
  { days: 'Friday – Saturday', time: '11:30 AM – 11:30 PM', active: false },
  { days: 'Sunday Brunch & Dinner', time: '12:00 PM – 10:00 PM', active: false },
];

const AMENITIES = [
  { icon: 'deck', label: 'Outdoor Terrace' },
  { icon: 'wifi', label: 'High-Speed Wi-Fi' },
  { icon: 'ac_unit', label: 'Full Climate AC' },
  { icon: 'local_parking', label: 'Guarded Valet' },
  { icon: 'power', label: 'Workstation Plugs' },
];

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkqJ2egqdMJDYhXwtfbtofw4rZ5LnJYXfh95JsApNRqJfZeb2gTtVJe2VOnOiRET8hdfJmHplM-4eXoEtDlezkRcjHu24236aoZZivMMwbj89LWU0A7GuKUx3RSH2e7ZeCFvC9YAH9zBON0XC8S8lUvmj7Duroz1MTb646xScBTSKfADkj_6oUWhKwGYkpWJyDSAeylDGaOE00iuuGI88j1KiSqkz3W5uMSeNvKq1P';

interface StorefrontDeal {
  badge: string;
  meta: string;
  metaIcon: string;
  title: string;
  price: string;
  was: string;
  image: string;
  alt: string;
}

const STOREFRONT_DEALS: StorefrontDeal[] = [
  {
    badge: '20% OFF',
    meta: 'Ends in 4h',
    metaIcon: 'timer',
    title: 'Prime 3-Course Lunch Combo & Drinks',
    price: '₦9,600',
    was: '₦12,000',
    image: PRODUCTS[4].image,
    alt: PRODUCTS[4].alt,
  },
  {
    badge: '15% OFF',
    meta: 'Valid on Weekdays',
    metaIcon: 'calendar_today',
    title: "Chef's Signature Dinner Platter for 2",
    price: '₦18,500',
    was: '₦21,800',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCK_Zasd3tU1LibEdoOmRkShhGkUdxaj1LyOHPImE9RxYJx7j8kCqQSsuERLETrt_VTim3zGSiFojl5EHTR8pg3DV1B0tNkDTkgDppYAlyiWpzGWFKd1KWlZ4ZuhS2zbSTRHHyTpFQVsdVa58jJMdK2AZGNKT-c8Un5N7UoPCG6SWn5qBUZXyVEyhlb0b1QWg4okDK2G5Q7CQGcaFvdAmm-5iCxRERXavJu8giLpArhM3IuGdEim6Xb4w',
    alt: 'Elegant signature dinner platter for two with grilled cuts, sides and garnish on dark slate table setting',
  },
  {
    badge: '10% OFF',
    meta: 'Ends Sunday',
    metaIcon: 'local_fire_department',
    title: 'Charcoal BBQ Wings & Chapman Pairing',
    price: '₦6,300',
    was: '₦7,000',
    image: PRODUCTS[3].image,
    alt: PRODUCTS[3].alt,
  },
];

export function DesktopUrbanGrillStorefrontScreen({ business, onNav, activeNav = 'businesses', onClaim, onCheckout: _onCheckout }: DesktopUrbanGrillStorefrontScreenProps) {
  const isKnownBusiness = !!business?.slug && !!findBusinessBySlug(business.slug);

  if (!business || !isKnownBusiness) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav={activeNav} withCustomerRail>
        <div className="w-full min-h-[calc(100vh-80px)] bg-surface px-6 py-16">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-surface-canvas p-10 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle text-primary">
              <Icon name="storefront" className="text-[32px]" />
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary">Storefront not available</h1>
            <p className="mt-3 max-w-md font-body-md text-body-md text-text-secondary leading-relaxed">
              There is no live storefront selected yet. Choose a business from discover or wait for the storefront data to load from the backend.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNav('discover')}
                className="h-11 rounded-xl bg-primary px-5 text-on-primary font-button-primary text-button-primary shadow-md transition-transform active:scale-[0.98]"
              >
                Browse businesses
              </button>
              <button
                type="button"
                onClick={() => onNav('dashboard')}
                className="h-11 rounded-xl bg-surface-subtle px-5 text-text-primary font-button-secondary text-button-secondary transition-colors hover:bg-surface-container-high"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </DesktopPage>
    );
  }

  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [claimedDeals, setClaimedDeals] = useState<Record<number, boolean>>({});
  const cart = useCart();
  const { submitCustomerStoreOrder } = useStoreOrdering({ withData: false });

  // Guest checkout state
  const [guestCheckoutOpen, setGuestCheckoutOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [confirmedOrderRef, setConfirmedOrderRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trayId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const addToTray = (product: Product) => {
    cart.add({
      id: trayId(product.title),
      name: product.title,
      price: nairaToNumber(product.price),
      image: product.image,
    });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;
    setIsSubmitting(true);

    const items = cart.lines.map((line, idx) => ({
      id: `pub-item-${idx + 1}`,
      productId: line.id,
      name: line.name,
      qty: line.qty,
      unitPrice: line.price,
      totalPrice: line.price * line.qty,
      image: line.image ?? '',
      available: true,
    }));

    const order = submitCustomerStoreOrder({
      status: 'new',
      customerName: guestName.trim(),
      customerPhone: guestPhone.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: 'Today',
      branchId: 'wuse-2',
      branchName: 'Wuse II Flagship',
      origin: 'Public Store Page',
      placementDetails: 'Online (Public Storefront)',
      items,
      estimatedTotal: cart.total,
      confirmedTotal: cart.total,
      isTotalConfirmed: false,
      customerNotes: guestNotes.trim() || undefined,
      pickupInstructions: 'Proceed to the VEMTAP Express Pickup Counter inside Urban Grill & Bistro. Present your Order Reference code to our cashier.',
      estimatedPrepMins: 20,
      assignedStaff: undefined,
    });

    setIsSubmitting(false);
    setGuestCheckoutOpen(false);
    setConfirmedOrderRef(order.orderRef);
    cart.clear();
  };

  const visibleProducts = PRODUCTS.filter(
    (product) =>
      (category === 'all' || product.category === category) &&
      (!query.trim() || product.searchTitle.includes(query.trim().toLowerCase())),
  );

  const resultsLabel =
    query.trim() || category !== 'all'
      ? `Showing ${visibleProducts.length} matching items`
      : 'Showing 6 featured selections';

  const containerClass = 'flex gap-5 overflow-x-auto pb-2 no-scrollbar';

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav={activeNav}>
      <div className="w-full bg-surface">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 font-caption text-caption text-text-secondary">
              <button type="button" className="hover:text-primary transition-colors flex items-center gap-1">
                <Icon name="home" className="text-[15px]" />
                <span>Abuja Hub</span>
              </button>
              <span className="text-outline-variant">/</span>
              <button type="button" className="hover:text-primary transition-colors">
                Apo District
              </button>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">Urban Grill &amp; Bistro</span>
            </nav>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-label-sm text-label-sm font-semibold text-emerald-700 bg-badge-discount-bg px-2.5 py-1 rounded-full">
                Accepting In-Store &amp; Pickup
              </span>
            </div>
          </div>
        </div>

        <section className="max-w-7xl w-full mx-auto px-6 lg:px-12 pb-8">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-surface-canvas">
            <div className="relative h-72 md:h-96 w-full overflow-hidden">
              <div
                aria-hidden="true"
                className="bg-cover bg-center w-full h-full transform hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('${COVER_IMAGE}')` }}
                title={COVER_ALT}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/35 to-transparent" />

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSaved((value) => !value)}
                  title="Save Business"
                  aria-label="Save Business"
                  className={`p-2.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md shadow-md transition-all flex items-center justify-center hover:bg-surface-canvas ${
                    saved ? 'text-error' : 'text-on-surface hover:text-error'
                  }`}
                >
                  <Icon name={saved ? 'favorite' : 'favorite_border'} filled={saved} className="text-[20px]" />
                </button>
                <button
                  type="button"
                  title="Share Storefront"
                  aria-label="Share Storefront"
                  className="p-2.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md text-on-surface hover:text-primary hover:bg-surface-canvas shadow-md transition-all flex items-center justify-center"
                >
                  <Icon name="share" className="text-[20px]" />
                </button>
              </div>

              <div className="absolute bottom-4 right-6 hidden md:flex items-center gap-2 p-1.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md shadow-md">
                {THUMBNAILS.map((thumbnail, index) => (
                  <div
                    key={thumbnail.src}
                    className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 ${
                      index === 0 ? 'ring-2 ring-primary-container' : ''
                    }`}
                  >
                    <img alt={thumbnail.alt} className="w-full h-full object-cover" src={thumbnail.src} />
                  </div>
                ))}
                <div className="px-2.5 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant font-medium cursor-pointer hover:text-primary">
                  <Icon name="photo_library" className="text-[16px]" />
                  <span>+18</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 md:left-8 right-6 md:right-80">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm">
                    <Icon name="verified" className="text-[16px]" />
                    <span>VEMTAP Verified</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-canvas/90 backdrop-blur text-on-surface font-caption text-caption font-semibold flex items-center gap-1">
                    <Icon name="policy" className="text-[15px] text-primary" />
                    <span>CAC RC-1784920</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-canvas/90 backdrop-blur text-on-surface font-caption text-caption font-semibold flex items-center gap-1">
                    <Icon name="star" filled className="text-[15px] text-amber-500" />
                    <span className="text-on-surface font-bold">4.9</span>
                    <span className="text-text-secondary">(184 Reviews)</span>
                  </span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-primary drop-shadow-md">
                  Urban Grill &amp; Bistro
                </h1>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-canvas">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 font-body-md text-body-md text-text-secondary">
                  <div className="flex items-center gap-1.5 text-on-surface font-medium">
                    <Icon name="location_on" className="text-primary text-[19px]" />
                    <span>Plot 14 Apo Boulevard, Apo District, Abuja</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-primary font-semibold">
                      0.8 km
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <Icon name="call" className="text-primary text-[19px]" />
                    <a className="hover:text-primary transition-colors" href="tel:+2348039204491">
                      +234 (0) 803 920 4491
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Icon name="schedule" className="text-emerald-600 text-[19px]" />
                    <span className="text-emerald-700 font-semibold">Open Now</span>
                    <span className="text-text-tertiary">•</span>
                    <span>Closes 10:30 PM</span>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
                  Apo's benchmark open-flame steakhouse and contemporary kitchen. Specializing in dry-aged West African
                  cuts, prime Angus ribeyes, wood-fired gourmet burgers, and tailored botanical craft mocktails in an
                  upscale dining room.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <a
                  className="px-5 py-3 rounded-xl bg-emerald-600 text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm w-full sm:w-auto"
                  href="https://wa.me/2348039204491"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon name="chat" className="text-[20px]" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  className="px-5 py-3 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-2 hover:opacity-95 shadow-md hover:scale-[0.99] transition-all w-full sm:w-auto"
                >
                  <Icon name="forum" className="text-[20px]" />
                  <span>Direct Chat on VEMTAP</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl w-full mx-auto px-6 lg:px-12 pb-8">
          <div className="rounded-2xl p-6 md:p-7 bg-gradient-to-r from-primary via-primary-container to-secondary flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md text-on-primary relative overflow-hidden">
            <div className="absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-on-primary/10 blur-2xl pointer-events-none" />
            <div className="flex items-start md:items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-surface-canvas/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Icon name="local_offer" className="text-on-primary text-[28px]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-caption text-caption uppercase tracking-wider font-bold bg-surface-canvas text-primary">
                    Limited VEMTAP Perk
                  </span>
                  <span className="font-caption text-caption opacity-90">Valid Mon-Fri, 12PM - 4PM</span>
                </div>
                <h3 className="font-heading-md text-heading-md font-bold tracking-tight text-on-primary">
                  Prime 3-Course Lunch Combo — 20% OFF
                </h3>
                <p className="font-body-md text-body-md text-on-primary/80">
                  Includes Sirloin steak cut, truffle side fries, and artisan craft beverage for only{' '}
                  <span className="font-bold text-on-primary underline decoration-2">₦9,600</span> (was ₦12,000).
                </p>
              </div>
            </div>
            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => onClaim?.()}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-surface-canvas text-primary font-button-primary text-button-primary hover:bg-surface-tint-blue shadow-lg hover:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="confirmation_number" className="text-[19px]" />
                <span>Claim Voucher</span>
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl w-full mx-auto px-6 lg:px-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading-md text-heading-md text-on-surface">Active Deals</h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold">
                      {STOREFRONT_DEALS.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav('deals')}
                    className="h-9 px-4 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors shrink-0"
                  >
                    See All ({STOREFRONT_DEALS.length})
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {STOREFRONT_DEALS.map((deal, idx) => (
                    <div
                      key={deal.title}
                      className="w-[320px] shrink-0 bg-surface-canvas rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3"
                    >
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                        <img alt={deal.alt} className="w-full h-full object-cover" src={deal.image} />
                        <span className="absolute top-1.5 left-1.5 bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption px-1.5 py-0.5 rounded font-semibold">
                          {deal.badge}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center gap-1 text-tertiary font-caption text-caption mb-0.5">
                            <Icon name={deal.metaIcon} className="text-[14px]" />
                            <span>{deal.meta}</span>
                          </div>
                          <h3 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                            {deal.title}
                          </h3>
                        </div>
                        <div className="flex items-end justify-between mt-2 gap-2">
                          <div>
                            <div className="font-heading-sm text-heading-sm text-text-primary">{deal.price}</div>
                            <div className="font-caption text-caption text-text-tertiary line-through -mt-0.5">
                              {deal.was}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onClaim?.(() => setClaimedDeals((state) => ({ ...state, [idx]: true })))}
                            className={`h-8 px-4 rounded-xl font-label-sm text-label-sm flex items-center justify-center active:scale-95 transition-transform shadow-sm shrink-0 ${
                              claimedDeals[idx]
                                ? 'bg-badge-discount-bg text-badge-discount-text'
                                : 'bg-primary-container text-on-primary hover:bg-primary hover:text-on-primary'
                            }`}
                          >
                            {claimedDeals[idx] ? 'Claimed' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-canvas p-4 rounded-2xl shadow-sm flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:flex-1">
                    <Icon
                      name="search"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]"
                    />
                    <input
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-on-surface placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      id="menu-search-input"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search dish, cuts, drinks, ingredients..."
                      type="text"
                      value={query}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold whitespace-nowrap transition-all ${
                        category === item
                          ? 'bg-surface-tint-blue text-primary-container shadow-xs'
                          : 'text-text-secondary hover:text-on-surface bg-surface-subtle'
                      }`}
                    >
                      {CATEGORY_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="font-heading-md text-heading-md text-on-surface">Products</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Prices displayed in Nigerian Naira (₦). Tax &amp; service included.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-label-sm text-label-sm text-text-secondary">{resultsLabel}</span>
                  <button
                    type="button"
                    onClick={() => onNav('all-products')}
                    className="h-9 px-4 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    See All
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className={containerClass}>
                {visibleProducts.map((product) => (
                  <div
                    key={product.title}
                    onClick={() => onNav('product-detail')}
                    className={`group w-[300px] shrink-0 bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
                      product.featured ? 'ring-2 ring-primary-container/20' : ''
                    }`}
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                        <img
                          alt={product.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={product.image}
                        />
                        {product.badge && (
                          <span
                            className={`absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption font-semibold shadow-sm flex items-center gap-1 ${product.badge.className}`}
                          >
                            {product.badge.icon && <Icon name={product.badge.icon} className="text-[14px]" />}
                            <span>{product.badge.label}</span>
                          </span>
                        )}
                        {product.meta && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md font-caption text-caption bg-inverse-surface/85 backdrop-blur text-inverse-on-surface">
                            {product.meta}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-heading-sm text-heading-sm text-on-surface group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="font-caption text-caption text-text-secondary line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between pt-3">
                        {product.deal ? (
                          <div>
                            <span className="font-heading-sm text-heading-sm text-primary-container font-bold">
                              {product.price}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary line-through ml-1.5">
                              ₦12,000
                            </span>
                          </div>
                        ) : (
                          <span className="font-heading-sm text-heading-sm text-on-surface font-bold">
                            {product.price}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addToTray(product);
                          }}
                          className="h-10 px-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Icon name={cart.qtyOf(trayId(product.title)) > 0 ? 'check' : 'add'} className="text-[18px]" />
                          <span>{cart.qtyOf(trayId(product.title)) > 0 ? `In Tray (${cart.qtyOf(trayId(product.title))})` : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-surface-subtle flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-3">
                  <Icon name="verified" className="text-primary-container text-[24px]" />
                  <div className="space-y-0.5">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">
                      Zero Markup Guarantee
                    </h4>
                    <p className="font-caption text-caption text-text-secondary">
                      All prices on VEMTAP reflect real in-house physical menu pricing without delivery platform
                      markups.
                    </p>
                  </div>
                </div>
                <button type="button" className="font-label-sm text-label-sm font-semibold text-primary hover:underline shrink-0">
                  Learn More
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="shopping_bag" className="text-primary text-[22px]" />
                    <h3 className="font-heading-sm text-heading-sm text-on-surface">Your Tray Selection</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-caption text-caption text-primary font-bold">
                    {cart.count} {cart.count === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div className="space-y-3 py-2">
                  {cart.lines.length === 0 ? (
                    <div className="py-6 text-center text-text-tertiary flex flex-col items-center gap-2">
                      <Icon name="lunch_dining" className="text-[36px] text-surface-variant" />
                      <p className="font-body-md text-body-md text-text-secondary">
                        Select any item to start an in-store order or pickup request.
                      </p>
                    </div>
                  ) : (
                    cart.lines.map((line) => (
                      <div key={line.id} className="flex items-center gap-3 py-2 border-b border-border-subtle/50 last:border-0">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface-container shrink-0">
                          <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{line.name}</p>
                          <p className="font-caption text-caption text-text-secondary">{naira(line.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            aria-label={`Decrease ${line.name} quantity`}
                            onClick={() => cart.decrement(line.id)}
                            className="w-7 h-7 rounded-lg bg-surface-subtle flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                          >
                            <Icon name="remove" className="text-[15px]" />
                          </button>
                          <span className="font-label-md text-label-md text-on-surface font-bold min-w-[16px] text-center">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${line.name} quantity`}
                            onClick={() => cart.increment(line.id)}
                            className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:opacity-95 transition-all"
                          >
                            <Icon name="add" className="text-[15px]" />
                          </button>
                        </div>
                        <span className="font-label-md text-label-md text-on-surface font-bold shrink-0 w-20 text-right">
                          {naira(line.price * line.qty)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                    <span>Estimated Subtotal</span>
                    <span className="font-semibold text-on-surface">{naira(cart.total)}</span>
                  </div>
                  <div className="flex items-center justify-between font-caption text-caption text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Icon name="credit_card_off" className="text-[15px]" />
                      <span>Direct In-Store Settlement</span>
                    </span>
                    <span>No VEMTAP Fee</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={cart.lines.length === 0}
                  onClick={() => setGuestCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="send" className="text-[19px]" />
                  <span>Submit Order to Store</span>
                </button>
              </div>

              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Location &amp; Access</h3>
                  <span className="font-caption text-caption text-primary font-semibold">Apo Zone B</span>
                </div>
                <div
                  className="w-full h-44 rounded-xl bg-cover bg-center overflow-hidden shadow-inner relative flex items-end p-3 group cursor-pointer"
                  style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
                  <div className="relative z-10 w-full flex items-center justify-between">
                    <div className="text-on-primary">
                      <p className="font-label-sm text-label-sm font-bold">Plot 14 Apo Blvd</p>
                      <p className="font-caption text-caption text-on-primary/80">Near Apo Legislative Quarters</p>
                    </div>
                    <a
                      className="px-3 py-1.5 rounded-lg bg-surface-canvas text-on-surface font-caption text-caption font-semibold hover:bg-surface-tint-blue shadow-md transition-all flex items-center gap-1"
                      href="https://maps.google.com/?q=Apo+District+Abuja"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon name="directions" className="text-[15px] text-primary" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface">Weekly Schedule</h4>
                  <div className="space-y-1.5 font-caption text-caption text-text-secondary">
                    {HOURS.map((row) => (
                      <div
                        key={row.days}
                        className={`flex items-center justify-between py-1 px-2.5 rounded-lg ${
                          row.active ? 'bg-surface-tint-blue font-semibold text-primary' : ''
                        }`}
                      >
                        <span>{row.days}</span>
                        <span>{row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface">Venue Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((amenity) => (
                      <span
                        key={amenity.label}
                        className="px-3 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption flex items-center gap-1"
                      >
                        <Icon name={amenity.icon} className="text-[15px] text-primary" />
                        <span>{amenity.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle/50">
                  <button
                    type="button"
                    className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors flex items-center justify-between w-full"
                  >
                    <span>Own this business? Update your menu</span>
                    <Icon name="chevron_right" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Guest Checkout Modal */}
      {guestCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setGuestCheckoutOpen(false)} />
          <form
            onSubmit={handleSubmitOrder}
            className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 space-y-space-md"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="receipt_long" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">Confirm Your Order</h3>
                  <p className="text-caption text-text-secondary">You'll collect &amp; pay in-store. No online payment.</p>
                </div>
              </div>
              <button type="button" onClick={() => setGuestCheckoutOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle">
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Order summary */}
            <div className="rounded-xl bg-surface-subtle border border-border-subtle p-3 space-y-1.5">
              {cart.lines.map(line => (
                <div key={line.id} className="flex items-center justify-between text-body-sm">
                  <span className="text-text-primary">{line.name} × {line.qty}</span>
                  <span className="font-semibold text-text-primary">{naira(line.price * line.qty)}</span>
                </div>
              ))}
              <div className="border-t border-border-subtle mt-2 pt-2 flex justify-between font-bold text-body-md">
                <span>Total (Est.)</span>
                <span className="text-primary">{naira(cart.total)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-caption font-semibold text-text-primary">Your Name *</label>
              <input
                required
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="e.g. Amina Bello"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
              />
            </div>

            <div className="space-y-1">
              <label className="text-caption font-semibold text-text-primary">Phone Number *</label>
              <input
                required
                type="tel"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
              />
            </div>

            <div className="space-y-1">
              <label className="text-caption font-semibold text-text-primary">Special Instructions (Optional)</label>
              <textarea
                rows={2}
                value={guestNotes}
                onChange={e => setGuestNotes(e.target.value)}
                placeholder="e.g. Medium-rare, no pickles..."
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
              <Icon name="info" className="text-[15px] text-amber-600 shrink-0 mt-0.5" />
              <p className="text-caption text-amber-700">You will pay and collect your order at the store counter. Please show your order reference to our cashier.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setGuestCheckoutOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md font-semibold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Icon name="sync" className="text-[16px] animate-spin" /> Submitting...</> : <><Icon name="check_circle" className="text-[16px]" /> Submit Order</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order Confirmed Overlay */}
      {confirmedOrderRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 flex flex-col items-center text-center gap-space-md">
            <div className="w-20 h-20 rounded-full bg-badge-discount-bg flex items-center justify-center">
              <Icon name="check_circle" className="text-[48px] text-badge-discount-text" />
            </div>
            <div>
              <h2 className="text-heading-xl font-heading-xl font-bold text-text-primary">Order Submitted!</h2>
              <p className="text-body-sm text-text-secondary mt-1">Your order has been sent to the Urban Grill &amp; Bistro team.</p>
            </div>
            <div className="w-full p-4 rounded-xl bg-surface-tint-blue/20 border border-primary/30">
              <p className="text-caption text-text-tertiary font-medium">Your Order Reference</p>
              <p className="text-heading-xl font-heading-xl font-bold text-primary tracking-widest mt-1">{confirmedOrderRef}</p>
              <p className="text-caption text-text-secondary mt-2">Show this to the cashier at the pickup counter to collect your order &amp; pay.</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle w-full text-left space-y-1">
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Icon name="schedule" className="text-[14px]" />
                <span>Estimated preparation: <strong>~20 minutes</strong></span>
              </div>
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Icon name="location_on" className="text-[14px]" />
                <span>Pickup at <strong>Wuse II Flagship</strong> Counter A</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmedOrderRef(null)}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold shadow-sm transition-all"
            >
              Done — Back to Menu
            </button>
          </div>
        </div>
      )}
    </DesktopPage>
  );
}
