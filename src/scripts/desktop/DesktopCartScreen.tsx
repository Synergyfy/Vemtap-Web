import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopCartScreenProps {
  onNav: (key: DesktopNavKey) => void;
}

interface CartItem {
  id: string;
  name: string;
  meta?: string;
  note?: string;
  noteLabel?: string;
  noteText?: string;
  price: number;
  unit: string;
  unitNote?: string;
  stepper: boolean;
  image?: string;
  alt?: string;
  icon?: string;
}

interface CartVenue {
  id: string;
  name: string;
  icon: string;
  iconClass: string;
  address: string;
  distance: string;
  status: string;
  statusClass: string;
  badge: string;
  badgeClass: string;
  discountIcon: string;
  discountLine: string;
  total: number;
  cta: string;
  items: CartItem[];
}

const SAVED = [
  {
    store: 'Sole District Leather',
    name: 'Sole District Leather Tote Bag',
    price: '₦34,000',
    tag: 'Apo District',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRnXUaNdQ6lXD6ZcIPQbpmyHIm28zTTfa0YZCXT6g2iRL51_yOwtvwLSug69bw8AHp0XfIXNdYZksm2OMgLI2QSq64H7kQRyI0DpLCxXHAwUCK_2cOp0AG5moQfny0fTugmnSXpvsy8BjcDgwp3ACQ2WvswIGOzpDhdqQ8ZIr4qujAJU9jhazLBOzttq3TV9eEAo_6Is3klNNS6C5Fnrbl15xWH1Zk2cAkQZIbJLDW',
    alt: 'Handcrafted luxury cognac brown genuine leather tote bag resting on minimal concrete plinth, boutique accessories display, premium craftsmanship in Abuja Nigeria',
  },
  {
    store: 'Artisan Bakery Apo',
    name: 'Artisan Bakery Sourdough Basket',
    price: '₦4,500',
    tag: 'Fresh Daily',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnMTfBX6qnzTwa2XpQLuT-p7Tl_TslLpsCkS_-xzDLcTVtz1OdDTmUQ5gKdv5wOTuoOPAziK0BkhhXZWd997FrV-ClzRtu9_pwTO23dqpqu0liJKQgKb-JQB_32mUbKf82MMscsbxs-BVicR7LQqTRSvZhYeRrXD76cffFPcUnSoS2rVJ8jCA41c1su-s_l1VRiej6Dia_y653_JC3q6CdQ7OxgBVFKuRuV5QE9L7X',
    alt: 'Artisanal freshly baked European style rustic sourdough loaves with crisp blistered crust inside a wicker basket on a clean baker bench, morning Abuja bakery aesthetic',
  },
  {
    store: 'Pulse Fitness Hub',
    name: 'Pulse Fitness Day Pass',
    price: '₦5,000',
    tag: 'Maitama',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBs15aXzgpo7wOguZfVDnGCqur2XsSuE8ujyz5HHRRkrN2WyhIJaXzbM4_WsnlZT31SffsSY7k3qzqimY3Dno1oyiaFCy7wsPxHXCLGLo13R1i7uT1KDutUL_JzZAVPTEvGZwkdORbrfPw7AUXpEQjHC97vJOjjeibfBE-ih4_0KurQy2gVQr7NatbxJyYlu8pX19AeC6Xy7OCpWPwcG1VLxm8ZRPnwbyi_lQ8E8evu',
    alt: 'High-end wellness club workout floor with state-of-the-art strength training machines, warm neon accent lighting and floor to ceiling glass windows overlooking Maitama Abuja greenery',
  },
];

