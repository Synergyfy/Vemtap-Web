import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { ProductImage } from '../../components/ui/ProductImage';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useCart } from '../../context/CartContext';
import { BusinessChatBox } from '../../components/BusinessChatBox';
import { URBAN_PRODUCTS, naira, type CatalogueProduct } from '../catalogueData';
import { hasApiConfig } from '../../services/api/client';
import { usePublicBusiness } from '../../hooks/usePublicBusiness';

interface DesktopAllProductsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  businessCode?: string;
  onOpenProduct: (productId: string, display?: Partial<CatalogueProduct>) => void;
  /** Which live catalogue the "See All" page shows. `all` keeps the legacy combined list. */
  kind?: 'product' | 'service' | 'all';
  startChat?: boolean;
  onChatStarted?: (branchId: string) => void;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'All Products' },
  { key: 'grills', label: 'Grills & Steaks' },
  { key: 'burgers', label: 'Burgers & Sandwiches' },
  { key: 'mains', label: 'Local Mains' },
  { key: 'sides', label: 'Sides & Starters' },
  { key: 'drinks', label: 'Drinks' },
];

export function DesktopAllProductsScreen({ onNav, onBack, businessCode, onOpenProduct, kind = 'all', startChat, onChatStarted }: DesktopAllProductsScreenProps) {
  const cart = useCart();
  const live = hasApiConfig();
  const publicBusiness = usePublicBusiness(businessCode);
  const [category, setCategory] = useState(() => new URLSearchParams(window.location.search).get('category') ?? 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(Boolean(startChat));
  const liveItems = [
    ...(kind === 'service' ? [] : publicBusiness.products),
    ...(kind === 'product' ? [] : publicBusiness.services),
  ];
  const sectionLabel = kind === 'service' ? 'Services' : kind === 'product' ? 'Products' : 'Products & Services';
  const sourceProducts: Array<CatalogueProduct & { kind: 'product' | 'service' }> = live
    ? liveItems.map((item) => ({
        id: item.id,
        name: item.name,
        desc: item.description ?? '',
        category: item.categoryId ?? item.category ?? '',
        price: item.price,
        image: item.image ?? '',
        imageAlt: item.name,
        kind: item.kind,
      }))
    : URBAN_PRODUCTS.map((item) => ({ ...item, kind: 'product' as const }));
  const categories = live
    ? [
        { key: 'all', label: 'All Items' },
        ...[...new Map(
          liveItems
            .filter((item) => item.categoryId || item.category)
            .map((item) => [item.categoryId ?? item.category ?? '', { key: item.categoryId ?? item.category ?? '', label: item.category ?? 'Category' }]),
        ).values()],
      ]
    : CATEGORIES;

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sourceProducts.filter(
      (product) =>
        (category === 'all' || product.category === category) &&
        (!needle || product.name.toLowerCase().includes(needle) || product.desc.toLowerCase().includes(needle)),
    );
  }, [category, query, sourceProducts]);

  const addToCart = (product: CatalogueProduct) => {
    cart.add({ id: product.id, name: product.name, price: product.price, image: product.image, productId: product.id });
  };

  const renderBadges = (product: CatalogueProduct) => (
    <>
      {product.badge && (
        <span
          className={`absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption font-bold shadow-sm ${product.badgeClass ?? ''}`}
        >
          {product.badge}
        </span>
      )}
      {product.topRightBadge && (
        <span
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full font-caption text-caption font-semibold shadow-sm ${product.topRightClass ?? ''}`}
        >
          {product.topRightBadge}
        </span>
      )}
    </>
  );

  const renderCartControl = (product: CatalogueProduct) =>
    cart.qtyOf(product.id) === 0 ? (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          addToCart(product);
        }}
        className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 active:scale-95 transition-all shadow-sm shrink-0"
      >
        <Icon name="add" className="text-[18px]" />
        <span>Add</span>
      </button>
    ) : (
      <div className="h-9 px-1.5 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center gap-1.5 shadow-sm shrink-0">
        <button
          aria-label={`Remove one ${product.name}`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            cart.decrement(product.id);
          }}
          className="w-7 h-7 rounded-lg bg-surface-canvas/70 hover:bg-surface-canvas flex items-center justify-center text-text-primary active:scale-95 transition-all"
        >
          <Icon name="remove" className="text-[16px]" />
        </button>
        <span className="font-label-sm text-label-sm font-bold min-w-[16px] text-center">{cart.qtyOf(product.id)}</span>
        <button
          aria-label={`Add one ${product.name}`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            cart.increment(product.id);
          }}
          className="w-7 h-7 rounded-lg bg-surface-canvas/70 hover:bg-surface-canvas flex items-center justify-center text-text-primary active:scale-95 transition-all"
        >
          <Icon name="add" className="text-[16px]" />
        </button>
      </div>
    );

  const renderRating = (product: CatalogueProduct) =>
    product.rating || product.reviews ? (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center text-primary">
          <Icon name="star" className="text-[14px]" filled />
          {product.rating && <span className="font-caption text-caption font-bold ml-0.5 text-on-surface">{product.rating}</span>}
        </div>
        {product.reviews && <span className="font-caption text-caption text-text-tertiary">{product.reviews}</span>}
      </div>
    ) : null;

  const renderProductCard = (product: CatalogueProduct & { kind: 'product' | 'service' }) => {
    if (viewMode === 'list') {
      return (
        <div
          key={product.id}
          onClick={() => onOpenProduct(product.id, product)}
          className="group flex cursor-pointer gap-4 rounded-2xl bg-surface-canvas p-3 shadow-sm transition-all hover:shadow-md"
        >
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
            <ProductImage
              alt={product.imageAlt}
              className="h-full w-full"
              iconClassName="text-[22px]"
              imageClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              showLabel={false}
              src={product.image}
            />
            {renderBadges(product)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
            <div className="min-w-0">
              {renderRating(product)}
              <h3 className="font-heading-sm text-heading-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="font-caption text-caption text-text-secondary line-clamp-2">{product.desc}</p>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold">{naira(product.price)}</span>
                {product.was && (
                  <span className="font-caption text-caption text-text-tertiary line-through">{naira(product.was)}</span>
                )}
              </div>
              {renderCartControl(product)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={product.id}
        onClick={() => onOpenProduct(product.id, product)}
        className="group bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
      >
        <div className="relative h-44 w-full overflow-hidden bg-surface-container">
          <ProductImage
            alt={product.imageAlt}
            className="h-full w-full"
            imageClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={product.image}
          />
          {renderBadges(product)}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          {renderRating(product)}
          <h3 className="font-heading-sm text-heading-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="font-caption text-caption text-text-secondary line-clamp-2">{product.desc}</p>
          <div className="mt-auto pt-3 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading-sm text-heading-sm text-on-surface font-bold">{naira(product.price)}</span>
              {product.was && (
                <span className="font-caption text-caption text-text-tertiary line-through">{naira(product.was)}</span>
              )}
            </div>
            {renderCartControl(product)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface min-h-screen">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 py-8 space-y-6">
          <nav className="flex items-center gap-2 font-caption text-caption text-text-secondary">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Icon name="arrow_back" className="text-[15px]" />
              <span>{live ? publicBusiness.business?.name ?? 'Business' : 'Urban Grill &amp; Bistro'}</span>
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">{live ? sectionLabel : 'All Products'}</span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold">
                {live ? publicBusiness.business?.name ?? 'Business storefront' : 'All Products'}
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                {live ? `${sectionLabel} — ${products.length} items.` : `Full Urban Grill & Bistro catalogue — ${products.length} items priced in Nigerian Naira (₦).`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {live && publicBusiness.business ? (
                <button
                  type="button"
                  aria-pressed={chatOpen}
                  onClick={() => setChatOpen((open) => !open)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-canvas shadow-sm hover:ring-2 hover:ring-primary-container/30 transition-all"
                >
                  <Icon name="vemtap-chat" className="text-[18px] text-primary" />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Chat</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onNav('cart')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-canvas shadow-sm hover:ring-2 hover:ring-primary-container/30 transition-all"
              >
                <div className="relative">
                  <Icon name="shopping_cart" className="text-[18px] text-primary" />
                  {cart.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cart.count}
                    </span>
                  )}
                </div>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {cart.count} {cart.count === 1 ? 'item' : 'items'} · {naira(cart.total)}
                </span>
              </button>
            </div>
          </div>
          {chatOpen && publicBusiness.business ? (
            <BusinessChatBox business={publicBusiness.business} onClose={() => setChatOpen(false)} onStarted={onChatStarted} />
          ) : null}

          <div className="flex items-start gap-6">
            <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="bg-surface-canvas p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="relative w-full">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-on-surface placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dishes, cuts, drinks, ingredients..."
                type="text"
                value={query}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold whitespace-nowrap transition-all ${
                    category === item.key
                      ? 'bg-surface-tint-blue text-primary-container shadow-xs'
                      : 'text-text-secondary hover:text-on-surface bg-surface-subtle'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm text-label-sm text-text-secondary">
              {query.trim() || category !== 'all'
                ? `Showing ${products.length} matching items`
                : `Showing all ${products.length} ${kind === 'service' ? 'services' : 'items'}`}
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-surface-canvas p-1 shadow-sm">
              <button
                aria-label="Switch to list view"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                }`}
              >
                <Icon name="view_list" className="text-[18px]" />
              </button>
              <button
                aria-label="Switch to grid view"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                }`}
              >
                <Icon name="grid_view" className="text-[18px]" />
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-2 bg-surface-canvas rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
                <Icon name="search_off" className="text-[24px]" />
              </div>
              <p className="font-label-md text-label-md text-text-secondary">
                {live && publicBusiness.loading ? 'Loading items…' : 'No items match this category'}
              </p>
              {!live && <p className="font-caption text-caption text-text-tertiary">Try another dish, cut or ingredient</p>}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => renderProductCard(product))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => renderProductCard(product))}
            </div>
          )}
            </div>

            <aside className="hidden lg:block w-80 shrink-0 sticky top-6">
              <div className="bg-surface-canvas rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="px-4 py-3.5 flex items-center justify-between border-b border-surface-subtle">
                  <div className="flex items-center gap-2">
                    <Icon name="shopping_cart" className="text-[18px] text-primary" />
                    <span className="font-heading-sm text-heading-sm text-on-surface font-semibold">Your Cart</span>
                    {cart.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                        {cart.count}
                      </span>
                    )}
                  </div>
                  {cart.count > 0 && (
                    <button
                      aria-label="Clear cart"
                      type="button"
                      onClick={cart.clear}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-badge-discount-text hover:bg-surface-subtle transition-colors"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  )}
                </div>

                {cart.count === 0 ? (
                  <div className="px-4 py-10 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
                      <Icon name="shopping_bag" className="text-[24px]" />
                    </div>
                    <p className="font-label-md text-label-md text-text-secondary">Your cart is empty</p>
                    <p className="font-caption text-caption text-text-tertiary">Tap Add on any dish to start your order</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-surface-subtle max-h-[45vh] overflow-y-auto">
                    {cart.lines.map((line) => (
                      <div key={line.id} className="px-4 py-3 flex items-center gap-3">
                        <ProductImage
                          alt={line.name}
                          className="h-12 w-12 shrink-0 rounded-lg"
                          iconClassName="text-[18px]"
                          showLabel={false}
                          src={line.image}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-label-md text-label-md text-on-surface font-semibold line-clamp-1">{line.name}</p>
                          <p className="font-caption text-caption text-text-secondary">{naira(line.price)} each</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <button
                              aria-label={`Remove one ${line.name}`}
                              type="button"
                              onClick={() => cart.decrement(line.id)}
                              className="w-6 h-6 rounded-md bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-primary active:scale-95 transition-all"
                            >
                              <Icon name="remove" className="text-[15px]" />
                            </button>
                            <span className="font-label-sm text-label-sm font-bold text-on-surface min-w-[16px] text-center">
                              {line.qty}
                            </span>
                            <button
                              aria-label={`Add one ${line.name}`}
                              type="button"
                              onClick={() => cart.increment(line.id)}
                              className="w-6 h-6 rounded-md bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-primary active:scale-95 transition-all"
                            >
                              <Icon name="add" className="text-[15px]" />
                            </button>
                            <button
                              aria-label={`Remove ${line.name} from cart`}
                              type="button"
                              onClick={() => cart.remove(line.id)}
                              className="ml-1 w-6 h-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-badge-discount-text hover:bg-surface-subtle transition-colors"
                            >
                              <Icon name="close" className="text-[15px]" />
                            </button>
                          </div>
                        </div>
                        <span className="font-label-md text-label-md font-bold text-on-surface shrink-0">
                          {naira(line.price * line.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {cart.count > 0 && (
                  <div className="px-4 py-3.5 border-t border-surface-subtle flex flex-col gap-3 bg-surface-subtle/40">
                    <div className="flex items-center justify-between">
                      <span className="font-body-md text-body-md text-text-secondary">
                        Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'})
                      </span>
                      <span className="font-heading-sm text-heading-sm text-on-surface font-bold">{naira(cart.total)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNav('cart')}
                      className="h-11 w-full rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                      <span>Go to Cart</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
