import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { URBAN_PRODUCTS, naira } from './catalogueData';
import { cartCount, cartTotals, type PosCartLine } from './posCartData';
import { PosOfflineBar } from '../components/ui/PosOfflineBar';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { isCustomLine, useHeldTicket, useLivePos, usePosCartMirror, usePosProducts } from './posLive';
import { useRegisterHistory } from '../hooks/business/usePos';
import { drawerDateTime, drawerMoney } from './posDrawerFormat';
import { UserAvatar } from '../components/ui/UserAvatar';

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

  const live = hasApiConfig();
  const pos = useLivePos();
  const catalogue = usePosProducts();
  const heldTicket = useHeldTicket();
  usePosCartMirror(cart);

  const [catalogTab] = useState<'product' | 'service'>('product');

  const liveFloat = Number(pos.zReport?.openingCash ?? 0);
  const liveExpected = Number(pos.zReport?.expectedCash ?? liveFloat);
  const expectedCashInDrawer = live
    ? (pos.isOpen ? liveExpected : 0)
    : 142400;

  const drawerHistory = useRegisterHistory(live);
  const [drawerModalOpen, setDrawerModalOpen] = useState(false);
  const [floatInput, setFloatInput] = useState(live ? '' : '50,000');
  const [closingCashInput, setClosingCashInput] = useState('');
  const [openingBusy, setOpeningBusy] = useState(false);
  const [closingBusy, setClosingBusy] = useState(false);
  const promptedRef = useRef(false);

  useEffect(() => {
    // If live and register has not been opened yet, prompt user immediately upon opening the register
    if (live && pos.tillsLoaded && !pos.isOpen && !promptedRef.current) {
      promptedRef.current = true;
      setDrawerModalOpen(true);
    }
  }, [live, pos.tillsLoaded, pos.isOpen]);

  const handleConfirmFloat = async () => {
    const floatAmount = Number(floatInput.replace(/[^\d.]/g, '')) || 0;
    if (!live) {
      setDrawerModalOpen(false);
      showToast(`Shift started! Opening float: ₦${(floatAmount || 50000).toLocaleString()}`);
      return;
    }
    setOpeningBusy(true);
    try {
      await pos.openOnTill(undefined, floatAmount);
      setDrawerModalOpen(false);
      showToast(`Register opened! Float set to ₦${floatAmount.toLocaleString()}`);
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not open cash drawer.'));
    } finally {
      setOpeningBusy(false);
    }
  };

  const handleRecordClosing = async () => {
    const counted = Number(closingCashInput.replace(/[^\d.]/g, '')) || expectedCashInDrawer;
    setClosingBusy(true);
    try {
      await pos.mutations.closeRegister.mutateAsync({ countedCash: counted });
      setDrawerModalOpen(false);
      setClosingCashInput('');
      showToast(`Drawer closed and counted at ${drawerMoney(counted)}.`);
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not record the closing drawer count.'));
    } finally {
      setClosingBusy(false);
    }
  };

  // Product-only rollout: never switch to the service catalogue.
  // useEffect(() => {
  //   if (live && !catalogue.hasProducts && catalogue.hasServices) {
  //     setCatalogTab('service');
  //   }
  // }, [live, catalogue.hasProducts, catalogue.hasServices]);

  // Product-only rollout: never show or fall back to the service catalogue.
  const showBothTabs = false;

  const currentMobileList = useMemo(() => {
    if (!live) return URBAN_PRODUCTS;
    if (showBothTabs) {
      return catalogTab === 'service' ? catalogue.servicesMobile : catalogue.productsMobile;
    }
    return catalogue.productsMobile.length > 0 ? catalogue.productsMobile : catalogue.mobile;
  }, [live, showBothTabs, catalogTab, catalogue.servicesMobile, catalogue.productsMobile, catalogue.mobile, catalogue.hasProducts, catalogue.hasServices]);

  const allProducts = currentMobileList;
  const categories = useMemo(() => {
    if (!live) return CATEGORIES;
    if (showBothTabs) {
      return catalogTab === 'service' ? catalogue.serviceCategories : catalogue.productCategories;
    }
    return catalogue.productCategories.length > 0 ? catalogue.productCategories : catalogue.categories;
  }, [live, showBothTabs, catalogTab, catalogue.serviceCategories, catalogue.productCategories, catalogue.categories, catalogue.hasProducts, catalogue.hasServices]);

  useEffect(() => {
    if (live && catalogue.error) showToast(apiErrorMessage(catalogue.error, 'Could not load your catalogue.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue.error]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((p) => {
      const inCategory = category === 'all' || p.category === category;
      const matches =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.desc ?? '').toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.barcode ?? '').toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [query, category, allProducts]);

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
    const match =
      allProducts.find(
        (p) => (p.barcode ?? '').trim().toLowerCase() === clean || (p.sku ?? '').trim().toLowerCase() === clean,
      ) ??
      allProducts.find((p) => p.name.toLowerCase().includes(clean) || (p.desc ?? '').toLowerCase().includes(clean));
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
    if (live) {
      showToast('Custom charges are coming soon. Add a catalogue item instead.');
      return;
    }
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
    if (key === 'held') {
      if (!live) {
        showToast('2 held tickets loaded');
        return;
      }
      const lines = cart.filter((line) => !isCustomLine(line));
      if (lines.length) {
        heldTicket
          .hold(lines)
          .then(() => {
            onCartChange([]);
            showToast('Ticket held — tap Held again to bring it back');
          })
          .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not hold the ticket.')));
        return;
      }
      heldTicket
        .resume()
        .then((resumed) => {
          if (!resumed) {
            showToast('No held tickets');
            return;
          }
          onCartChange(resumed.map((line) => ({ ...line, member: line.unit })));
          showToast('Held ticket loaded');
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not load the held ticket.')));
    } else if (key === 'orders') onOpenOrders();
    else showToast(live ? (pos.isOpen ? `Register open on ${pos.tillName}` : 'No register open') : 'Shift drawer opened');
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
            <span className="font-caption text-caption text-text-secondary leading-none">
              {live ? (pos.isOpen ? pos.tillName : 'No register open') : 'Register #02'}
            </span>
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>

        {/* Cash in Drawer Strip */}
        <div className="px-margin pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDrawerModalOpen(true)}
            className={`flex-1 py-1 px-2.5 rounded-lg flex items-center justify-between text-[12px] font-semibold transition-colors ${
              (live ? pos.isOpen : true)
                ? 'bg-surface-container text-text-primary hover:bg-surface-container-high'
                : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Icon name="payments" className="text-primary text-[16px]" />
              <span>Cash in Drawer:</span>
              <strong className="text-text-primary">
                ₦{(live ? (pos.isOpen ? expectedCashInDrawer : 0) : expectedCashInDrawer).toLocaleString()}
              </strong>
            </div>
            {live && !pos.isOpen && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                Set Float
              </span>
            )}
          </button>
        </div>

        {/* Search + Barcode & QR code scanner */}
        <div className="px-margin pb-space-xs flex items-center gap-space-xs">
          <div className="flex-1 h-10 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                const scanned = query.trim().toLowerCase();
                const match = allProducts.find(
                  (product) =>
                    (product.barcode ?? '').trim().toLowerCase() === scanned ||
                    (product.sku ?? '').trim().toLowerCase() === scanned,
                );
                if (match) {
                  addProduct(match.id, match.name, match.price);
                  setQuery('');
                } else if (scanned) {
                  showToast(`No item found for "${query.trim()}"`);
                }
              }}
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

        {/* Product-only rollout: the product/service switcher is hidden.
        {showBothTabs && (
          <div className="px-margin pb-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCatalogTab('product');
                setCategory('all');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                catalogTab === 'product'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="inventory_2" className="text-[16px]" />
              <span>Products ({catalogue.productsMobile.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCatalogTab('service');
                setCategory('all');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                catalogTab === 'service'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="design_services" className="text-[16px]" />
              <span>Services ({catalogue.servicesMobile.length})</span>
            </button>
          </div>
        )}
        */}

        {/* Category pills */}
        <div className="px-margin pb-space-xs flex gap-space-2xs overflow-x-auto no-scrollbar">
          {categories.map((item) => {
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
            {products.length} of {allProducts.length} items
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
                    {scannerMode === 'barcode'
                      ? 'Scan with a connected USB or Bluetooth barcode reader'
                      : 'Scan customer or item QR code'}
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

            {scannerMode === 'barcode' ? (
              <p className="rounded-xl bg-surface-container px-3 py-3 font-caption text-caption text-text-secondary">
                Scan with a connected USB or Bluetooth barcode reader. The reader types the code here and submits it
                with Enter.
              </p>
            ) : (
              <div className="relative w-full h-48 rounded-2xl bg-black/90 overflow-hidden flex items-center justify-center border-2 border-primary/50 shadow-inner">
                <span className="font-caption text-caption text-white/80 bg-black/60 px-3 py-1 rounded-full z-10">
                  Enter a QR value below to search
                </span>
              </div>
            )}

            {/* Quick simulate tap for testing (demo only) */}
            {!live && (
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
            )}

            {/* Manual entry fallback */}
            <form onSubmit={handleManualScanSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={manualSku}
                onChange={(e) => setManualSku(e.target.value)}
                autoFocus={scannerMode === 'barcode'}
                placeholder={scannerMode === 'barcode' ? 'Scan or enter product barcode…' : 'Enter QR value or item name…'}
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

      {/* Mobile Cash Drawer Float Modal */}
      {drawerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-surface-canvas rounded-2xl p-5 shadow-2xl border border-border-subtle flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="point_of_sale" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-[15px] font-bold text-text-primary">
                    {live ? (pos.isOpen ? 'Cash Drawer Details' : 'Set Cash Drawer Float') : 'Cash Drawer Details'}
                  </h3>
                  <span className="font-caption text-[11px] text-text-secondary">
                    {live ? (pos.isOpen ? `${pos.tillName} · Shift Active` : 'Count physical cash before selling') : 'Shift #0842 · Morning'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {pos.isOpen || !live ? (
              <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5">
                  <Icon name="payments" className="text-primary text-[18px]" />
                  <span className="text-text-secondary">Current Money in Drawer:</span>
                </div>
                <strong className="text-text-primary font-bold">
                  ₦{expectedCashInDrawer.toLocaleString()}
                </strong>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-tint-blue border border-primary/20 text-[11px] text-primary space-y-0.5">
                <p className="font-semibold flex items-center gap-1 text-[12px]">
                  <Icon name="info" className="text-[15px]" />
                  <span>Initial Cash Drawer Float</span>
                </p>
                <p className="text-text-secondary leading-tight">
                  The cash drawer float has not been set. Count the physical cash in your drawer and enter your starting float before ringing up sales.
                </p>
              </div>
            )}

            {live && pos.isOpen && (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-surface-subtle border border-border-subtle">
                  <span className="block text-text-secondary">Recorded by</span>
                  <strong className="text-text-primary">{pos.cashierName || 'Signed-in cashier'}</strong>
                </div>
                <div className="p-2 rounded-xl bg-surface-subtle border border-border-subtle">
                  <span className="block text-text-secondary">Opened at</span>
                  <strong className="text-text-primary">{drawerDateTime(pos.session?.openedAt)}</strong>
                </div>
              </div>
            )}

            {live && (
              <div className="rounded-xl border border-border-subtle overflow-hidden">
                <div className="px-2.5 py-1.5 bg-surface-container-low flex items-center justify-between">
                  <span className="font-semibold text-text-primary">Drawer records</span>
                  <span className="text-[10px] text-text-secondary">Newest first</span>
                </div>
                <div className="max-h-32 overflow-y-auto divide-y divide-border-subtle">
                  {drawerHistory.data?.length ? (
                    drawerHistory.data.map((record) => (
                      <div key={record.id} className="px-2.5 py-1.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block text-[11px] text-text-primary font-medium">
                            {record.cashierName} · {drawerDateTime(record.openedAt)}
                          </span>
                          <span className="block text-[10px] text-text-secondary">
                            Opened {drawerMoney(record.openingCash)} · Closed {record.countedCash != null ? drawerMoney(record.countedCash) : 'Not counted'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold ${record.status === 'open' ? 'text-primary' : 'text-text-secondary'}`}>
                          {record.status === 'open' ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="px-2.5 py-2 text-[11px] text-text-secondary">
                      {drawerHistory.isLoading ? 'Loading drawer records…' : 'No drawer records yet.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(!pos.isOpen && live) && (
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-[11px] font-semibold text-text-primary">
                  Starting Cash Drawer Float (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[14px] font-bold text-text-secondary">₦</span>
                  <input
                    type="text"
                    value={floatInput}
                    onChange={(e) => setFloatInput(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full h-10 pl-7 pr-3 rounded-xl border border-border-subtle text-[14px] font-bold bg-surface-subtle text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="font-caption text-[10px] text-text-tertiary">
                  Verify currency notes and coins physically inside your till.
                </p>
              </div>
            )}

            {(pos.isOpen && live) && (
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-[11px] font-semibold text-text-primary">
                  Closing Cash Count (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[14px] font-bold text-text-secondary">₦</span>
                  <input
                    type="text"
                    value={closingCashInput}
                    onChange={(e) => setClosingCashInput(e.target.value)}
                    placeholder={expectedCashInDrawer.toLocaleString()}
                    className="w-full h-10 pl-7 pr-3 rounded-xl border border-border-subtle text-[14px] font-bold bg-surface-subtle text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="font-caption text-[10px] text-text-tertiary">
                  Count the drawer before closing. The count, recorder and time are saved.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDrawerModalOpen(false)}
                className="h-10 rounded-xl bg-surface-container text-text-secondary text-[12px] font-semibold"
              >
                Close
              </button>
              {(!pos.isOpen && live) ? (
                <button
                  type="button"
                  onClick={() => void handleConfirmFloat()}
                  disabled={openingBusy}
                  className="h-10 rounded-xl bg-primary text-on-primary text-[12px] font-semibold flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                >
                  <Icon name="check" className="text-[16px]" />
                  <span>{openingBusy ? 'Opening…' : 'Confirm & Open'}</span>
                </button>
              ) : pos.isOpen && live ? (
                <button
                  type="button"
                  onClick={() => void handleRecordClosing()}
                  disabled={closingBusy}
                  className="h-10 rounded-xl bg-primary text-on-primary text-[12px] font-semibold flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                >
                  <Icon name="check" className="text-[16px]" />
                  <span>{closingBusy ? 'Saving…' : 'Record Closing Count'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDrawerModalOpen(false)}
                  className="h-10 rounded-xl bg-primary text-on-primary text-[12px] font-semibold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Icon name="check" className="text-[16px]" />
                  <span>Done</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