const INITIAL_VENUES: CartVenue[] = [
  {
    id: 'urban',
    name: 'Urban Grill & Bistro',
    icon: 'restaurant',
    iconClass: 'bg-surface-container text-primary',
    address: 'Plot 14 Apo Blvd',
    distance: '0.8 km',
    status: 'Accepting In-Store Orders',
    statusClass: 'text-badge-discount-text',
    badge: 'Order #APO-8841',
    badgeClass: 'bg-surface-subtle text-text-secondary',
    discountIcon: 'local_offer',
    discountLine: '-₦2,400 Apo Dining Perk',
    total: 15800,
    cta: 'Proceed with Urban Grill (₦15,800)',
    items: [
      {
        id: 'ribeye',
        name: 'Woodfire Aged Ribeye Steak',
        meta: '(250g Prime Angus)',
        noteLabel: 'Customizations:',
        noteText: 'Medium Rare • Green Peppercorn Jus (on side) • Truffle Fries',
        price: 16000,
        unit: '₦16,000',
        stepper: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDcf13Ls9md7i3rG4tT0dUgKM2EOHfZwMZwmT63In7VhI3ICZuCIQ6MuFYCJdY6je8wiXT12fBDcfcf3_Hk-u_d31eKEJE_mpK1hQv_J5RcTJoGkDkC87w4oBEzZizLeQWT78P6_pSNCqyZBAaFyBe65dhiZarX8NulIEV4rvwQrrWue8RzsTetuS1GLORjBq-fSSyb7sJ4BnWI70IVbDPsZtaQaX6_fmfKmMOfFtG2',
        alt: 'A juicy, grilled woodfire Prime Angus ribeye steak resting on a rustic dark slate board with truffle fries and a small brass saucepan of green peppercorn jus, warm ambient restaurant lighting in Abuja, high resolution culinary photography',
      },
      {
        id: 'tea',
        name: 'House Craft Peach Iced Tea',
        noteText: 'Chilled, slow-steeped organic black tea with Apo orchard peach syrup',
        price: 2200,
        unit: '₦2,200',
        stepper: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAlY-7LBD6lNYwBjgfwZybL2mn9KofgOKyrRRvwsBeDkoBnqRtYxPapfvJA0dso_agyVOZ0BBmkHYkbXJCyQ5xRPYyyAa4KN6JvjiSN4fSJ2C1U23oE2gVmJI-eE1ELB5OmSJqgVedGG9i3IfYoCR0i_ZnEuKX2r36ifhXJgSsb3UOdEd3BufxOKphW85fHDq5STFvGELs7ePZZxWQr8IN6lMbYkxfDEsz69tB-xt8u',
        alt: 'A tall condensation-beaded glass of freshly brewed house peach iced tea garnished with fresh mint sprigs and sliced Nigerian sun-ripened yellow peaches, bright afternoon daylight, aesthetic beverage styling',
      },
    ],
  },
  {
    id: 'glow',
    name: 'Glow & Serenity Spa & Salon',
    icon: 'spa',
    iconClass: 'bg-tertiary-fixed text-tertiary',
    address: 'Maitama Heights',
    distance: '1.4 km',
    status: 'Appointment Booking Pending',
    statusClass: 'text-primary',
    badge: 'Slot: Today 4:30 PM',
    badgeClass: 'bg-surface-subtle text-text-secondary',
    discountIcon: 'verified',
    discountLine: '-₦4,000 (20% Spa Pass Applied)',
    total: 16000,
    cta: 'Complete Scheduling (₦16,000)',
    items: [
      {
        id: 'facial',
        name: 'Deep Hydration Radiance Facial',
        meta: '(60 mins)',
        noteLabel: 'Assigned Specialist:',
        noteText: 'Amara K. (Lead Aesthetician)',
        price: 16000,
        unit: '₦16,000',
        unitNote: '1 Guest Session',
        stepper: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBH4C88ngY5fB8zS4tCHCE5BXUR5wW5lH-WcKFSOhsye4kxYPS8POGA1YG_IQXi_1DA4YZ0spIUcrPQdxZY-kSwen7iDUzIIU1o-wpgzdP-_I2-dCTUersevFlGinrbJX-Kc0h6xHac0rfp3Eq9OvouHapm2sqIOLLmlV1bLiCV8gLI3Azs0AM_UQjf6m1k1iTtpcom-L_olbo7K1W1KoFF0WTfdSBF4xHuyP9DY0Cx',
        alt: 'Serene luxury day spa treatment room in Maitama Abuja, glowing warm amber LED lights, white orchids, aesthetic skincare serums and organic facial oils neatly arranged on an immaculate wooden counter',
      },
      {
        id: 'led',
        name: 'LED Light Therapy Booster Add-on',
        noteText: 'Red & NIR wavelength collagen stimulation during final hydration phase',
        price: 4000,
        unit: '₦4,000',
        unitNote: 'Session Add-on',
        stepper: false,
        icon: 'light_mode',
      },
    ],
  },
];

