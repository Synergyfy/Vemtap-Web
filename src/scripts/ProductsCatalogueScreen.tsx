import { useState } from 'react';
import { FilterMenu } from '../components/FilterMenu';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ProductImage } from '../components/ui/ProductImage';
import { CartSheet } from '../components/sheets/CartSheet';
import { BusinessChatBox } from '../components/BusinessChatBox';
import { useCart } from '../context/CartContext';
import { naira, nairaToNumber, PRODUCT_ID_BY_KEY, type CatalogueProduct } from './catalogueData';
import { UserAvatar } from '../components/ui/UserAvatar';
import { hasApiConfig } from '../services/api/client';
import { usePublicBusiness } from '../hooks/usePublicBusiness';

interface ProductsCatalogueScreenProps {
  onBack: () => void;
  onListView: () => void;
  onOpenProduct: (productId: string, display?: Partial<CatalogueProduct>) => void;
  onCheckout: () => void;
  businessCode?: string;
  /** Which live catalogue the "See All" page shows. `all` keeps the legacy combined list. */
  kind?: 'product' | 'service' | 'all';
  startChat?: boolean;
  onChatStarted?: (branchId: string) => void;
}

interface ProductCardModel {
  id: string;
  cartId: string;
  kind: 'product' | 'service';
  category: string;
  name: string;
  price: string;
  priceValue: number;
  was?: string;
  rating?: string;
  reviews?: string;
  badge?: string;
  badgeClass?: string;
  topRightBadge?: string;
  topRightClass?: string;
  image: string;
  imageAlt: string;
  display: Partial<CatalogueProduct>;
}

