import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { URBAN_PRODUCTS, naira } from './catalogueData';
import { cartCount, cartTotals, type PosCartLine } from './posCartData';

interface BusinessPosRegisterScreenProps {
  cart: PosCartLine[];
  onCartChange: Dispatch<SetStateAction<PosCartLine[]>>;
  onBack: () => void;
  onCharge: () => void;
  onOpenCustomer: () => void;
  onOpenOrders: () => void;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'grills', label: 'Grills' },
  { key: 'burgers', label: 'Burgers' },
  { key: 'mains', label: 'Mains' },
  { key: 'sides', label: 'Sides' },
  { key: 'drinks', label: 'Drinks' },
];

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

export function BusinessPosRegisterScreen({
  cart,
  onCartChange,
  onBack,
  onCharge,
  onOpenCustomer,
  onOpenOrders,
}: BusinessPosRegisterScreenProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [keypadValue, setKeypadValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return URBAN_PRODUCTS.filter((p) => {
      const inCategory = category === 'all' || p.category === category;
      const matches = !q || p.name.toLowerCase().includes(q) || (p.desc ?? '').toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [query, category]);

  const count = cartCount(cart);
  const subtotal = cartTotals(cart).subtotal;

  const addProduct = (id: string, name: string, price: number) => {
    onCartChange((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
      return [...prev, { id, name, unit: price, member: price, qty: 1 }];
    });
    showToast(`${name} added to ticket`);
  };

  const selectCategory = (key: string) => {
    setCategory(key);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pressKey = (key: string) => {
    if (key === 'backspace') setKeypadValue((v) => v.slice(0, -1));
    else setKeypadValue((v) => (v.includes('.') && key === '.' ? v : (v + key).slice(0, 9)));
  };

  const submitKeypad = () => {
    const amount = Number(keypadValue);
    if (!amount || amount <= 0) {
      showToast('Enter a valid amount first');
      return;
    }
    onCartChange((prev) => [...prev, { id: `custom-${Date.now()}`, name: 'Custom Charge', unit: amount, member: amount, qty: 1 }]);
    setKeypadValue('');
    setKeypadOpen(false);
    showToast(`${naira(amount)} custom charge added`);
  };

  const selectNav = (key: string) => {
    if (key === 'register') return;
    if (key === 'held') showToast('2 held tickets loaded');
    else if (key === 'orders') onOpenOrders();
    else showToast('Shift drawer opened');
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
          >
            <Icon name="arrow_back" className="text-[21px]" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
              Register Catalog
            </span>
            <span className="font-caption text-caption text-text-secondary leading-none">Register #02 · Wuse II</span>
          </div>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              type="button"
              aria-label="Scan barcode"
              onClick={() => showToast('Barcode scanner ready')}
              className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center active:scale-95 transition-transform"
            >
              <Icon name="barcode_scanning" className="text-primary text-[16px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[17px]" />
            </div>
          </div>
        </div>

        {/* Search + keypad */}
        <div className="px-margin pb-space-xs flex items-center gap-space-xs">
          <div className="flex-1 h-10 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu items…"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent outline-none font-label-sm text-label-sm text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-text-secondary">
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Open amount keypad"
            onClick={() => setKeypadOpen(true)}
            className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <Icon name="pin" className="text-primary text-[18px]" />
          </button>
        </div>

        {/* Category pills */}
        <div className="px-margin pb-space-xs flex gap-space-2xs overflow-x-auto no-scrollbar">
          {CATEGORIES.map((item) => {
            const isActive = item.key === category;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => selectCategory(item.key)}
                className={`h-8 px-space-xs rounded-full font-caption text-caption font-semibold whitespace-nowrap flex items-center active:scale-95 transition-all ${
                  isActive ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-secondary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Catalog */}
      <div ref={scrollRef} className="flex-1 flex flex-col pb-48">
        <div className="px-margin py-space-2xs flex items-center justify-between">
          <span className="font-caption text-caption text-text-secondary">
            {products.length} of {URBAN_PRODUCTS.length} items
          </span>
          <button
            type="button"
            onClick={() => showToast('Sorted by popularity')}
            className="font-caption text-caption text-primary font-semibold flex items-center gap-1"
          >
            <Icon name="sort" className="text-[14px]" />
            <span>Popular</span>
          </button>
        </div>

        <div className="px-margin flex flex-col gap-space-xs">
          {products.map((product) => {
            const line = cart.find((item) => item.id === product.id);
            return (
              <div
                key={product.id}
                className="bg-surface-canvas rounded-xl p-space-xs shadow-sm flex items-center gap-space-xs"
              >
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  loading="lazy"
                  className="w-14 h-14 rounded-lg object-cover bg-surface-container shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface truncate">{product.name}</span>
                  <span className="font-caption text-caption text-text-secondary truncate line-clamp-1">
                    {product.desc}
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold mt-0.5">
                    {naira(product.price)}
                  </span>
                </div>
                {line ? (
                  <div className="flex items-center gap-1 bg-surface-tint-blue rounded-full px-1 py-0.5 shrink-0">
                    <span className="font-label-sm text-label-sm text-primary font-bold px-1">{line.qty}</span>
                    <span className="font-caption text-caption text-primary">in cart</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`Add ${product.name}`}
                    onClick={() => addProduct(product.id, product.name, product.price)}
                    className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0"
                  >
                    <Icon name="add" className="text-[18px]" />
                  </button>
                )}
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="py-space-lg flex flex-col items-center text-center gap-space-xs">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="search_off" className="text-text-secondary text-[22px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">No menu items found</span>
              <span className="font-caption text-caption text-text-secondary max-w-[240px]">
                Try a different keyword or switch category to keep ringing up sales.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cart dock */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin pb-space-xs z-40">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] border border-border-subtle p-space-xs flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-xs">
            <button
              type="button"
              onClick={onOpenCustomer}
              className="flex items-center gap-1 min-w-0 h-7 px-space-xs rounded-full bg-surface-tint-blue active:scale-95 transition-transform"
            >
              <Icon name="person_add" className="text-primary text-[14px]" />
              <span className="font-caption text-caption text-primary font-semibold truncate">Guest Walk-in</span>
            </button>
            <span className="font-caption text-caption text-text-secondary shrink-0">
              {count} item{count === 1 ? '' : 's'} on ticket
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wide">Subtotal</span>
              <span className="font-heading-md text-heading-md text-on-surface tracking-tight leading-none">
                {naira(subtotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setKeypadOpen(true)}
              className="h-10 px-space-xs rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Icon name="pin" className="text-[16px]" />
              <span>Key</span>
            </button>
            <button
              type="button"
              onClick={onCharge}
              className="h-10 px-space-md rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-space-2xs shadow-md active:scale-95 transition-all"
            >
              <span>Charge</span>
              <Icon name="arrow_forward" className="text-[17px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Keypad modal */}
      {keypadOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <button
            type="button"
            aria-label="Close keypad"
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
            onClick={() => setKeypadOpen(false)}
          />
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-3xl p-space-md pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Custom Amount</span>
              <button
                type="button"
                aria-label="Close keypad"
                onClick={() => setKeypadOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
              >
                <Icon name="close" className="text-[17px]" />
              </button>
            </div>
            <div className="h-14 bg-surface-container rounded-xl px-space-sm flex items-center justify-end">
              <span className="font-heading-md text-heading-md text-on-surface tracking-tight">
                {keypadValue ? `₦${keypadValue}` : '₦0'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              {KEYPAD_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => pressKey(key)}
                  className="h-12 rounded-xl bg-surface-canvas border border-border-subtle font-label-md text-label-md text-on-surface active:bg-surface-container transition-colors flex items-center justify-center"
                >
                  {key === 'backspace' ? <Icon name="backspace" className="text-[19px]" /> : key}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={submitKeypad}
              className="h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold active:scale-[0.98] transition-all"
            >
              Add to Ticket
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center h-16 px-space-xs">
          {[
            { key: 'register', icon: 'point_of_sale', label: 'Register' },
            { key: 'held', icon: 'pause_circle', label: 'Held' },
            { key: 'orders', icon: 'receipt_long', label: 'Orders' },
            { key: 'shift', icon: 'account_balance_wallet', label: 'Shift' },
          ].map((item) => {
            const isActive = item.key === 'register';
            return (
              <button
                key={item.key}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => selectNav(item.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                  isActive
                    ? 'bg-surface-tint-blue text-primary mx-1 rounded-xl py-1'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} className="text-[21px]" filled={isActive} />
                <span className="font-caption text-caption leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {toast && (
        <div className="fixed bottom-44 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
