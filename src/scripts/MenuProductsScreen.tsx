import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { FilterMenu } from '../components/FilterMenu';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { CartSheet } from '../components/sheets/CartSheet';
import { useCart } from '../context/CartContext';
import { MENU_PRODUCT_ID, naira, nairaToNumber, type CatalogueProduct } from './catalogueData';

interface MenuProductsScreenProps {
  onBack: () => void;
  onOpenDeals: () => void;
  onGridView: () => void;
  onOpenProduct: (productId: string, display?: Partial<CatalogueProduct>) => void;
  onCheckout: () => void;
}

type MenuCategory = 'all' | 'grill' | 'burgers' | 'fusion' | 'drinks';

const MENU: { category: Exclude<MenuCategory, 'all'>; section: string; tag?: string; count: number; items: { name: string; desc: string; price: string; was?: string; rating?: string; badge?: string; badgeClass?: string; image: string; imageAlt: string }[] }[] = [
  {
    category: 'grill',
    section: "Chef's Woodfire Grill & Steaks",
    tag: 'Popular',
    count: 3,
    items: [
      {
        name: 'Woodfire Grilled Ribeye',
        desc: '400g aged Angus ribeye, herb garlic butter, truffle fries, grilled baby asparagus with smoky reduction.',
        price: '₦14,000',
        was: '₦16,500',
        badge: '15% OFF Voucher',
        badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGOIaF_PdjkLQwDLksEilZvM9UoL9UIZomsIHNngeu8w_AERMYpIi5shmgjkTw1o975HhDfM4LoYeuZWz4F-nNlJ7My1Vqo6eNIW2PhcKvmFL5B8GH6JQXBh1J06wyni7lEPAqibdUwB9YwVefj3irAsuBy0IkC9ZQmv2HMNa0qp6n2c93uwoMUyoYtN-dANArpHzfU6oEzoE4JgCpxiDb8LLTG8ks7EQURlmVoHO77RFjlv01KtEtSw',
        imageAlt: 'A thick, perfectly charred prime Angus ribeye steak on a dark rustic slate platter, glistening herb compound garlic butter melting over hot sear marks, accompanied by golden crispy truffle fries and tender green asparagus spears, shot with warm culinary lighting, shallow depth of field, gourmet fine dining aesthetic.',
      },
      {
        name: 'Smoked BBQ Brisket Platter',
        desc: 'Slow-smoked for 14 hours over hickory, charred sweetcorn, spicy tangy coleslaw, signature house BBQ glaze.',
        price: '₦12,500',
        rating: '4.9 (88 reviews)',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2_TEAAF_HmtlcDmjSJjX5k2L2a8Z4CyhzI_UCZ66utvElDf27pknpEm41_Kbfojt3XO2sYQQJwQzA6G-Dpsx1oRkRxQAA1ExYKvMrvmpxBg6K4d-enKqN_8OxSUHM7i04T2b-rDkCHQ3k9RCMIlBommWZ6wlz9LfwsNYpeDZ1rOyBnkx9GkU3CGlc6ObTDiSyUF96CdMmoFQ6sA2CNw2AJR5bhqbnPbJHGQos2iiuFThQxU0l1UC--A',
        imageAlt: 'Juicy, tender smoked beef brisket slices displaying a rich deep mahogany bark and distinct rosy smoke ring, coated in glossy barbecue sauce, served with roasted yellow corn cob and fresh purple cabbage slaw on a craft paper lined tray, rich artisan grill photography, ultra detailed.',
      },
      {
        name: 'Flame-Grilled Suya Lamb Chops',
        desc: 'Spiced Northern Nigerian yaji rub, charred sweet red onions, and honey-roasted ripe plantain dodo.',
        price: '₦11,000',
        badge: 'Local Top Pick',
        badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARbpOAqeI07PWsWOgikxnRvkSX8Xu7FnZqRm3hRc_0b5AYDDPcryS2Q_jRnURfYA07AMXijQeoDARtiJWnGHN06-D9i8cgcZirZc28c5ahjZTcFipuVWpAmVOr6oVf_TcL8_Sy8YUBtnPedyW7mH-ifmzfzPC2rWuc-ykl87rn-GFkRua5MgwVgM5hSQ-cknvw4s8T3lbA32L23EqaDGA4lfGRVONVZlkcl-g_RqJyt5kQsI5KwvUvZA',
        imageAlt: 'Tender, succulent lamb chops dusted in aromatic spicy peanut suya pepper rub, grilled over open flames with delicate char marks, garnished with sliced purple red onions and fresh cilantro leaves, presented beside golden roasted caramelized plantains, vibrant Abuja gourmet cuisine style.',
      },
    ],
  },
  {
    category: 'burgers',
    section: 'Artisanal Burgers & Combos',
    count: 2,
    items: [
      {
        name: 'Smoked Wagyu Burger',
        desc: 'Double smash wagyu patty, melted sharp cheddar, caramelized onions, smoked garlic mayo, toasted brioche bun.',
        price: '₦6,500',
        was: '₦8,000',
        badge: '20% Lunch Deal',
        badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXfQazN4ulE5n1fnB8smDNRMMcPYi2ZsJIUKoej_pYjotgcye_V3vQA9B3es0RIOAhK4AluBBb2ya_6O0UlADCCA3UxfgNLlRU_xynLsgrxF_7qqWTAmsCO6-eXCdtRK4chWzWJInxI0pe0aVcxQSMdNFm5w03j0q5X5N8P9Fd5hUb2mi2mF2BsTSdbjmAIEMHmdMW6fiv0umYrWMsweQzQlwyRXPzEZuVNDOVwi-OQxTUbzWeVpR07A',
        imageAlt: 'A gourmet towering wagyu beef burger in a glossy toasted golden brioche bun, double juicy patties dripping with melted aged yellow cheddar, sweet balsamic caramelized onions, and crisp artisan lettuce, served next to crispy skin-on potato wedges, high end restaurant food photography.',
      },
      {
        name: 'Crispy Buttermilk Chicken',
        desc: 'Crispy fried chicken breast, spicy house slaw, pickled jalapeños, sweet honey sriracha sauce on brioche.',
        price: '₦5,200',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTaZ70v7IMkkNBmSXKKsv06kUp0B1MoF5XMjkYg_YOZoVinS0R0e0AoiYXRkVMxRHOR5hBQBljFh7csaCtEeiS2X_JWtJZwUMwhnhkT6Q3SEsRHyyJAo3VBeg6dBKNK-sXv9QxnrfBuAtRKQBXXTjweGpN9_MrWJuqi6xzTDdeKHy0862uld3oqgbhh0U5g_uFzlppMjFIB3idfAY_FioW-pxYr4KjzD0eKZ1PntR65EZuW1AeLfq-ZA',
        imageAlt: 'Golden extra-crunchy buttermilk fried chicken breast sandwich inside a warm seeded bun, topped with creamy purple cabbage coleslaw, thin sliced green pickled jalapeños and vibrant dripping honey sriracha glaze, appetizing restaurant lighting, close-up food shot.',
      },
    ],
  },
  {
    category: 'fusion',
    section: 'Local Fusion & Sides',
    count: 3,
    items: [
      {
        name: 'Firewood Smoked Jollof Rice',
        desc: 'Smoky native party jollof with charred jumbo tiger prawns, diced ripe plantain dodo and bell pepper puree.',
        price: '₦7,500',
        badge: 'Must Try',
        badgeClass: 'bg-primary-fixed text-primary',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtNsIhgoo4CRLHtc6FxhzSyNk1Y7sOGqEJCC7tVwYfI37VsCJC9wsPIwwK2452zb3eY6s0jzSykDGA6pF-v9AQwDuiQwNred8yeBWdWmVcLDI43ikY1QdrfwjwuBV1mZQSpqxteDsFUswZjWfoSBbMMghd6IFlx-5oFYxwN_6ATh-aimLbf1xs-hU_RxZiA8UN3AJQTMVAS4uml821yO7H6vTqUJJpAfsSdbvvzbyVrzzzutqradn2EQ',
        imageAlt: 'Rich reddish-orange firewood smoked Nigerian party jollof rice presented in a black ceramic bowl, topped with three large grilled jumbo tiger prawns showing herb charred grill lines and golden plantain cubes, gourmet African dining presentation, crisp soft studio lighting.',
      },
      {
        name: 'Truffle Parmesan Wedges',
        desc: 'Crispy skin-on potato wedges tossed in white truffle oil, grated aged parmesan, and fresh chopped parsley.',
        price: '₦3,200',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAix4kjEKkodZaG3k8CUDol0DwljZ3fO403aJMfk0ytHz3HCFM_lVZBJlAk71uzTEluZkKqR2tgIaWB2fNeTkwiugNSv3-GkFZwb98xoPCZWwt72-WYLmnu6q1KfreYSIj1H2W5m7FK5ab8TZV53E0b9xomcxEebr60lw1BWJe4toL3iLl2a-ic_l-WUnKwQJabrNRrhSlUcZ4jjLd8g0gL9rvrTPRzGGRT3r84znqMlcCo9WV9xltf0w',
        imageAlt: 'Golden brown seasoned roasted potato wedges dusted generously with finely shaved white parmesan cheese and green parsley flakes, served in a matte black mini bowl with a side of truffle garlic aioli, dark moody background, high resolution food photography.',
      },
      {
        name: 'Crisp Garden Chopped Salad',
        desc: 'Crisp mixed field greens, cherry tomatoes, avocado, toasted pumpkin seeds, tangy citrus vinaigrette.',
        price: '₦3,800',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU37fqCs1YX0yGEmJgck5K9VbCTtQ41LwQQUvKLG3G4C3ezk_AbLFCQ13XM_WFF2ocnK1KdUeP028aPt7gS-MocWEMdo_Dc4WJECvswwR-q-mPAuWWc5seYc33nOGFvin3D5SQZKvrMnJuZr79E5nAHAdWpyKalBSra1pSaFb42CwlunxRt0n9--QQPn4ZwdPL-u6ftK2EWwycleVA6GYjot1b51gpSvzDWXCb3gTo_iROfUAocuS1WA',
        imageAlt: 'Fresh vibrant chopped salad bowl packed with emerald romaine lettuce, ripe sliced avocado, ruby red sweet baby tomatoes, cucumber slices and toasted pumpkin seeds with a delicate drizzle of citrus lemon dressing, clean bright natural daylight.',
      },
    ],
  },
  {
    category: 'drinks',
    section: 'Signature Drinks & Refreshments',
    count: 2,
    items: [
      {
        name: 'Hibiscus Zobo & Mint Fizz',
        desc: 'Handcrafted dried hibiscus calyces, ginger, fresh garden mint, sparkling soda, and lime wheel garnish.',
        price: '₦2,500',
        badge: 'Signature Mocktail',
        badgeClass: 'bg-surface-container text-primary',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNXsDauN07fugMff3_OtCbGjYjauX4ZjZ9pbHwL28D9HQNaeGU12XgR43z2rpS-V-Q-X9Jh0-Bwds19Te22Mj4LxPbpPGkzQdgEL6HfZH6ydh99G5GvTxBF-Api9ABI0bW-GJrRPREoBDxtnkoir8YciVj0LQCnuvTJaKQSz3A79zqK85o8DkXC0FI4Z7hPfLNBxpoWfNHuxQrerfSuRM5yjM59yB1dAxqqH_CvrLG3SgjsPtomvZLGQ',
        imageAlt: 'A tall condensation-covered crystal glass filled with deep crimson chilled Nigerian hibiscus zobo cooler over crushed ice, garnished with fresh fragrant mint leaves, dehydrated lime wheel and a hint of effervescent sparkling bubbles, high end bar photography.',
      },
      {
        name: 'Chapman Royale',
        desc: 'The classic Nigerian staple elevated with aromatic Angostura bitters, fresh cucumber ribbons, citrus medleys, and sparkling tonic.',
        price: '₦3,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNu2_0X0wJsb_MLOY7c22hrSvIUuyOFdDVH53BWx963If7i08l0oAOTW8cfYowoEB5Hqk32fTD3abHWG6weYhrzmWQWcQ3rPiIYvfBVkCzAwKOHZWA1TIrnWLKYnWEz77zY38tdVTGVWWbvQ7FWll8In5IE_E8vBA1k3iJ4ZJmITeEnSAmdtSwXyVtk88bXLJyQ_WpyrT4pLqCRI9Bfo7Ye2zPi3RvAilpCjmBtX4-zQqtAA0uPWmr3w',
        imageAlt: 'An elegant stemmed cocktail goblet filled with vibrant sunset reddish-orange Chapman punch, brimming with clear ice cubes, thin cucumber ribbons, orange wheels, and lemon slices, styled in a luxurious modern bistro setting with ambient warm bokeh.',
      },
    ],
  },
];

