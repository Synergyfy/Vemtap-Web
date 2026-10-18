import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useCart } from '../../context/CartContext';
import { URBAN_PRODUCTS, naira, type CatalogueProduct } from '../catalogueData';

interface DesktopAllProductsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'All Products' },
  { key: 'grills', label: 'Grills & Steaks' },
  { key: 'burgers', label: 'Burgers & Sandwiches' },
  { key: 'mains', label: 'Local Mains' },
  { key: 'sides', label: 'Sides & Starters' },
  { key: 'drinks', label: 'Drinks' },
];

export function DesktopAllProductsScreen({ onNav, onBack }: DesktopAllProductsScreenProps) {
  const cart = useCart();
  // Category QR links land here with ?category=<id> — open pre-filtered while the
  // category tabs stay available for easy navigation.
  const [category, setCategory] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('category');
    return param && CATEGORIES.some((item) => item.key === param) ? param : 'all';
  });
  const [query, setQuery] = useState('');

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return URBAN_PRODUCTS.filter(
      (product) =>
        (category === 'all' || product.category === category) &&
        (!needle || product.name.toLowerCase().includes(needle) || product.desc.toLowerCase().includes(needle)),
    );
  }, [category, query]);

  const addToCart = (product: CatalogueProduct) => {
    cart.add({ id: product.id, name: product.name, price: product.price, image: product.image, productId: product.id });
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
              <span>Urban Grill &amp; Bistro</span>
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">All Products</span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold">All Products</h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Full Urban Grill &amp; Bistro catalogue — {URBAN_PRODUCTS.length} items priced in Nigerian Naira (₦).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNav('cart')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-canvas shadow-sm shrink-0 hover:ring-2 hover:ring-primary-container/30 transition-all"
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
              {CATEGORIES.map((item) => (
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
                : `Showing all ${products.length} products`}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-2 bg-surface-canvas rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
                <Icon name="search_off" className="text-[24px]" />
              </div>
              <p className="font-label-md text-label-md text-text-secondary">No products match your search</p>
              <p className="font-caption text-caption text-text-tertiary">Try another dish, cut or ingredient</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onNav('product-detail')}
                  className="group bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                    <img
                      alt={product.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={product.image}
                    />
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
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-primary">
                        <Icon name="star" className="text-[14px]" filled />
                        <span className="font-caption text-caption font-bold ml-0.5 text-on-surface">{product.rating ?? '4.8'}</span>
                      </div>
                      <span className="font-caption text-caption text-text-tertiary">{product.reviews ?? '(32)'}</span>
                    </div>
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
                        {cart.qtyOf(product.id) === 0 ? (
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
                          <div
                            className="h-9 px-1.5 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center gap-1.5 shadow-sm shrink-0"
                          >
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
                            <span className="font-label-sm text-label-sm font-bold min-w-[16px] text-center">
                              {cart.qtyOf(product.id)}
                            </span>
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
                        )}
                    </div>
                  </div>
                </div>
              ))}
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
                        <img
                          alt={line.name}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-subtle shrink-0"
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