const PRODUCTS = [
  {
    id: 1,
    category: 'grills',
    name: 'Woodfire Aged Ribeye Steak (400g)',
    price: '₦14,000',
    was: '₦16,500',
    rating: '4.9',
    reviews: '(88)',
    badge: '-15%',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    topRightBadge: 'Best Seller',
    topRightClass: 'bg-primary text-on-primary',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuBPQ9PDF8HJFqZbU7ZYnHtjReICQYCqWxquCZyA0eA29B75GOQjW2BsIX0p8sRTtfDpLi2hdMoi1Q-PboaBSK8_kfNzQx_F8UZAlwQZlkA4eV28w2avSNLD6KbfgdY-QCDT1tBT_Qxh-3VGysgkxM6f4Wlw8yUhWzadnR09csO0qx6RussnGks0c08-DOMezCCZb1nnAYH3RSHZaVhB3v4hUf-B60k8CS4uaFPz27Fg5bk2UZNyc2Q',
    imageAlt:
      'Gourmet prime woodfire aged ribeye steak cooked medium rare, rested on a rustic wooden platter with charred green asparagus and crisp golden potato fries. Shot with moody warm restaurant spotlighting, realistic sizzle steam, and high contrast culinary styling.',
  },
  {
    id: 2,
    category: 'burgers',
    name: 'Smoked Wagyu Double Burger',
    price: '₦6,500',
    was: '₦8,000',
    rating: '4.8',
    reviews: '(64)',
    badge: '-20%',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    topRightBadge: 'Lunch Deal',
    topRightClass: 'bg-secondary-container text-on-secondary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQLg7pUC0q7pmZdwCiuxOAwH4HyQ0lVrpIS-biAhHk9By-zENlS6bScexTjgHqLZExsaQdvdJJ-hhegzvdTcUNKyd_U02YLNeHAzgqhsGee7XXkTEuKhnbLEowcdAHTmJrb3ATIAxCFo_AADwtAi0BtUGSXgNTNrDOwUcOlHJ05WvLpcFFFiF1XUuDGXw3AAuUG4jVqUpGXPqRP8sKGfnEAgKFNQV2bAqHvXj4O-V_RO_40CWF7idlw',
    imageAlt:
      'Mouthwatering double smash wagyu beef burger stacked high with dripping melted cheddar cheese, caramelized onions, crisp butterhead lettuce, and secret sauce on a toasted shiny brioche bun. Professional food commercial lighting against deep dark kitchen backdrop.',
  },
  {
    id: 3,
    category: 'grills',
    name: '14-Hour Hickory Smoked BBQ Brisket',
    price: '₦12,500',
    was: '',
    rating: '4.9',
    reviews: '(51)',
    badge: '',
    badgeClass: '',
    topRightBadge: '',
    topRightClass: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfhTpIhWJUDxq5cVoxFpaGPEkQlKdC4Tqjj0smOij4ftrAa3vLFDOoLoNxEDibwSk6Nn5zUH6X58GuK-CmtPTEoE9255Bt-c2zFvQX6G0ARBhGuL3euNEoZrcTNatgkzKinwGf_v-G0V2zHwv0AcRS732xDajA-TQSucVAxQNRw0J5NuVBDmTqkRQNqrVKk2BzcAL_pV-eKOVLMOsyC89LWZqy4d_0hyuZIV0tqvgotWQA6RNfn20LjQ',
    imageAlt:
      'Tender 14-hour hickory smoked BBQ beef brisket platter sliced thick, revealing a deep ruby smoke ring, glazed with sweet tangy barbecue reduction, served beside fire charred buttered sweet corn cob and pickled jalapeño slices.',
  },
  {
    id: 4,
    category: 'grills',
    name: 'Flame-Grilled Suya Lamb Chops',
    price: '₦11,000',
    was: '',
    rating: '4.7',
    reviews: '(39)',
    badge: '',
    badgeClass: '',
    topRightBadge: 'Local Favorite',
    topRightClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-ONaECl1Mo7tlAksq4ggHbFX-Cs8m5kw_KTjwO4mnWuPgGqyOJjgJWRJ_W1wPVOIKJgGkZeKSyIHwhaZ7BV2qS-w15OgH1hxqPe5l9l8NJo_WPCCPprt7RLRToSxGQGuHCyvtEAXROoaA6IwQn-2yXnwmOSAthebrWQrOIqE5RqQv5A1uRyQzSGS3ScVcWeYOHI5m8a4BGFIGgF68xYacOB4wCagNE-twewk02l-SsZuYelasqCc9PQ',
    imageAlt:
      'Sizzling flame grilled Nigerian suya spiced lamb chops dusted with authentic kuli kuli yaji spice blend, arranged with sliced purple onions, fresh red tomatoes, and fresh lime wedges on smoked slate.',
  },
  {
    id: 5,
    category: 'mains',
    name: 'Smoked Native Party Jollof & Prawns',
    price: '₦7,500',
    was: '₦8,300',
    rating: '4.8',
    reviews: '(112)',
    badge: '-10%',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    topRightBadge: '',
    topRightClass: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD--ZrQ9BPR-v4wCL1Q7uE2AYVX8zeC94AyAbdZ5dJNB8wYutSK0oiFb7czFgChdfecIezofI-5oX7kM7etRYN7SDIeQARX5XfbL3AZTQZ6ZLwk3Rzt2Vazwgan4HaW7LbckOQ4m7ELh0dU3Meoi608Qqth34VcjQCTtXOZMAu9obryFseo4LHxj4OkEwHcYfrU3nD97UXttOSd-UtNtIReIvE01ATU6KfcUv5yYqtn1K53JKncC2NxJw',
    imageAlt:
      'Rich reddish-orange firewood smoked Nigerian party jollof rice served in a rustic earthenware pot, topped with giant succulent charred tiger prawns, deep fried plantain dodo, and freshly chopped scallions.',
  },
  {
    id: 6,
    category: 'sides',
    name: 'Truffle Parmesan Potato Wedges',
    price: '₦3,200',
    was: '',
    rating: '4.6',
    reviews: '(45)',
    badge: '',
    badgeClass: '',
    topRightBadge: '',
    topRightClass: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZBLI62hH7PvPzp7VpQGgwpg7LfdxmAi3qRvFrmVCxcHj8AvVUGqDXZvI7PviGqK-rLyerMNO6nPrR1aP1TuRZIUGkX0o2kZcBW-vr_62JdqiI2aF51a2vbrseOvdSIA6Rh-N3l1TxCpZxmxzJgwoAV4waad1cXYLz2aJ57hjcqXYpTRM7GiPw8nE4Xne2xVPKmDPAJygZJTJnq30j_6mymdQg_VWYdx_tZV2BeTqTZlUGiDn7zPKifg',
    imageAlt:
      'Crispy golden skin-on potato wedges generously dusted with aged grated parmesan cheese shavings and fresh thyme, with an aromatic white truffle aioli dipping sauce in a small ceramic ramekin beside it.',
  },
  {
    id: 7,
    category: 'drinks',
    name: 'Hibiscus Zobo & Mint Fizz (500ml)',
    price: '₦2,500',
    was: '',
    rating: '4.9',
    reviews: '(78)',
    badge: '',
    badgeClass: '',
    topRightBadge: '',
    topRightClass: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSUhaEcxymfFmuB0GifzM_C9g0_L_zJHUWxkCvps48vopZC-LcKg68tojM6ZEC8lgym_UNs0MWz1UEP7MBFoz3mU3CK1qO_fHgbvpSZzj1Y6begDEaT_tu6H8EeOioVkXVVcH2WSEyxfzVjzOE-uu3dt5m0S83wo9Cou8gyxX1JDbW2ehOrgTPUW4dfVggbbCgcvtlEi0758iOY1HHlF_0LXV1U1zMHr1m4CgJoqqSbH2xqYRgYstdrA',
    imageAlt:
      'Tall crystal glass filled with ruby-red chilled hibiscus zobo mocktail over crushed ice cubes, garnished with aromatic green mint leaves, dried cloves, and a dehydrated orange slice. Dramatic high-end cocktail bar lighting with condensation beads.',
  },
  {
    id: 8,
    category: 'drinks',
    name: 'Chapman Royale Signature Drink',
    price: '₦3,000',
    was: '',
    rating: '4.7',
    reviews: '(34)',
    badge: '',
    badgeClass: '',
    topRightBadge: '',
    topRightClass: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsU3SvD-Btxvj1DEhn03rh0KfnGRHZZr0bl7uK54A2wsa9n1nRxXp3PwbzEjYa0emOV5-a-ESYrqS4137Rjqgop_oxSWZoBAx-TxSslqPzjDouJrA48SfopnAz4ZWWSSh6P3Z6vd-6FVycagcwUCMNg6LT78zLSlVM-vBhu8oFXMeqdddMTcQLDnPi0YP2av4vI0M-KoNZxB9Ni9OBMGzLrJb4K5wYCBqBS-1Q9fHQnqtc3I3kDs0WLQ',
    imageAlt:
      'A refreshing Chapman Royale cocktail in a vintage fluted tumbler with Angostura bitters tint, bubbly sparkling citrus soda, fresh cucumber ribbons, lemon wheel, and a sprig of mint. Bright sunny terrace dining ambience.',
  },
];

