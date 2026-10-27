import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import { PUBLIC_IMAGES, publicCartCount, publicCartTotals, type PublicCartLine } from './publicPosData';
import { apiErrorMessage } from '../services/errorMessages';
import { GUEST_NO_IMAGE, guestTotals, useGuestMenu } from './publicPosLive';

interface PublicPosMenuScreenProps {
  cart: PublicCartLine[];
  onAddItem: (item: { id: string; name: string; price: number; image: string }) => void;
  onOpenCart: () => void;
}

type CategoryKey = 'combos' | 'grills' | 'mains' | 'sides' | 'drinks';
type CardKind = 'hero' | 'list' | 'mini';

interface MenuEntry {
  id: string;
  name: string;
  price: number;
  was?: number;
  desc: string;
  image: string;
  /** A demo category key, or (live) the catalogue category id. */
  cat: CategoryKey | string;
  kind: CardKind;
}

const CATEGORIES: { key: CategoryKey; label: string; icon?: string }[] = [
  { key: 'combos', label: 'Popular Combos', icon: 'local_fire_department' },
  { key: 'grills', label: 'Grills & Steaks' },
  { key: 'mains', label: 'Burgers & Mains' },
  { key: 'sides', label: 'Sides' },
  { key: 'drinks', label: 'Drinks & Bar' },
];

const MENU: MenuEntry[] = [
  {
    id: 'woodfire-ribeye-250g',
    name: 'Woodfire Ribeye Steak (250g)',
    price: 16000,
    desc: '250g Prime cut, chimichurri or truffle jus. Served with roasted bone marrow essence.',
    image: PUBLIC_IMAGES.ribeye,
    cat: 'grills',
    kind: 'hero',
  },
  {
    id: 'prime-lunch-combo',
    name: 'Prime Lunch Combo Pass',
    price: 9600,
    was: 12000,
    desc: "Ribeye/burger + Truffle fries + Mojito. The bistro's most beloved lunchtime trio.",
    image: PUBLIC_IMAGES.combo,
    cat: 'combos',
    kind: 'hero',
  },
  {
    id: 'double-smash-burger',
    name: 'Double Smash Burger',
    price: 6500,
    desc: 'Double beef patty, cheddar, house secret sauce, brioche.',
    image: PUBLIC_IMAGES.burger,
    cat: 'mains',
    kind: 'list',
  },
  {
    id: 'charcoal-bbq-wings',
    name: 'Charcoal BBQ Wings (6pcs)',
    price: 4800,
    desc: 'Smoky glaze, ranch dip. Cooked over open embers.',
    image: PUBLIC_IMAGES.wings,
    cat: 'grills',
    kind: 'list',
  },
  {
    id: 'truffle-parmesan-fries',
    name: 'Truffle Parmesan Fries',
    price: 3200,
    desc: 'Freshly cut, shaved parmesan, garlic aioli.',
    image: PUBLIC_IMAGES.fries,
    cat: 'sides',
    kind: 'mini',
  },
  {
    id: 'passionfruit-mojito',
    name: 'Passionfruit Mojito',
    price: 3500,
    desc: 'Fresh mint, crushed lime, sparkling soda.',
    image: PUBLIC_IMAGES.mojito,
    cat: 'drinks',
    kind: 'mini',
  },
];