interface CartItemState {
  qty: number;
  removed: boolean;
}

const INITIAL_QTYS: Record<string, CartItemState> = {
  ribeye: { qty: 1, removed: false },
  tea: { qty: 1, removed: false },
  facial: { qty: 1, removed: false },
  led: { qty: 1, removed: false },
};

export function DesktopCartScreen({ onNav }: DesktopCartScreenProps) {
  const [items, setItems] = useState<Record<string, CartItemState>>(INITIAL_QTYS);

  const changeQty = (id: string, delta: number) =>
    setItems((current) => ({
      ...current,
      [id]: { ...current[id], qty: Math.max(1, current[id].qty + delta) },
    }));

  const removeItem = (id: string) =>
    setItems((current) => ({ ...current, [id]: { ...current[id], removed: true } }));

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="cart">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-caption font-caption text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('discover')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={() => onNav('dashboard')} type="button">
              Customer Dashboard
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-medium">Shopping Cart &amp; Saved Items</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex flex-col gap-1 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Direct Local Fulfillment</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                My Cart &amp; Saved Hub
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary">
                Review items added from local Apo &amp; Maitama merchants before placing your direct orders or
                visiting in store.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0 bg-surface-subtle p-1 rounded-xl shadow-sm">
              <span className="px-3 py-2 bg-surface-canvas rounded-lg text-text-primary font-label-sm text-label-sm shadow-sm flex items-center gap-1.5">
                <Icon name="storefront" className="text-[16px] text-badge-discount-text" />
                <span>2 Merchant Venues</span>
              </span>
              <span className="px-3 py-2 text-text-secondary font-label-sm text-label-sm flex items-center gap-1.5">
                <Icon name="schedule" className="text-[16px]" />
                <span>Ready in ~35m</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="bg-surface-tint-blue rounded-xl p-4 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="payments" className="text-[22px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading-sm text-heading-sm text-text-primary">VEMTAP Zero-Fee Commerce</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                      0% Platform Markup
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    You pay merchants directly in-store via POS card, cash, or instant bank transfer upon arrival.
                    VEMTAP never adds platform markups, handling surcharges, or hidden fees.
                  </p>
                </div>
              </div>

              {INITIAL_VENUES.map((venue) => {
                const visibleItems = venue.items.filter((item) => !items[item.id].removed);
                const oldTotal =
                  venue.id === 'urban'
                    ? visibleItems.reduce((sum, item) => sum + item.price * items[item.id].qty, 0)
                    : visibleItems.reduce((sum, item) => sum + item.price, 0);
                return (
                  <section
                    key={venue.id}
                    className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading-md text-heading-md ${venue.iconClass}`}
                        >
                          <Icon name={venue.icon} className="text-[26px]" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h2 className="font-heading-md text-heading-md text-text-primary">{venue.name}</h2>
                            <span title={`Verified ${venue.address} Merchant`}>
                              <Icon name="verified" className="text-[18px] text-primary" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-caption text-caption text-text-tertiary">
                            <span>{venue.address}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Icon name="location_on" className="text-[13px]" />
                              <span>{venue.distance}</span>
                            </span>
                            <span>•</span>
                            <span className={`${venue.statusClass} font-medium flex items-center gap-0.5`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{venue.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full font-label-sm text-label-sm w-fit ${venue.badgeClass}`}
                      >
                        {venue.badge}
                      </span>
                    </div>

                    <div className="flex flex-col gap-6">
                      {visibleItems.length === 0 && (
                        <div className="p-6 bg-surface-subtle rounded-xl text-center font-body-md text-body-md text-text-secondary">
                          All items removed from this venue. Browse the storefront to add more.
                        </div>
                      )}
                      {visibleItems.map((item) => (
                        <div
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface-subtle rounded-xl hover:bg-surface-container-low transition-colors"
                          key={item.id}
                        >
                          <div className="flex items-start gap-4">
                            {item.image ? (
                              <img
                                alt={item.alt}
                                className="w-20 h-20 rounded-lg object-cover shrink-0 shadow-sm"
                                src={item.image}
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm">
                                <Icon name={item.icon ?? 'spa'} className="text-[32px]" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-heading-sm text-heading-sm text-text-primary">{item.name}</span>
                                {item.meta && (
                                  <span className="font-caption text-caption text-text-tertiary">{item.meta}</span>
                                )}
                              </div>
                              <p className="font-caption text-caption text-text-secondary leading-snug">
                                {item.noteLabel && (
                                  <>
                                    <span className="text-text-primary font-medium">{item.noteLabel}</span>{' '}
                                  </>
                                )}
                                {item.noteText}
                              </p>
                              <div className="flex items-center gap-4 pt-0.5 font-caption text-caption">
                                {item.stepper ? (
                                  <button
                                    className="text-primary hover:underline font-medium flex items-center gap-1"
                                    type="button"
                                  >
                                    <Icon name="tune" className="text-[14px]" />
                                    <span>Edit Customization</span>
                                  </button>
                                ) : (
                                  <button
                                    className="text-primary hover:underline font-medium flex items-center gap-1"
                                    onClick={() => onNav('spa-booking')}
                                    type="button"
                                  >
                                    <Icon name="calendar_month" className="text-[14px]" />
                                    <span>Reschedule Slot</span>
                                  </button>
                                )}
                                <span className="text-text-tertiary">•</span>
                                <button
                                  className="text-error hover:underline font-medium flex items-center gap-1"
                                  onClick={() => removeItem(item.id)}
                                  type="button"
                                >
                                  <Icon name="delete" className="text-[14px]" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                            <span className="font-heading-sm text-heading-sm text-text-primary">{item.unit}</span>
                            {item.stepper ? (
                              <div className="flex items-center bg-surface-canvas rounded-lg shadow-sm p-1">
                                <button
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container rounded transition-colors"
                                  onClick={() => changeQty(item.id, -1)}
                                  type="button"
                                >
                                  <Icon name="remove" className="text-[16px]" />
                                </button>
                                <span className="w-8 text-center font-label-md text-label-md font-semibold text-text-primary">
                                  {items[item.id].qty}
                                </span>
                                <button
                                  aria-label={`Increase quantity of ${item.name}`}
                                  className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container rounded transition-colors"
                                  onClick={() => changeQty(item.id, 1)}
                                  type="button"
                                >
                                  <Icon name="add" className="text-[16px]" />
                                </button>
                              </div>
                            ) : (
                              <span className="font-caption text-caption text-text-tertiary">{item.unitNote}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 bg-surface-tint-blue/40 -mx-6 -mb-6 p-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                          <Icon name={venue.discountIcon} className="text-[18px]" />
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-label-md text-label-md">
                            <span className="text-text-secondary line-through">₦{oldTotal.toLocaleString()}</span>
                            <span className="font-semibold text-badge-discount-text">{venue.discountLine}</span>
                          </div>
                          <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                            Venue Total: ₦{venue.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onNav(venue.id === 'urban' ? 'product-detail' : 'spa-booking')}
                        className="w-full sm:w-auto px-6 py-3 bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl hover:bg-primary transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                        type="button"
                      >
                        <span>{venue.cta}</span>
                        <Icon name="arrow_forward" className="text-[18px]" />
                      </button>
                    </div>
                  </section>
                );
              })}

              <section className="flex flex-col gap-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="bookmark_heart" className="text-primary text-[24px]" />
                    <h2 className="font-heading-lg text-heading-lg text-text-primary">
                      Saved For Later &amp; Wishlist
                    </h2>
                  </div>
                  <button className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1" type="button">
                    <span>View All (7)</span>
                    <Icon name="chevron_right" className="text-[16px]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SAVED.map((item) => (
                    <div
                      className="bg-surface-canvas rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 group"
                      key={item.name}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="relative w-full h-36 rounded-lg overflow-hidden bg-surface-container">
                          <img
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={item.image}
                          />
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                            {item.tag}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-text-tertiary">{item.store}</span>
                          <h3 className="font-heading-sm text-heading-sm text-text-primary line-clamp-1">{item.name}</h3>
                          <span className="font-label-md text-label-md font-semibold text-text-primary mt-1">
                            {item.price}
                          </span>
                        </div>
                      </div>
                      <button
                        className="w-full py-2 px-3 bg-surface-subtle hover:bg-surface-tint-blue text-primary font-label-md text-label-md font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        type="button"
                      >
                        <Icon name="add_shopping_cart" className="text-[16px]" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="bg-surface-canvas rounded-xl p-6 shadow-md flex flex-col gap-6">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-heading-md text-heading-md text-text-primary">Tray Summary</h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption font-semibold">
                    2 Merchants • 4 Items
                  </span>
                </div>
                <div className="flex flex-col gap-3 font-body-md text-body-md">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-text-primary">₦38,200</span>
                  </div>
                  <div className="flex justify-between items-center text-badge-discount-text">
                    <span className="flex items-center gap-1 font-medium">
                      <Icon name="verified" className="text-[16px]" />
                      <span>VEMTAP Tap Deals &amp; Perks</span>
                    </span>
                    <span className="font-semibold">-₦6,400</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary">
                      <span className="flex items-center gap-1" title="Always 0% on VEMTAP">
                        <span>Platform Access Fee</span>
                        <Icon name="info" className="text-[14px] text-text-tertiary" />
                      </span>
                    <span className="font-medium text-badge-discount-text">FREE (₦0.00)</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary">
                    <span>Estimated Taxes (VAT 7.5%)</span>
                    <span className="font-caption text-caption text-text-tertiary">Included in menu</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-heading-sm text-heading-sm text-text-primary">Total Settlement Amount</span>
                    <span className="font-display-hero text-display-hero text-primary">₦31,800</span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary">
                    Consolidated amount across both venues. Each paid separately on site.
                  </p>
                </div>
                <div className="bg-surface-subtle p-4 rounded-xl flex items-start gap-3 text-text-secondary font-caption text-caption">
                  <Icon name="shield" className="text-[18px] text-primary shrink-0" />
                  <span>
                    Pay directly at each respective merchant venue upon service completion or food pickup. Verified
                    NDPR compliant local commerce.
                  </span>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <button
                    className="w-full py-3 px-6 bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl hover:bg-primary transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                    type="button"
                  >
                    <span>Review Fulfillment Instructions</span>
                    <Icon name="receipt_long" className="text-[18px]" />
                  </button>
                  <button
                    className="w-full py-2.5 px-4 bg-surface-subtle hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary rounded-xl transition-colors flex items-center justify-center gap-2"
                    type="button"
                  >
                    <Icon name="share" className="text-[18px]" />
                    <span>Share Cart with Friend / Colleague</span>
                  </button>
                </div>
                <div className="text-center pt-1">
                  <button
                    onClick={() => onNav('for-merchants')}
                    className="font-caption text-caption text-text-secondary hover:text-primary transition-colors"
                    type="button"
                  >
                    <span>Own a business? </span>
                    <span className="text-primary font-semibold underline">Set up your business on VEMTAP →</span>
                  </button>
                </div>
              </div>

              <div className="bg-badge-discount-bg/60 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="verified_user" className="text-[20px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-semibold text-badge-discount-text">
                    100% Price Match Guarantee
                  </span>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    No surge fees, no inflated in-app prices. Prices on VEMTAP are identical to in-store counter menus
                    in Abuja.
                  </p>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 font-label-md text-label-md text-text-primary font-semibold">
                  <Icon name="help_outline" className="text-primary text-[20px]" />
                  <span>Need quick assistance?</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Our Abuja Local Concierge is active daily 8:00 AM – 10:00 PM for tray adjustments or location
                  guidance.
                </p>
                <button
                  onClick={() => onNav('messages')}
                  className="font-label-sm text-label-sm text-primary font-medium hover:underline inline-flex items-center gap-1 pt-1 self-start"
                  type="button"
                >
                  <span>Chat with Apo Desk</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
