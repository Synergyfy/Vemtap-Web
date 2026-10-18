import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { URBAN_PRODUCTS, naira } from './catalogueData';
import { cartCount, cartTotals, type PosCartLine } from './posCartData';
import { PosOfflineBar } from '../components/ui/PosOfflineBar';

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
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'barcode' | 'qr' | null>(null);
  const [manualSku, setManualSku] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const toastTimer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

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

  const updateQty = (id: string, delta: number) => {
    onCartChange((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0),
    );
  };

  const removeFromCart = (id: string) => {
    const item = cart.find((line) => line.id === id);
    onCartChange((prev) => prev.filter((line) => line.id !== id));
    showToast(`${item?.name ?? 'Item'} removed from ticket`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    if (diffY > 35 && !cartSheetOpen) {
      setCartSheetOpen(true);
    } else if (diffY < -35 && cartSheetOpen) {
      setCartSheetOpen(false);
    }
    touchStartY.current = null;
  };

  const handleManualScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = manualSku.trim().toLowerCase();
    if (!clean) return;
    const match = URBAN_PRODUCTS.find(
      (p) => p.name.toLowerCase().includes(clean) || (p.desc ?? '').toLowerCase().includes(clean),
    );
    if (match) {
      addProduct(match.id, match.name, match.price);
      setManualSku('');
      setScannerMode(null);
    } else {
      showToast(`No item found for "${manualSku}"`);
    }
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
              aria-label="Find customer order"
              onClick={onOpenOrders}
              className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center active:scale-95 transition-transform"
            >
              <Icon name="receipt_long" className="text-primary text-[16px]" />
            </button>
            <button
              type="button"
              aria-label="Scan barcode"
              onClick={() => setScannerMode('barcode')}
              className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center active:scale-95 transition-transform"
            >
              <Icon name="barcode_scanner" className="text-primary text-[16px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[17px]" />
            </div>
          </div>
        </div>

        {/* Search + Barcode & QR code scanner */}
        <div className="px-margin pb-space-xs flex items-center gap-space-xs">
          <div className="flex-1 h-10 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu items…"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent outline-none font-label-sm text-label-sm text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="text-text-secondary pr-1"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
            <div className="flex items-center gap-1 border-l border-border-subtle pl-1.5 shrink-0">
              <button
                type="button"
                aria-label="Scan barcode"
                title="Scan Barcode"
                onClick={() => setScannerMode('barcode')}
                className="w-7 h-7 rounded-lg text-primary hover:bg-surface-tint-blue flex items-center justify-center active:scale-90 transition-transform"
              >
                <Icon name="barcode_scanner" className="text-[18px]" />
              </button>
              <button
                type="button"
                aria-label="Scan QR code"
                title="Scan QR Code"
                onClick={() => setScannerMode('qr')}
                className="w-7 h-7 rounded-lg text-primary hover:bg-surface-tint-blue flex items-center justify-center active:scale-90 transition-transform"
              >
                <Icon name="qr_code_scanner" className="text-[18px]" />
              </button>
            </div>
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

      {/* Offline state + "Sync Online" — the only place sync lives now that /pos/sync is gone. */}
      <div className="px-margin pt-space-xs">
        <PosOfflineBar variant="mobile" />
      </div>

      {/* Catalog */}
      <div ref={scrollRef} className="flex-1 flex flex-col pb-48">
        <div className="px-margin py-space-2xs flex items-center justify-between">
          <span className="font-caption text-caption text-text-secondary">
            {products.length} of {URBAN_PRODUCTS.length} items
          </span>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              onClick={() => showToast('Sorted by popularity')}
              className="font-caption text-caption text-primary font-semibold flex items-center gap-1"
            >
              <Icon name="sort" className="text-[14px]" />
              <span>Popular</span>
            </button>
            {/* Grid / list view toggle */}
            <div className="flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5">
              <button
                type="button"
                aria-label="List view"
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  view === 'list' ? 'bg-surface text-primary' : 'text-text-secondary'
                }`}
              >
                <Icon name="view_list" className="text-[17px]" />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  view === 'grid' ? 'bg-surface text-primary' : 'text-text-secondary'
                }`}
              >
                <Icon name="grid_view" className="text-[17px]" />
              </button>
            </div>
          </div>
        </div>

        <div className={`px-margin flex gap-space-xs ${view === 'grid' ? 'flex-wrap' : 'flex-col'}`}>
          {products.map((product) => {
            const line = cart.find((item) => item.id === product.id);
            if (view === 'grid') {
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product.id, product.name, product.price)}
                  className="w-[calc(50%-4px)] bg-surface-canvas rounded-xl p-space-xs shadow-sm flex flex-col gap-1 text-left active:scale-95 transition-transform"
                >
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    loading="lazy"
                    className="w-full h-20 rounded-lg object-cover bg-surface-container"
                  />
                  <span className="font-caption text-caption text-on-surface truncate">{product.name}</span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">{naira(product.price)}</span>
                  <div className="flex items-center justify-between mt-0.5">
                    {line && line.qty > 0 ? (
                      <span className="font-caption text-caption text-primary font-bold">
                        {line.qty} on ticket
                      </span>
                    ) : (
                      <span className="font-caption text-caption text-text-secondary">Tap to add</span>
                    )}
                    <span className="w-6 h-6 rounded-md bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <Icon name="add" className="text-[14px]" />
                    </span>
                  </div>
                </button>
              );
            }
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
                {line && line.qty > 0 ? (
                  <div className="flex items-center gap-1 bg-surface-tint-blue rounded-lg p-0.5 shrink-0 border border-primary/20 shadow-xs">
                    <button
                      type="button"
                      aria-label={`Decrease ${product.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(product.id, -1);
                      }}
                      className="w-6 h-6 rounded-md bg-surface flex items-center justify-center text-primary hover:bg-surface-container active:scale-90 transition-transform shadow-xs"
                    >
                      <Icon name="remove" className="text-[13px]" />
                    </button>
                    <span className="font-label-sm text-label-sm text-primary font-bold min-w-[16px] text-center">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${product.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(product.id, 1);
                      }}
                      className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
                    >
                      <Icon name="add" className="text-[13px]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`Add ${product.name}`}
                    onClick={() => addProduct(product.id, product.name, product.price)}
                    className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs active:scale-95 transition-transform shrink-0"
                  >
                    <Icon name="add" className="text-[16px]" />
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

      {/* Cart dock (Collapsed) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin pb-space-xs z-40"
      >
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border border-border-subtle p-space-xs flex flex-col gap-space-2xs">
          {/* Drag handle / tap to see all products */}
          <button
            type="button"
            onClick={() => setCartSheetOpen(true)}
            aria-label="View products in cart"
            className="w-full flex flex-col items-center group py-0.5 -mt-0.5 cursor-pointer"
          >
            <div className="w-10 h-1 rounded-full bg-border-subtle group-hover:bg-primary transition-colors" />
          </button>

          <div
            onClick={() => setCartSheetOpen(true)}
            className="flex items-center justify-between gap-space-xs cursor-pointer select-none"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCustomer();
              }}
              className="flex items-center gap-1 min-w-0 h-7 px-space-xs rounded-full bg-surface-tint-blue active:scale-95 transition-transform"
            >
              <Icon name="person_add" className="text-primary text-[14px]" />
              <span className="font-caption text-caption text-primary font-semibold truncate">Guest Walk-in</span>
            </button>
            <div className="flex items-center gap-1 text-primary font-caption text-caption font-semibold">
              <span>{count} item{count === 1 ? '' : 's'} on ticket</span>
              <Icon name="keyboard_arrow_up" className="text-[16px]" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-space-xs">
            <div
              onClick={() => setCartSheetOpen(true)}
              className="flex-1 min-w-0 flex flex-col cursor-pointer select-none"
            >
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wide">Subtotal</span>
              <span className="font-heading-md text-heading-md text-on-surface tracking-tight leading-none">
                {naira(subtotal)}
              </span>
            </div>
            {/* Note: 'Key' button removed per request */}
            <button
              type="button"
              onClick={onCharge}
              disabled={count === 0}
              className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-space-2xs shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Charge</span>
              <Icon name="arrow_forward" className="text-[17px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Cart List Drawer (Slide up / drag up) */}
      {cartSheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setCartSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-[430px] bg-surface rounded-t-3xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden border-t border-border-subtle animate-in slide-in-from-bottom duration-200"
          >
            {/* Handle & Header */}
            <div className="p-space-sm pb-space-xs border-b border-border-subtle bg-surface sticky top-0 z-10">
              <button
                type="button"
                onClick={() => setCartSheetOpen(false)}
                className="w-full flex flex-col items-center cursor-grab py-0.5 -mt-1 mb-1.5"
                aria-label="Collapse cart"
              >
                <div className="w-12 h-1.5 rounded-full bg-border-subtle" />
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                    Current Ticket
                  </h3>
                  <span className="h-6 px-2.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold flex items-center">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close cart sheet"
                  onClick={() => setCartSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary active:scale-95 transition-transform"
                >
                  <Icon name="keyboard_arrow_down" className="text-[22px]" />
                </button>
              </div>
            </div>

            {/* Cart Product List with Remove Icon */}
            <div className="flex-1 overflow-y-auto px-margin py-space-xs flex flex-col gap-space-xs divide-y divide-border-subtle/40">
              {cart.map((line) => (
                <div key={line.id} className="pt-space-xs first:pt-0 flex items-center justify-between gap-space-xs">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface font-medium truncate">
                      {line.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      {naira(line.unit)} each
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label={`Decrease ${line.name}`}
                      onClick={() => updateQty(line.id, -1)}
                      className="w-6 h-6 rounded-md bg-surface-canvas flex items-center justify-center text-on-surface active:scale-90 transition-transform shadow-xs"
                    >
                      <Icon name="remove" className="text-[13px]" />
                    </button>
                    <span className="w-5 text-center font-label-sm text-label-sm font-bold text-on-surface">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${line.name}`}
                      onClick={() => updateQty(line.id, 1)}
                      className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
                    >
                      <Icon name="add" className="text-[13px]" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold min-w-[55px] text-right">
                    {naira(line.unit * line.qty)}
                  </span>

                  {/* Remove Icon */}
                  <button
                    type="button"
                    aria-label={`Remove ${line.name} from cart`}
                    onClick={() => removeFromCart(line.id)}
                    className="w-8 h-8 rounded-lg text-error hover:bg-error-container/30 flex items-center justify-center active:scale-90 transition-colors shrink-0 ml-0.5"
                    title="Remove item"
                  >
                    <Icon name="delete_outline" className="text-[19px]" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                    <Icon name="shopping_cart" className="text-text-secondary text-[22px]" />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Your ticket is empty</span>
                  <span className="font-caption text-caption text-text-secondary max-w-[200px]">
                    Add items from the catalog above to ring up the sale.
                  </span>
                </div>
              )}
            </div>

            {/* Footer Summary & Charge CTA */}
            <div className="p-space-sm bg-surface border-t border-border-subtle flex flex-col gap-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Subtotal
                </span>
                <span className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">
                  {naira(subtotal)}
                </span>
              </div>
              <div className="flex gap-space-xs">
                <button
                  type="button"
                  onClick={() => setCartSheetOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold active:scale-[0.98] transition-transform"
                >
                  Add More Items
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCartSheetOpen(false);
                    onCharge();
                  }}
                  disabled={count === 0}
                  className="flex-1 h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Charge {naira(subtotal)}</span>
                  <Icon name="arrow_forward" className="text-[17px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode & QR Code Scanner Modal */}
      {scannerMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setScannerMode(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[390px] bg-surface rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-border-subtle z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name={scannerMode === 'barcode' ? 'barcode_scanner' : 'qr_code_scanner'} className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                    {scannerMode === 'barcode' ? 'Barcode Scanner' : 'QR Code Scanner'}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">
                    {scannerMode === 'barcode' ? 'Align product barcode in frame' : 'Scan customer or item QR code'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close scanner"
                onClick={() => setScannerMode(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary active:scale-95 transition-transform"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative w-full h-48 rounded-2xl bg-black/90 overflow-hidden flex items-center justify-center border-2 border-primary/50 shadow-inner">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-28 border-2 border-dashed border-primary/60 rounded-xl pointer-events-none flex items-center justify-center">
                {/* Laser scan line */}
                <div className="w-full h-0.5 bg-primary shadow-[0_0_12px_rgba(6,108,244,1)] animate-pulse" />
              </div>
              <span className="font-caption text-caption text-white/80 bg-black/60 px-3 py-1 rounded-full z-10">
                Camera active · ready to scan
              </span>
            </div>

            {/* Quick simulate tap for testing */}
            <div className="flex flex-col gap-1.5">
              <span className="font-caption text-caption text-text-secondary font-medium">
                Tap to simulate scan:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {URBAN_PRODUCTS.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      addProduct(item.id, item.name, item.price);
                      showToast(`Scanned: ${item.name}`);
                      setScannerMode(null);
                    }}
                    className="h-9 px-2 rounded-xl bg-surface-container hover:bg-surface-tint-blue hover:text-primary text-on-surface text-left font-caption text-caption truncate flex items-center gap-1.5 active:scale-95 transition-all border border-border-subtle"
                  >
                    <Icon name="check_circle" className="text-[14px] text-badge-discount-text shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual entry fallback */}
            <form onSubmit={handleManualScanSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={manualSku}
                onChange={(e) => setManualSku(e.target.value)}
                placeholder="Or type SKU / item name..."
                className="flex-1 h-10 px-3 rounded-xl bg-surface-container font-caption text-caption text-on-surface outline-none border border-transparent focus:border-primary"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-primary-container text-on-primary font-caption text-caption font-semibold active:scale-95 transition-transform shrink-0"
              >
                Scan
              </button>
            </form>
          </div>
        </div>
      )}

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