const CATEGORIES: { label: string; slug: string }[] = [
  { label: 'All Products', slug: 'all' },
  { label: 'Steaks & Grills', slug: 'grills' },
  { label: 'Burgers', slug: 'burgers' },
  { label: 'Local Mains', slug: 'mains' },
  { label: 'Sides & Extras', slug: 'sides' },
  { label: 'Drinks & Cocktails', slug: 'drinks' },
  { label: 'Desserts', slug: 'desserts' },
];

/** Category QR links land here with ?category=<id-or-slug> — keep the tabs available for navigation. */
function initialCategorySlug(): string {
  const param = new URLSearchParams(window.location.search).get('category');
  return param ?? 'all';
}

export function ProductsCatalogueScreen({ onBack, onOpenProduct, onCheckout, businessCode, kind = 'all', startChat, onChatStarted }: ProductsCatalogueScreenProps) {
  const [categorySlug, setCategorySlug] = useState<string>(initialCategorySlug);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(Boolean(startChat));
  const [toast, setToast] = useState<string | null>(null);
  const cart = useCart();
  const live = hasApiConfig();
  const publicBusiness = usePublicBusiness(businessCode);
  // See All Products / See All Services show only what the business actually listed in that section.
  const liveItems = [
    ...(kind === 'service' ? [] : publicBusiness.products),
    ...(kind === 'product' ? [] : publicBusiness.services),
  ];
  const products: ProductCardModel[] = live
    ? liveItems.map((item) => ({
        id: item.id,
        cartId: item.id,
        kind: item.kind,
        category: item.categoryId ?? item.category ?? '',
        name: item.name,
        price: naira(item.price),
        priceValue: item.price,
        image: item.image ?? '',
        imageAlt: item.name,
        display: {
          id: item.id,
          name: item.name,
          desc: item.description ?? '',
          category: item.categoryId ?? item.category ?? '',
          price: item.price,
          image: item.image ?? '',
          imageAlt: item.name,
        },
      }))
    : PRODUCTS.map((product) => {
        const id = PRODUCT_ID_BY_KEY[product.id] ?? '';
        return {
          ...product,
          id,
          cartId: id,
          kind: 'product' as const,
          priceValue: nairaToNumber(product.price),
          display: {},
        };
      });
  const categories = live
    ? [
        { label: 'All Items', slug: 'all' },
        ...[...new Map(
          liveItems
            .filter((item) => item.categoryId || item.category)
            .map((item) => [item.categoryId ?? item.category ?? '', { label: item.category ?? 'Category', slug: item.categoryId ?? item.category ?? '' }]),
        ).values()],
      ]
    : CATEGORIES;

  const sectionLabel = kind === 'service' ? 'Services' : kind === 'product' ? 'Products' : 'Products & Services';
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const ratingChoices = [
    { value: '', label: 'All ratings' },
    { value: '4.5', label: '4.5 & up' },
    { value: '4.0', label: '4.0 & up' },
  ];

  /** Category, search and minimum rating all have to agree before a card shows. */
  const filteredProducts = products.filter((p) => {
    if (categorySlug !== 'all' && p.category !== categorySlug) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (minRating !== '' && (!p.rating || Number(p.rating) < Number(minRating))) return false;
    return true;
  });

  const addToCart = (product: ProductCardModel) => {
    if (!product.cartId) return;
    cart.add({ id: product.cartId, productId: product.id, name: product.name, price: product.priceValue, image: product.image });
  };

  const isAdded = (id: string) => Boolean(id) && cart.qtyOf(id) > 0;

  const renderCartControl = (product: ProductCardModel, compact = false) => {
    if (product.kind === 'service') {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenProduct(product.id, product.display);
          }}
          className={`h-9 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center ${
            compact ? 'px-3 shrink-0' : 'w-full'
          }`}
        >
          View service
        </button>
      );
    }
    if (isAdded(product.cartId)) {
      return (
        <div
          className={`h-9 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-between active:scale-95 transition-all shadow-sm ${
            compact ? 'px-1.5 w-[104px] shrink-0' : 'w-full px-1.5'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            aria-label={`Remove one ${product.name}`}
            type="button"
            onClick={() => cart.decrement(product.cartId)}
            className="w-7 h-7 rounded-lg bg-surface-canvas/70 hover:bg-surface-canvas flex items-center justify-center text-text-primary active:scale-95 transition-all"
          >
            <Icon name="remove" className="text-[16px]" />
          </button>
          <span className="font-label-sm text-label-sm font-bold min-w-[16px] text-center">
            {cart.qtyOf(product.cartId)}
          </span>
          <button
            aria-label={`Add one ${product.name}`}
            type="button"
            onClick={() => cart.increment(product.cartId)}
            className="w-7 h-7 rounded-lg bg-surface-canvas/70 hover:bg-surface-canvas flex items-center justify-center text-text-primary active:scale-95 transition-all"
          >
            <Icon name="add" className="text-[16px]" />
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          addToCart(product);
        }}
        className={`add-to-bag-btn h-9 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm ${
          compact ? 'px-3 shrink-0' : 'w-full'
        }`}
      >
        <Icon name="add" className="text-[18px]" />
        <span>Add</span>
      </button>
    );
  };

  const renderBadges = (product: ProductCardModel) => (
    <>
      {product.badge && (
        <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md font-caption text-[11px] font-bold shadow-sm ${product.badgeClass}`}>
          {product.badge}
        </span>
      )}
      {product.topRightBadge && (
        <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md font-caption text-[10px] font-semibold shadow-sm ${product.topRightClass}`}>
          {product.topRightBadge}
        </span>
      )}
    </>
  );

  const renderProductCard = (product: ProductCardModel, mode: 'grid' | 'list') => {
    const image = (
      <ProductImage
        alt={product.imageAlt}
        className="h-full w-full"
        iconClassName={mode === 'grid' ? 'text-[30px]' : 'text-[22px]'}
        imageClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        showLabel={mode === 'grid'}
        src={product.image}
      />
    );
    const rating = (product.rating || product.reviews) ? (
      <div className="flex items-center gap-1">
        <div className="flex items-center text-tertiary">
          <Icon name="star" className="text-[13px]" filled />
          <span className="font-caption text-[11px] font-bold ml-0.5 text-text-primary">{product.rating}</span>
        </div>
        <span className="font-caption text-[11px] text-text-tertiary">{product.reviews}</span>
      </div>
    ) : null;
    const price = (
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{product.price}</span>
        {product.was && <span className="font-caption text-caption text-text-tertiary line-through">{product.was}</span>}
      </div>
    );

    if (mode === 'list') {
      return (
        <div
          key={product.id}
          onClick={() => onOpenProduct(product.id, product.display)}
          className="group relative flex gap-space-sm bg-surface-canvas rounded-2xl p-2.5 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
            {image}
            {renderBadges(product)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
            <div className="min-w-0">
              {rating}
              <h2 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-2 mt-1 leading-snug">
                {product.name}
              </h2>
            </div>
            <div className="flex items-end justify-between gap-2">
              {price}
              {renderCartControl(product, true)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={product.id}
        onClick={() => onOpenProduct(product.id, product.display)}
        className="group relative flex flex-col bg-surface-canvas rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
      >
        <div className="relative w-full aspect-square overflow-hidden">
          {image}
          {renderBadges(product)}
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between gap-1.5">
          <div>
            {rating}
            <h2 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-2 mt-1 leading-snug">
              {product.name}
            </h2>
          </div>
          <div className="pt-1 flex flex-col gap-1.5">
            {price}
            {renderCartControl(product)}
          </div>
        </div>
      </div>
    );
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
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">{live ? sectionLabel : 'Merchant Details'}</h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 pr-space-xs">
            <button
              aria-label="Share"
              type="button"
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="share" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative w-full pt-16 pb-safe bg-surface-canvas min-h-screen">
        <div className="flex flex-col w-full">
          <div className="px-margin pt-space-xs pb-space-xs flex items-center justify-between bg-surface-canvas shadow-sm">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-2xs">
                  {!live && <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse shrink-0" />}
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                    {live ? publicBusiness.business?.name ?? 'Business storefront' : 'Kitchen Open Now'}
                  </span>
              </div>
                <p className="font-caption text-caption text-text-secondary truncate">
                  {sectionLabel} • {live ? products.length : 42} Items
                </p>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              {live && publicBusiness.business ? (
                <button
                  aria-label={chatOpen ? 'Close chat with business' : 'Chat with business'}
                  aria-pressed={chatOpen}
                  type="button"
                  onClick={() => setChatOpen((open) => !open)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${chatOpen ? 'bg-primary text-on-primary' : 'bg-surface-subtle text-primary hover:text-text-primary'}`}
                >
                  <Icon name={chatOpen ? 'vemtap-chat-white' : 'vemtap-chat'} className="text-[20px]" />
                </button>
              ) : null}
              <button
                aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                type="button"
                onClick={() => setViewMode((mode) => (mode === 'grid' ? 'list' : 'grid'))}
                className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name={viewMode === 'grid' ? 'view_list' : 'grid_view'} className="text-[20px]" />
              </button>
              <div className="relative">
                <button
                  aria-label={`Quick bag access (${cart.count} items)`}
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="w-9 h-9 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary transition-colors"
                >
                  <Icon name="shopping_bag" className="text-[20px]" filled />
                </button>
                {cart.count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cart.count}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="sticky top-16 z-40 bg-surface-canvas/95 backdrop-blur-md px-margin pt-space-xs pb-space-sm shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-space-xs">
            <div className="relative w-full">
              <Icon name="search" className="absolute left-space-md top-1/2 -translate-y-1/2 text-text-tertiary text-[20px] pointer-events-none" />
              <input
                type="search"
                placeholder={`Search products in ${live ? publicBusiness.business?.name ?? 'this business' : 'Urban Grill'}...`}
                className="w-full h-11 pl-11 pr-10 rounded-xl bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary placeholder:font-normal focus:outline-none focus:bg-surface-canvas shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                aria-label="Voice or clear"
                type="button"
                onClick={() => showToast('Voice search coming soon')}
                className="absolute right-space-sm top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1"
              >
                <Icon name="mic" className="text-[18px]" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-space-xs pt-1">
              <div className="flex items-center gap-space-2xs shrink-0">
                <FilterMenu
                  align="left"
                  buttonClassName="h-8 px-3 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center gap-1.5 text-text-primary transition-all"
                  choices={ratingChoices}
                  icon="tune"
                  iconClassName="text-[16px] text-text-secondary"
                  label="Filters"
                  onChange={setMinRating}
                  title="Filter by rating"
                  value={minRating}
                />
                <button type="button" onClick={() => showToast('Sort: Popular, Newest, Price')} className="h-8 px-3 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center gap-1 text-text-primary transition-all">
                  <span className="font-label-sm text-label-sm">Popular</span>
                  <Icon name="keyboard_arrow_down" className="text-[16px] text-text-secondary" />
                </button>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-caption text-caption text-text-secondary font-medium">
                  Showing{' '}
                  <strong className="text-text-primary font-semibold">{filteredProducts.length}</strong> items
                </span>
                <div className="flex items-center p-0.5 rounded-lg bg-surface-subtle ml-1">
                  <button
                    aria-label="Switch to list view"
                    aria-pressed={viewMode === 'list'}
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-surface-canvas text-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="view_list" className="text-[18px]" />
                  </button>
                  <button
                    aria-label="Switch to grid view"
                    aria-pressed={viewMode === 'grid'}
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-surface-canvas text-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="grid_view" className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {chatOpen && publicBusiness.business ? (
            <div className="px-margin pt-space-sm">
              <BusinessChatBox business={publicBusiness.business} onClose={() => setChatOpen(false)} onStarted={onChatStarted} />
            </div>
          ) : null}

          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-0.5 -mx-margin px-margin">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategorySlug(cat.slug)}
                className={`shrink-0 h-8 px-3.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                  categorySlug === cat.slug
                    ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                    : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {!live && <div className="px-margin mt-space-sm">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-tertiary-container via-tertiary to-tertiary-container p-3 text-on-tertiary shadow-md flex items-center justify-between gap-space-xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-canvas/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="local_fire_department" className="text-[20px] text-on-tertiary" filled />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-sm text-label-sm font-bold tracking-tight">20% OFF OVER ₦10,000</span>
                    <span className="px-1.5 py-0.2 bg-surface-canvas text-tertiary font-caption text-[10px] font-bold rounded">AUTO-APPLY</span>
                  </div>
                  <p className="font-caption text-caption text-on-tertiary/90 truncate mt-0.5">Code applied directly at checkout on all grills & sets</p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 px-3 py-1.5 bg-surface-canvas text-tertiary font-label-sm text-label-sm font-bold rounded-xl shadow-sm hover:scale-95 transition-transform active:scale-90"
              >
                Claimed
              </button>
            </div>
          </div>}

          {!live && (
            <div className="px-margin mt-space-xs">
            <div className="flex items-center justify-between py-1 px-2.5 bg-surface-tint-blue rounded-lg">
              <div className="flex items-center gap-1.5">
                <Icon name="bolt" className="text-[16px] text-primary" />
                <span className="font-caption text-caption text-primary font-medium">Peak Dining Prep Time: ~20-25 mins</span>
              </div>
              <span className="font-caption text-caption text-text-secondary">Express Delivery</span>
            </div>
            </div>
          )}

          <div className="px-margin mt-space-sm mb-28">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-space-xs">
                {filteredProducts.map((product) => renderProductCard(product, 'grid'))}
              </div>
            ) : (
              <div className="flex flex-col gap-space-xs">
                {filteredProducts.map((product) => renderProductCard(product, 'list'))}
              </div>
            )}
          </div>

          <div className="mt-space-xl pb-space-lg flex flex-col items-center justify-center text-center gap-1">
            <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary mb-1">
              <Icon name="restaurant_menu" className="text-[22px]" />
            </div>
            <p className="font-label-sm text-label-sm font-semibold text-text-secondary">
              {live && publicBusiness.loading ? 'Loading items…' : filteredProducts.length ? "You've reached the end of this category" : 'No items in this category'}
            </p>
            {!live && <p className="font-caption text-caption text-text-tertiary">Fresh cuts and special marinades are prepared on order</p>}
          </div>

          <div className="fixed bottom-3 left-0 right-0 z-50 px-4 max-w-lg mx-auto pointer-events-none">
            <div className="pointer-events-auto bg-inverse-surface/95 backdrop-blur-xl text-inverse-on-surface p-2.5 pl-4 rounded-2xl shadow-[0_8px_32px_rgba(17,24,39,0.35)] flex items-center justify-between gap-space-sm border-none">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
                  <Icon name="shopping_cart" className="text-[22px]" filled />
                  {cart.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {cart.count}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-[11px] text-inverse-on-surface/75 tracking-tight font-medium uppercase truncate">Your Urban Order</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading-sm text-heading-sm font-bold text-on-primary leading-tight">{naira(cart.total)}</span>
                    <span className="font-caption text-[11px] text-badge-discount-bg font-semibold">
                      {cart.count} {cart.count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="h-11 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center gap-1.5 shrink-0 shadow-[0_4px_16px_rgba(6,108,244,0.35)] active:scale-95 transition-all"
              >
                <span>{cart.count > 0 ? 'View Cart' : 'Cart'}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={onCheckout} />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}