export function PublicPosMenuScreen({ cart, onAddItem, onOpenCart }: PublicPosMenuScreenProps) {
  const [category, setCategory] = useState<CategoryKey | string>('combos');
  const guest = useGuestMenu();
  const live = guest.live;
  const venue = guest.info?.businessName ?? guest.info?.branchName ?? 'Your table';
  const tableLabel = guest.table ? `Table ${guest.table}` : 'Your table';
  // Live: "Popular" is the whole menu; the first two dishes get the big cards.
  const menu: MenuEntry[] = live ? guest.menu.map((item, index) => ({ ...item, kind: index < 2 ? 'hero' : 'list' })) : MENU;
  const categories: { key: string; label: string; icon?: string }[] = live
    ? [{ key: 'combos', label: 'Popular', icon: 'local_fire_department' }, ...guest.categories]
    : CATEGORIES;
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    if (!live) return;
    if (!guest.branchId) showToast('Scan the QR code on your table to see the menu');
    else if (guest.error) showToast(apiErrorMessage(guest.error, 'Could not load the menu.'));
    else if (guest.info && !guest.info.acceptingOrders) showToast('This venue is not taking table orders right now');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, guest.branchId, guest.error, guest.info?.acceptingOrders]);

  const add = (item: MenuEntry) => {
    onAddItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    showToast(`${item.name} added to your order`);
  };

  const q = query.trim().toLowerCase();
  const visible = menu.filter((item) => {
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    const matchesCategory = category === 'combos' || item.cat === category;
    return matchesQuery && matchesCategory;
  });

  const heroes = visible.filter((item) => item.kind === 'hero');
  const lists = visible.filter((item) => item.kind === 'list');
  const minis = visible.filter((item) => item.kind === 'mini');
  const count = publicCartCount(cart);
  const totals = live ? guestTotals(cart, guest.info?.pricing) : publicCartTotals(cart);

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="storefront" className="text-[21px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-text-primary leading-tight truncate">
                {live ? venue : 'Urban Grill & Bistro'}
              </h1>
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-text-secondary">{live ? `${tableLabel} • Dine-in` : 'Table 04 • Dine-in'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              type="button"
              aria-label="Open order cart"
              onClick={onOpenCart}
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <Icon name="shopping_bag" className="text-[23px]" />
              {count > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[17px]" />
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col pb-[248px]">
        {/* Hero profile */}
        <section className="relative w-full overflow-hidden bg-surface-container-low pb-space-md">
          <div className="relative h-40 w-full">
            <div
              className="w-full h-full bg-cover bg-center"
              role="img"
              aria-label="Modern upscale bistro interior with warm ambient lighting and open woodfire grill"
              style={{ backgroundImage: `url('${live ? (guest.info?.logo ?? GUEST_NO_IMAGE) : PUBLIC_IMAGES.hero}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent" />
            <div className="absolute top-space-sm left-margin right-margin flex items-center justify-between">
              <span className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption text-text-primary font-medium">Kitchen Live</span>
              </span>
              <button
                type="button"
                aria-label="Share menu"
                onClick={() => {
                  if (live) void navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
                  showToast('Menu link copied to clipboard');
                }}
                className="w-9 h-9 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm flex items-center justify-center text-text-secondary active:scale-90 transition-transform"
              >
                <Icon name="share" className="text-[19px]" />
              </button>
            </div>
          </div>

          {/* Merchant card */}
          <div className="px-margin -mt-10 relative z-10 flex flex-col gap-space-sm">
            <div className="p-space-md bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.06)] flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <span className="w-14 h-14 rounded-xl overflow-hidden bg-primary/10 shrink-0 shadow-sm block">
                  <img
                    src={live ? (guest.info?.logo ?? GUEST_NO_IMAGE) : PUBLIC_IMAGES.logo}
                    alt={`${live ? venue : 'Urban Grill & Bistro'} logo`}
                    className="w-full h-full object-cover"
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-space-2xs">
                    <h2 className="font-heading-md text-heading-md text-text-primary truncate">{live ? venue : 'Urban Grill & Bistro'}</h2>
                    <Icon name="verified" filled className="text-primary text-[19px] shrink-0" />
                  </div>
                  <p className="font-label-sm text-label-sm text-text-secondary truncate">
                    {live
                      ? `${guest.info?.branchName ?? '—'} • ${guest.info?.acceptingOrders ? 'Taking orders now' : 'Not taking orders right now'}`
                      : 'Wuse II, Abuja • Open Now (Closes 10:00 PM)'}
                  </p>
                  <div className="flex items-center gap-space-xs mt-1 flex-wrap">
                    <span className="flex items-center font-label-sm text-label-sm">
                      <Icon name="star" filled className="text-[15px] text-tertiary-container" />
                      <span className="font-semibold text-text-primary ml-1">{live ? '—' : '4.9'}</span>
                      <span className="text-text-tertiary ml-1">{live ? '' : '(420+)'}</span>
                    </span>
                    <span className="text-text-tertiary text-caption">•</span>
                    <span className="font-caption text-caption text-text-secondary flex items-center gap-0.5">
                      <Icon name="schedule" className="text-[13px]" />
                      <span>{live ? `${guest.info?.prepMinutes ?? 15} min avg` : '15-25 min avg'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Order context switcher */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-high/60 gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-7 h-7 rounded-md bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="restaurant" className="text-[15px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                      {live ? `${tableLabel} (Dine-in)` : 'Table 04 (Dine-in)'}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      Instant server dispatch
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Table selection opens from your QR session')}
                  className="px-space-xs py-1 rounded-md bg-surface-canvas shadow-sm text-primary font-label-sm text-label-sm active:scale-95 transition-transform shrink-0 flex items-center gap-1"
                >
                  <span>Change</span>
                  <Icon name="swap_horiz" className="text-[15px]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky search & categories */}
        <section className="sticky top-[108px] z-30 bg-surface/95 backdrop-blur-xl px-margin py-space-2xs flex flex-col gap-space-2xs shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="relative w-full flex items-center">
            <Icon name="search" className="absolute left-space-sm text-text-tertiary text-[19px] pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, drinks, sides..."
              className="w-full h-11 pl-11 pr-10 rounded-xl bg-surface-canvas shadow-sm text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              aria-label="Filter menu"
              onClick={() => showToast(live ? 'Filters are coming soon' : 'Dietary and price filters opened')}
              className="absolute right-space-sm text-text-tertiary flex items-center justify-center p-1 active:scale-90"
            >
              <Icon name="tune" className="text-[17px]" />
            </button>
          </div>
          <div className="flex items-center gap-space-2xs overflow-x-auto py-1 -mx-margin px-margin no-scrollbar">
            {categories.map((item) => {
              const isActive = category === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`shrink-0 h-9 px-space-sm rounded-full font-label-md text-label-md flex items-center gap-1.5 transition-all active:scale-95 ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-[0_4px_12px_rgba(6,108,244,0.2)]'
                      : 'bg-surface-canvas shadow-sm text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.icon && <Icon name={item.icon} className="text-[15px]" filled={isActive} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Notice banner */}
        <div className="px-margin pt-space-xs">
          <div className="p-space-2xs px-space-sm rounded-xl bg-surface-tint-blue flex items-center justify-between gap-space-xs">
            <span className="flex items-center gap-space-xs min-w-0">
              <Icon name="table_bar" className="text-primary text-[19px] shrink-0" />
              <p className="font-label-sm text-label-sm text-text-primary truncate">
                Ordering for <strong>{live ? tableLabel : 'Table 04'}</strong> • Dishes arrive hot to your seat
              </p>
            </span>
            <span className="text-caption font-bold text-primary tracking-wide uppercase shrink-0">Dine Free</span>
          </div>
        </div>

        {/* Menu showcase */}
        <section className="px-margin py-space-sm flex flex-col gap-space-md">
          {heroes.map((item) => (
            <article
              key={item.id}
              className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] overflow-hidden flex flex-col"
            >
              <div className="relative h-44 w-full bg-surface-container">
                <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute top-space-xs left-space-xs">
                  <span
                    className={`px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm ${
                      item.was ? 'text-badge-discount-text' : 'text-tertiary-container'
                    }`}
                  >
                    <Icon name={item.was ? 'local_offer' : 'military_tech'} className="text-[13px]" />
                    <span>{item.was ? '20% OFF Deal' : 'Chef Special'}</span>
                  </span>
                </div>
                {!item.was && (
                  <div className="absolute bottom-space-xs right-space-xs">
                    <span className="px-2 py-0.5 rounded-md bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-semibold">
                      250g Prime
                    </span>
                  </div>
                )}
              </div>
              <div className="p-space-md flex flex-col gap-space-2xs">
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">{item.name}</h3>
                  <p className="font-body-md text-body-md text-text-secondary text-label-sm mt-0.5 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-space-2xs gap-space-xs">
                  <div className="flex flex-col min-w-0">
                    <span className="font-caption text-caption text-text-tertiary uppercase">Item Price</span>
                    <span className="flex items-baseline gap-space-2xs">
                      <span
                        className={`font-heading-md text-heading-md font-bold ${
                          item.was ? 'text-badge-discount-text' : 'text-text-primary'
                        }`}
                      >
                        {naira(item.price)}
                      </span>
                      {item.was && (
                        <span className="font-label-sm text-label-sm text-text-tertiary line-through">
                          {naira(item.was)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => showToast(live ? 'Add a note for the kitchen in your cart' : 'Customization options opened')}
                      className="h-10 px-space-sm rounded-xl bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                      <Icon name="tune" className="text-[16px]" />
                      <span>Customize</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => add(item)}
                      className="h-10 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-[0_4px_12px_rgba(6,108,244,0.25)] active:scale-95 transition-all"
                    >
                      <Icon name="add" className="text-[17px]" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {lists.map((item) => (
            <article
              key={item.id}
              className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-sm flex gap-space-sm items-center"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container shrink-0 relative">
                <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                {item.id === 'charcoal-bbq-wings' && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-surface-canvas/90 text-[10px] font-bold text-tertiary-container">
                    8 mins
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{item.name}</h3>
                  <p className="font-caption text-caption text-text-secondary line-clamp-2 mt-0.5">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-space-2xs gap-space-xs">
                  <span className="flex items-center gap-1 min-w-0">
                    <span className="font-heading-sm text-heading-sm text-text-primary">{naira(item.price)}</span>
                    {item.id === 'charcoal-bbq-wings' && (
                      <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                        Fast Prep
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => add(item)}
                    className="h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                  >
                    <Icon name="add" className="text-[15px]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </article>
          ))}

          {minis.length > 0 && (
            <div className={`grid gap-space-sm ${minis.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {minis.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-2xs flex flex-col justify-between"
                >
                  <div className="w-full h-28 rounded-lg overflow-hidden bg-surface-container mb-space-2xs relative">
                    <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                    {item.id === 'passionfruit-mojito' && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-surface-canvas/90 text-[10px] font-semibold text-text-secondary">
                        Non-Alc
                      </span>
                    )}
                  </div>
                  <div className="px-1 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md font-semibold text-text-primary line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="font-caption text-caption text-text-secondary line-clamp-2 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-space-2xs pt-1 gap-space-2xs">
                      <span className="font-label-md text-label-md font-bold text-text-primary truncate">
                        {naira(item.price)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add ${item.name}`}
                        onClick={() => add(item)}
                        className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center active:scale-90 transition-transform shrink-0"
                      >
                        <Icon name="add" className="text-[17px]" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {visible.length === 0 && (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-md">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="search_off" className="text-text-secondary text-[21px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">Nothing matches your search</span>
              <span className="font-caption text-caption text-text-secondary max-w-[250px]">
                Try another dish name or switch the category to browse the full kitchen list.
              </span>
            </div>
          )}

          {/* Dietary info */}
          <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs text-text-secondary">
            <Icon name="info" className="text-primary text-[19px] shrink-0 mt-0.5" />
            <p className="font-caption text-caption leading-relaxed">
              Have specific dietary requirements or food allergies? Tap any item to inspect ingredients or add kitchen
              notes before placing your order.
            </p>
          </div>
        </section>
      </div>

      {/* Fixed bottom dock: order card + tray nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-margin pointer-events-none">
        <div className="pointer-events-auto p-space-sm bg-surface-canvas rounded-t-xl shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.12)] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="flex items-center gap-space-xs min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text shrink-0" />
              <span className="font-label-md text-label-md text-text-secondary font-medium truncate">
                {count} Item{count === 1 ? '' : 's'} in Order
              </span>
            </span>
            <span className="font-heading-sm text-heading-sm text-text-primary font-bold shrink-0">
              {naira(totals.subtotal)}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full h-11 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold flex items-center justify-between px-space-md shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-space-xs">
              <Icon name="shopping_basket" className="text-[19px]" />
              <span>View Order Cart ({count})</span>
            </span>
            <Icon name="arrow_forward" className="text-[19px]" />
          </button>
          <div className="flex items-center justify-center gap-1.5 text-center">
            <Icon name="verified_user" className="text-badge-discount-text text-[14px]" />
            <p className="font-caption text-caption text-text-secondary leading-tight">
              Zero advance payment required online. Pay directly at table/counter upon service.
            </p>
          </div>
        </div>
        <nav className="pointer-events-auto bg-surface/95 backdrop-blur-xl rounded-b-none shadow-[0_-2px_12px_rgba(0,0,0,0.05)] -mx-margin px-margin pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
          <div className="flex items-center justify-between h-16 gap-space-xs">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                Active Tray
              </span>
              <span className="flex items-baseline gap-space-2xs">
                <span className="font-heading-sm text-heading-sm text-text-primary">{naira(totals.total)}</span>
                <span className="font-caption text-caption text-text-tertiary">• {count} items</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenCart}
              className="h-11 px-space-md bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold flex items-center gap-space-2xs active:scale-95 transition-transform shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] shrink-0"
            >
              <span>Review Order</span>
              <Icon name="arrow_forward" className="text-[17px]" />
            </button>
          </div>
        </nav>
      </div>

      {toast && (
        <div className="fixed bottom-[248px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