const CHIPS: { key: MenuCategory; emoji?: string; label: string }[] = [
  { key: 'all', label: 'All (28)' },
  { key: 'grill', emoji: '🔥', label: 'Grill & Steaks' },
  { key: 'burgers', emoji: '🍔', label: 'Burgers' },
  { key: 'fusion', emoji: '🥘', label: 'Local Specials' },
  { key: 'drinks', emoji: '🍹', label: 'Drinks' },
];

export function MenuProductsScreen({ onBack, onOpenDeals, onGridView, onOpenProduct, onCheckout }: MenuProductsScreenProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const cart = useCart();

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const matches = (item: { name: string; desc: string }) =>
    !searchQuery ||
    `${item.name} ${item.desc}`.toLowerCase().includes(searchQuery.toLowerCase());

  const sections = MENU.map((section) => ({
    ...section,
    items: activeCategory === 'all' || activeCategory === section.category ? section.items.filter(matches) : [],
  })).filter((section) => section.items.length > 0);

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors shrink-0"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate leading-none mb-0.5">Urban Grill & Bistro</span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Menu & Products</h1>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              aria-label="Search catalogue"
              type="button"
              onClick={() => showToast('Search is already open below — type to filter the menu')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
            >
              <Icon name="search" className="text-[22px]" />
            </button>
            <button
              aria-label="Saved or Bookmarked"
              type="button"
              onClick={() => showToast('Saved items opened')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
            >
              <Icon name="bookmark" className="text-[22px]" />
            </button>
            <button
              aria-label={`Cart and Order (${cart.count} items)`}
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors relative"
            >
              <Icon name="shopping_bag" className="text-[22px]" />
              {cart.count > 0 && (
                <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>
      <MenuBody
        sections={sections}
        chips={CHIPS}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onOpenProduct={onOpenProduct}
        onOpenCart={() => setCartOpen(true)}
        onOpenDeals={onOpenDeals}
        onGridView={onGridView}
      />
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={onCheckout}
        title="Your Table Order"
      />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}

interface MenuBodyProps {
  sections: { category: string; section: string; tag?: string; count: number; items: { name: string; desc: string; price: string; was?: string; rating?: string; badge?: string; badgeClass?: string; image: string; imageAlt: string }[] }[];
  chips: { key: MenuCategory; emoji?: string; label: string }[];
  activeCategory: MenuCategory;
  onCategory: (category: MenuCategory) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onOpenProduct: (productId: string, display?: Partial<CatalogueProduct>) => void;
  onOpenCart: () => void;
  onOpenDeals: () => void;
  onGridView: () => void;
}

function MenuBody({
  sections,
  chips,
  activeCategory,
  onCategory,
  searchQuery,
  onSearch,
  onOpenProduct,
  onOpenCart,
  onOpenDeals,
  onGridView,
}: MenuBodyProps) {
  const cart = useCart();

  const openItem = (item: { name: string; desc: string; price: string; was?: string; image: string; imageAlt: string }) => {
    const id = MENU_PRODUCT_ID[item.name];
    if (id) onOpenProduct(id, {
      name: item.name,
      desc: item.desc,
      price: nairaToNumber(item.price),
      was: item.was ? nairaToNumber(item.was) : undefined,
      image: item.image,
      imageAlt: item.imageAlt,
    });
  };

  const addItem = (event: MouseEvent, item: { name: string; desc: string; price: string; was?: string; image: string; imageAlt: string }) => {
    event.stopPropagation();
    const id = MENU_PRODUCT_ID[item.name];
    if (id) cart.add({ id, name: item.name, price: nairaToNumber(item.price), image: item.image });
  };
  return (
    <main className="flex flex-col relative w-full pt-16 bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-sm pb-space-xs flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs bg-surface-container-low px-space-xs py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">Apo Boulevard, Abuja</span>
              <span className="font-caption text-caption text-text-tertiary">•</span>
              <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">Open Now</span>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-highest px-space-xs py-1 rounded-full">
              <Icon name="star" className="text-[15px] text-tertiary-container" filled />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">4.8</span>
              <span className="font-caption text-caption text-text-secondary">(340+)</span>
            </div>
          </div>
          <div className="relative w-full mt-space-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
              <Icon name="search" className="text-[20px]" />
            </div>
            <input
              type="text"
              placeholder="Search dishes, drinks, sides..."
              className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-text-primary placeholder:text-text-tertiary font-body-md text-body-md rounded-xl shadow-[0_2px_8px_rgba(13,37,76,0.04)] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_2px_#066cf4]"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
            {/* Mirrors the category chips below so the search-bar control filters too. */}
            <FilterMenu
              align="right"
              ariaLabel="Filter by category"
              buttonClassName="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-primary transition-colors"
              choices={chips.map((chip) => ({ value: chip.key, label: chip.label }))}
              icon="tune"
              iconClassName="text-[20px]"
              label={null}
              onChange={(next) => onCategory(next as MenuCategory)}
              title="Filter by category"
              value={activeCategory}
            />
          </div>
        </div>

        <div className="px-margin py-1 flex items-center justify-between gap-2">
          <span className="font-label-sm text-label-sm text-text-secondary font-medium">Browse Layout</span>
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-border-subtle/40" role="group" aria-label="View switcher">
            <button
              aria-label="List view"
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-canvas text-primary shadow-sm transition-all"
            >
              <Icon name="view_agenda" className="text-[18px]" />
            </button>
            <button
              aria-label="Grid view"
              type="button"
              onClick={onGridView}
              className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-secondary transition-all"
            >
              <Icon name="grid_view" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-space-xs px-margin flex items-center gap-space-2xs">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onCategory(chip.key)}
              className={`shrink-0 px-3.5 h-9 rounded-full font-label-md text-label-md flex items-center gap-1 transition-all ${
                activeCategory === chip.key
                  ? 'bg-surface-tint-blue text-primary shadow-sm font-semibold'
                  : 'bg-surface-container-lowest text-text-secondary shadow-sm hover:text-on-surface'
              }`}
            >
              {chip.emoji && <span>{chip.emoji}</span>}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="w-full bg-gradient-to-r from-primary-fixed to-surface-container-high p-space-sm rounded-xl shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="local_activity" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading-sm text-[15px] font-semibold text-on-primary-fixed truncate">2 Active Deals Apply</span>
                <span className="font-caption text-caption text-secondary truncate">Up to 20% OFF items with claimed vouchers</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenDeals}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-canvas text-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-tint-blue transition-colors flex items-center gap-1"
            >
              <span>View Deals</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-space-lg px-margin pt-space-xs">
          {sections.map((section) => (
            <section key={section.section} className="flex flex-col gap-space-sm">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-space-2xs">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">{section.section}</h2>
                  {section.tag && (
                    <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-semibold">{section.tag}</span>
                  )}
                </div>
                <span className="font-label-sm text-label-sm text-text-tertiary font-medium">{section.count} items</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {section.items.map((item) => (
                  <article
                    key={item.name}
                    onClick={() => openItem(item)}
                    className="bg-surface-container-lowest rounded-xl p-space-sm shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex gap-space-sm items-start justify-between relative overflow-hidden transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex flex-col flex-1 min-w-0 justify-between h-full">
                      <div>
                        {item.badge && (
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`font-caption text-[11px] font-semibold px-2 py-0.5 rounded ${item.badgeClass}`}>{item.badge}</span>
                          </div>
                        )}
                        {item.rating && !item.badge && (
                          <div className="flex items-center gap-1 mb-1">
                            <Icon name="star" className="text-[14px] text-tertiary-container" filled />
                            <span className="font-caption text-[11px] font-semibold text-text-primary">{item.rating}</span>
                          </div>
                        )}
                        <h3 className="font-heading-sm text-[16px] text-text-primary leading-snug">{item.name}</h3>
                        <p className="font-caption text-caption text-text-secondary mt-1 line-clamp-2">{item.desc}</p>
                      </div>
                      <div className="flex items-center justify-between mt-space-sm pt-space-2xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading-sm text-[17px] text-text-primary font-bold">{item.price}</span>
                          {item.was && <span className="font-caption text-caption text-text-tertiary line-through">{item.was}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => addItem(event, item)}
                          className={`h-9 px-3 rounded-full flex items-center justify-center gap-1 font-button-secondary text-[13px] font-semibold shadow-[0_4px_12px_rgba(6,108,244,0.25)] active:scale-95 transition-all ${
                            cart.qtyOf(MENU_PRODUCT_ID[item.name] ?? '') > 0
                              ? 'bg-badge-discount-text text-white'
                              : 'bg-primary text-on-primary hover:bg-primary-container'
                          }`}
                        >
                          <Icon
                            name={cart.qtyOf(MENU_PRODUCT_ID[item.name] ?? '') > 0 ? 'check' : 'add'}
                            className="text-[18px]"
                          />
                          <span>
                            {cart.qtyOf(MENU_PRODUCT_ID[item.name] ?? '') > 0
                              ? `In cart (${cart.qtyOf(MENU_PRODUCT_ID[item.name] ?? '')})`
                              : 'Add'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="w-[96px] h-[96px] shrink-0 rounded-xl overflow-hidden bg-surface-container relative">
                      <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="fixed bottom-0 left-0 right-0 z-40 px-margin pb-safe pt-2 bg-gradient-to-t from-surface via-surface/95 to-transparent backdrop-blur-md max-w-[430px] mx-auto">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-[0_12px_32px_-4px_rgba(17,24,39,0.12)] border border-border-subtle/40 flex flex-col gap-2.5 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary font-bold font-label-md text-label-md">
                  <span>{cart.count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary leading-none">Your Table Order</span>
                  <span className="font-heading-sm text-[16px] text-text-primary font-bold leading-tight">{naira(cart.total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCart}
                className="h-11 px-5 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-1.5 shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all"
              >
                <span>{cart.count > 0 ? 'View Order' : 'View Cart'}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 pt-1 px-1">
              <Icon name="verified" className="text-[14px] text-primary shrink-0" />
              <p className="font-caption text-[11px] text-text-secondary leading-tight truncate">
                Show your VEMTAP member code at checkout to claim deal perks
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
