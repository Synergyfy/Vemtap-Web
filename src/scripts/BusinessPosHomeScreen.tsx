import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { apiErrorMessage } from '../services/errorMessages';
import { formatRelativeTime } from '../utils/format';
import { naira, useLivePos } from './posLive';

interface BusinessPosHomeScreenProps {
  initialOffline?: boolean;
  onNewSale: () => void;
  onOpenOrders: () => void;
  onOpenLedger: () => void;
  onOpenCustomers: () => void;
  onOpenProducts: () => void;
  onSwitchTill: () => void;
  onOpenDisplay: () => void;
  onNavMore: () => void;
  onOpenQueue?: () => void;
  onOpenSync?: () => void;
  onOpenSettings?: () => void;
  onOpenKitchen?: () => void;
  /** BUG-016: cashier lookup by QR / order number / phone. */
  onOpenOrderLookup?: () => void;
}

const NAV_ITEMS = [
  { key: 'register', icon: 'point_of_sale', label: 'Register' },
  { key: 'orders', icon: 'receipt_long', label: 'Orders' },
  { key: 'customers', icon: 'group', label: 'Customers' },
  { key: 'drawer', icon: 'inventory_2', label: 'Drawer' },
  { key: 'more', icon: 'more_horiz', label: 'More' },
] as const;

const NAV_PILL = 'bg-surface-tint-blue text-primary';

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface-canvas rounded-xl p-space-xs shadow-sm flex flex-col gap-0.5 min-w-0">
      <span className="font-caption text-caption text-text-secondary uppercase tracking-wide truncate">{label}</span>
      <span className="font-heading-md text-heading-md text-on-surface tracking-tight truncate">{value}</span>
      {sub && <span className="font-caption text-caption text-badge-discount-text truncate">{sub}</span>}
    </div>
  );
}

function ControlRow({
  icon,
  title,
  meta,
  trailing,
  onClick,
}: {
  icon: string;
  title: string;
  meta: string;
  trailing: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-space-xs px-space-xs py-space-xs rounded-xl hover:bg-surface-container-low transition-colors text-left"
    >
      <div className="flex items-center gap-space-xs min-w-0">
        <span className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
          <Icon name={icon} className="text-primary text-[17px]" />
        </span>
        <span className="flex flex-col min-w-0">
          <span className="font-label-sm text-label-sm text-on-surface truncate">{title}</span>
          <span className="font-caption text-caption text-text-secondary truncate">{meta}</span>
        </span>
      </div>
      <span className="flex items-center gap-space-2xs shrink-0 text-text-secondary">{trailing}</span>
    </button>
  );
}

export function BusinessPosHomeScreen({
  initialOffline = false,
  onNewSale,
  onOpenOrders,
  onOpenLedger,
  onOpenCustomers,
  onOpenProducts,
  onSwitchTill,
  onOpenDisplay,
  onNavMore,
  onOpenQueue,
  onOpenSync,
  onOpenSettings,
  onOpenKitchen,
  onOpenOrderLookup,
}: BusinessPosHomeScreenProps) {
  const { branch } = useBusinessBranch();
  const pos = useLivePos();
  const live = pos.live;
  const [demoOffline, setOffline] = useState(initialOffline);
  // Live: offline follows the real connection, not a toggle.
  const offline = live ? !pos.offline.isOnline : demoOffline;
  const pending = pos.offline.queue.filter((order) => !order.syncedAt);
  const pendingTotal = pending.reduce((sum, order) => sum + order.total, 0);
  const lastSync = pos.offline.lastSyncedAt ? formatRelativeTime(new Date(pos.offline.lastSyncedAt).toISOString()) : 'never';
  const expectedCash = pos.zReport?.expectedCash != null ? Number(pos.zReport.expectedCash) : null;
  const identity = live
    ? `${branch.area || branch.name} · ${pos.isOpen ? pos.tillName : 'No till open'} · ${pos.cashierName}`
    : null;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Shift & Cash Drawer State
  const [registerOpen, setRegisterOpen] = useState(true);
  const [openingFloat, setOpeningFloat] = useState(50000);
  const cashSales = 92400;
  const cardSales = 179050;
  const safeDrops = 0;
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [closeRegisterModal, setCloseRegisterModal] = useState(false);
  const [openFloatInput, setOpenFloatInput] = useState('50,000');
  const [countedCashInput, setCountedCashInput] = useState('142,400');
  const [closeNotes, setCloseNotes] = useState('');
  const [lastZReport, setLastZReport] = useState<string | null>(null);

  const expectedCashInDrawer = openingFloat + cashSales - safeDrops;

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

  useEffect(() => {
    if (pos.error) showToast(apiErrorMessage(pos.error, 'Could not load the register.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.error]);

  /** Live: a sale needs an open register on a till. */
  const startSale = () => {
    if (live && !pos.isOpen) {
      showToast('Open a till first — pick one in Switch Branch & Till.');
      onSwitchTill();
      return;
    }
    onNewSale();
  };

  /** Live: the drawer button closes the open register (end of shift). */
  const closeDrawer = () => {
    if (!pos.isOpen) {
      showToast('No register is open. Open a till from Switch Branch & Till.');
      return;
    }
    if (!window.confirm(`Close the register on ${pos.tillName} and end this shift?`)) return;
    pos.mutations.closeRegister.mutate(
      {},
      {
        onSuccess: (session) =>
          showToast(`Register closed · ${naira(Number(session.totalSales) || 0)} in ${session.transactionCount ?? 0} sales`),
        onError: (error) => showToast(apiErrorMessage(error, 'Could not close the register.')),
      },
    );
  };

  const hardwareSoon = () => showToast('Hardware status is coming soon.');

  const toggleOffline = () => {
    if (live) {
      showToast(offline ? 'Offline — sales are saved here and sync when you reconnect.' : 'Offline mode turns on by itself if the connection drops.');
      return;
    }
    setOffline((prev) => {
      showToast(prev ? 'Back online — syncing queued sales' : 'Offline mode enabled for this register');
      return !prev;
    });
  };

  const onNav = (key: (typeof NAV_ITEMS)[number]['key']) => {
    if (key === 'register') {
      if (offline && !live) showToast('Register already open');
      else startSale();
      return;
    }
    if (key === 'orders') onOpenOrders();
    else if (key === 'customers') onOpenCustomers();
    else if (key === 'drawer') {
      if (live) closeDrawer();
      else showToast('Cash drawer opened · ₦45,000 float');
    }
    else onNavMore();
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="px-margin pt-space-xs pb-space-2xs flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)]">
              <Icon name="point_of_sale" className="text-on-primary text-[19px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-primary uppercase tracking-wide font-semibold leading-none">
                VEMTAP POS
              </span>
              <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
                {branch.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              type="button"
              aria-label={offline ? 'Go back online' : 'Simulate offline mode'}
              onClick={toggleOffline}
              className={`h-7 px-space-xs rounded-full flex items-center gap-1 active:scale-95 transition-transform ${
                offline ? 'bg-error-container text-on-error-container' : 'bg-surface-tint-blue text-primary'
              }`}
            >
              <Icon name={offline ? 'cloud_off' : 'wifi'} className="text-[14px]" />
              <span className="font-caption text-caption font-semibold">{offline ? 'Offline' : 'Online'}</span>
            </button>
            <button
              type="button"
              aria-label="Register settings"
              onClick={onOpenSettings ?? (() => showToast('Register settings opened'))}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-transform"
            >
              <Icon name="tune" className="text-on-surface-variant text-[16px]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col pb-24">
        {offline ? (
          <>
            {/* Offline banner */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <div className="bg-error-container rounded-xl p-space-sm shadow-sm flex items-start gap-space-xs">
                <span className="w-9 h-9 rounded-full bg-error flex items-center justify-center shrink-0">
                  <Icon name="cloud_off" filled className="text-on-error text-[18px]" />
                </span>
                <div className="flex flex-col min-w-0 gap-0.5">
                  <span className="font-label-md text-label-md text-on-error-container font-semibold">
                    Offline Mode Active
                  </span>
                  <span className="font-caption text-caption text-on-error-container">
                    Sales are stored on this device and will sync automatically once you reconnect.
                  </span>
                  <span className="mt-1 self-start bg-error text-on-error font-caption text-caption px-space-xs py-0.5 rounded-full">
                    {live ? `${pending.length} orders queued` : '4 orders queued'}
                  </span>
                </div>
              </div>
            </div>

            {/* Store identity */}
            <div className="px-margin py-space-2xs">
              <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center shrink-0">
                    <Icon name="storefront" className="text-primary text-[20px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{live ? pos.businessName : 'Urban Grill & Bistro'}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {identity ?? `${branch.area} · Till 01 · Emeka O.`}
                    </span>
                  </div>
                </div>
                <span className="bg-error-container text-on-error-container font-caption text-caption px-space-xs py-0.5 rounded-full shrink-0">
                  No signal
                </span>
              </div>
            </div>

            {/* Sync pending */}
            <div className="px-margin py-space-2xs">
              <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center shrink-0">
                    <Icon name="sync_problem" className="text-tertiary text-[17px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface">Sync pending</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {live ? `${pending.length} sales · last sync ${lastSync}` : '4 sales · 12 items · last sync 18m ago'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!live) {
                      showToast('Connection still unavailable — will retry');
                      return;
                    }
                    void pos.offline.syncNow().then(() => showToast(pos.offline.isOnline ? 'Sync finished' : 'Still offline — will retry'));
                  }}
                  className="h-8 px-space-xs rounded-lg bg-surface-canvas border border-border-subtle font-caption text-caption text-on-surface active:scale-95 transition-transform shrink-0"
                >
                  Retry
                </button>
              </div>
            </div>

            {/* Offline actions */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Offline Actions
              </span>
            </div>
            <div className="px-margin flex flex-col gap-space-xs pb-space-xs">
              <button
                type="button"
                onClick={startSale}
                className="w-full h-11 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
              >
                <Icon name="add_shopping_cart" className="text-[17px]" />
                <span>New Sale (Cached Menu)</span>
              </button>
              <ControlRow
                icon="payments"
                title="Cash Sale"
                meta="Ring up and store locally"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={startSale}
              />
              <ControlRow
                icon="pause_circle"
                title="Held Tickets"
                meta={live ? `${pos.heldCount} tickets held` : '2 tickets held on this device'}
                trailing={<span className="font-caption text-caption text-primary">{live ? pos.heldCount : 2}</span>}
                onClick={() => (live ? startSale() : showToast('2 held tickets loaded from device cache'))}
              />
              <ControlRow
                icon="barcode_scanning"
                title="Manual Barcode Entry"
                meta="Type SKU when scanner is unavailable"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={() => showToast('Manual entry keypad opened')}
              />
              <ControlRow
                icon="qr_code_scanner"
                title="Find Customer Order"
                meta="QR scan • order number • phone"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={onOpenOrderLookup ?? (() => showToast('Order lookup opened'))}
              />
              <ControlRow
                icon="database"
                title="Local Buffer & Queue"
                meta={live ? `${pending.length} pending sales · ${naira(pendingTotal)} unsynced` : '5 pending sales · ₦68,450 unsynced'}
                trailing={<span className="font-caption text-caption text-primary">View</span>}
                onClick={onOpenQueue ?? (() => showToast('Local queue opened'))}
              />
              <ControlRow
                icon="soup_kitchen"
                title="Live Kitchen Stream"
                meta="Incoming Public POS tickets"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={onOpenKitchen ?? (() => showToast('Kitchen stream opened'))}
              />
            </div>

            {/* Local tally */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Today&apos;s Local Tally
              </span>
            </div>
            <div className="px-margin grid grid-cols-2 gap-space-xs pb-space-xs">
              <StatTile label="Offline Sales" value={live ? naira(pendingTotal) : '₦86,400'} sub="Unsynced" />
              <StatTile label="Orders" value={live ? String(pending.length) : '17'} sub="On device" />
              <StatTile label="Cash Drawer" value={live ? naira(expectedCash) : '₦45,000'} />
              <StatTile label="Held Tickets" value={live ? String(pos.heldCount) : '2'} />
            </div>

            {/* Hardware health */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Hardware Health
              </span>
            </div>
            <div className="px-margin flex flex-col gap-space-2xs pb-space-sm">
              <ControlRow
                icon="print"
                title="Receipt Printer"
                meta={live ? '—' : '80mm thermal · paper ok'}
                trailing={<span className="font-caption text-caption text-badge-discount-text">{live ? '' : 'Ready'}</span>}
                onClick={live ? hardwareSoon : () => showToast('Test receipt printed')}
              />
              <ControlRow
                icon="credit_card"
                title="Card Terminal"
                meta={live ? '—' : 'Terminal 01 · battery 62%'}
                trailing={<span className="font-caption text-caption text-badge-discount-text">{live ? '' : 'Paired'}</span>}
                onClick={live ? hardwareSoon : () => showToast('Card terminal re-pairing queued')}
              />
              <ControlRow
                icon="inventory_2"
                title="Cash Drawer"
                meta={
                  live
                    ? pos.isOpen
                      ? `Open on ${pos.tillName} · ${naira(expectedCash)} expected`
                      : 'No register open'
                    : 'Closed · ₦45,000 float'
                }
                trailing={
                  <span className="font-caption text-caption text-text-secondary">{live ? (pos.isOpen ? 'Close' : 'Closed') : 'Idle'}</span>
                }
                onClick={live ? closeDrawer : () => showToast('Cash drawer opened')}
              />
            </div>
          </>
        ) : (
          <>
            {/* Store + staff identity */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <Icon name="restaurant" className="text-on-primary text-[20px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{live ? pos.businessName : 'Urban Grill & Bistro'}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {identity ?? `${branch.area} · Till 01 · Emeka O. (Cashier)`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSwitchTill}
                  className="h-8 px-space-xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                >
                  <Icon name="swap_horiz" className="text-[14px]" />
                  <span>Switch</span>
                </button>
              </div>
            </div>

            {/* Sync status deck */}
            <div className="px-margin flex flex-col gap-space-2xs pb-space-xs">
              <button
                type="button"
                onClick={onOpenSync ?? (() => showToast('Sync centre opened'))}
                className="bg-badge-discount-bg rounded-xl px-space-sm py-space-xs flex items-center gap-space-xs text-left active:scale-[0.99] transition-transform w-full"
              >
                <Icon name="cloud_done" filled className="text-badge-discount-text text-[18px]" />
                <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                  {live && pending.length ? `${pending.length} sales waiting to sync` : 'All sales synced'}
                </span>
                <span className="font-caption text-caption text-badge-discount-text ml-auto">{live ? lastSync : '2m ago'}</span>
                <Icon name="chevron_right" className="text-badge-discount-text text-[16px]" />
              </button>
              <div className="bg-surface-container-low rounded-xl px-space-sm py-space-xs flex items-center gap-space-xs">
                <Icon name="verified_user" className="text-primary text-[17px]" />
                <span className="font-caption text-caption text-text-secondary">
                  {live ? 'Offline protection ready' : 'Offline protection ready · last backup 09:42'}
                </span>
              </div>
            </div>

            {/* Shift & Cash Drawer Control — Start / End Day */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <div className="bg-surface-canvas rounded-2xl p-3.5 shadow-sm border border-border-subtle/50 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${registerOpen ? 'bg-badge-discount-text animate-pulse' : 'bg-outline-variant'}`} />
                    <span className="font-label-sm text-[13px] font-bold text-text-primary">
                      {registerOpen ? 'Register Open · Active Shift' : 'Register Closed (Day Ended)'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${registerOpen ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'}`}>
                    {registerOpen ? 'Shift #0842' : 'Closed'}
                  </span>
                </div>

                {registerOpen ? (
                  <>
                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-surface-subtle text-center">
                      <div className="flex flex-col">
                        <span className="font-caption text-[10px] text-text-secondary">Starting Float</span>
                        <span className="font-label-sm text-[12px] font-bold text-text-primary">₦{openingFloat.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col border-x border-border-subtle/50">
                        <span className="font-caption text-[10px] text-text-secondary">Cash Sales</span>
                        <span className="font-label-sm text-[12px] font-bold text-primary">+₦{cashSales.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-caption text-[10px] text-text-secondary">Expected Drawer</span>
                        <span className="font-label-sm text-[12px] font-bold text-badge-discount-text">₦{expectedCashInDrawer.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-secondary px-1">
                      <span>Card / Transfer: <strong>₦{cardSales.toLocaleString()}</strong></span>
                      <span>Variance: <strong className="text-badge-discount-text">₦0.00 (Balanced)</strong></span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => showToast('Cash drawer opened · ₦45,000 counted')}
                        className="h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-[12px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <Icon name="lock_open" className="text-[16px]" />
                        <span>Pop Drawer (Float)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCloseRegisterModal(true)}
                        className="h-9 rounded-xl bg-error-container hover:bg-error/20 text-on-error-container font-label-sm text-[12px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <Icon name="lock" className="text-[16px]" />
                        <span>Close Register (End Day)</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 py-1">
                    <p className="font-caption text-[11px] text-text-secondary leading-relaxed">
                      Register is closed for this till. Count and record your opening drawer cash float to start a new shift.
                    </p>
                    {lastZReport && (
                      <span className="font-caption text-[10px] text-badge-discount-text font-medium">
                        {lastZReport}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenRegisterModal(true)}
                      className="w-full h-10 rounded-xl bg-primary text-on-primary font-label-sm text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Icon name="point_of_sale" className="text-[18px]" />
                      <span>Open Register &amp; Start Shift</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Quick Actions
              </span>
            </div>
            <div className="px-margin grid grid-cols-2 gap-space-xs pb-space-xs">
              <button
                type="button"
                onClick={startSale}
                className="h-14 rounded-xl bg-primary-container text-on-primary shadow-md flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] transition-all"
              >
                <Icon name="add_shopping_cart" className="text-[20px]" />
                <span className="font-label-sm text-label-sm font-semibold">New Sale</span>
              </button>
              <button
                type="button"
                onClick={onOpenLedger}
                className="h-14 rounded-xl bg-surface-canvas shadow-sm border border-border-subtle flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] transition-all"
              >
                <Icon name="receipt_long" className="text-primary text-[20px]" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Transactions</span>
              </button>
              <button
                type="button"
                onClick={onOpenCustomers}
                className="h-14 rounded-xl bg-surface-canvas shadow-sm border border-border-subtle flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] transition-all"
              >
                <Icon name="group" className="text-primary text-[20px]" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Customers</span>
              </button>
              <button
                type="button"
                onClick={onOpenProducts}
                className="h-14 rounded-xl bg-surface-canvas shadow-sm border border-border-subtle flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] transition-all"
              >
                <Icon name="inventory_2" className="text-primary text-[20px]" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Products</span>
              </button>
            </div>

            {/* Today's summary */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Today&apos;s Summary
              </span>
            </div>
            <div className="px-margin grid grid-cols-2 gap-space-xs pb-space-xs">
              <StatTile label="Net Sales" value={live ? naira(pos.todaySales) : '₦271,450'} sub={live ? undefined : '+12% vs yesterday'} />
              <StatTile label="Orders" value={live ? String(pos.todayCount) : '68'} />
              <StatTile label="Avg Ticket" value={live ? naira(pos.averageTicket) : '₦3,992'} />
              <StatTile label="Tips" value={live ? '—' : '₦12,350'} />
            </div>

            {/* Register controls */}
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Register Controls
              </span>
            </div>
            <div className="px-margin flex flex-col gap-space-2xs pb-space-sm">
              <ControlRow
                icon="contactless"
                title="Customer Display Mode"
                meta="Hand the screen to your guest"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={onOpenDisplay}
              />
              <ControlRow
                icon="swap_horiz"
                title="Switch Branch & Till"
                meta={`Active: ${branch.shortName} · ${live ? pos.tillName : 'Till 01'}`}
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={onSwitchTill}
              />
              <ControlRow
                icon="soup_kitchen"
                title="Live Kitchen Stream"
                meta="New tickets, prep progress & pickup alerts"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={onOpenKitchen ?? (() => showToast('Kitchen stream opened'))}
              />
              <ControlRow
                icon="print"
                title="Receipt Printer"
                meta={live ? '—' : '80mm thermal · connected'}
                trailing={<span className="font-caption text-caption text-badge-discount-text">{live ? '' : 'Ready'}</span>}
                onClick={live ? hardwareSoon : () => showToast('Test receipt printed')}
              />
              <ControlRow
                icon="inventory_2"
                title="Cash Drawer"
                meta={
                  live
                    ? pos.isOpen
                      ? `Open on ${pos.tillName} · ${naira(expectedCash)} expected`
                      : 'No register open'
                    : 'Closed · ₦45,000 float'
                }
                trailing={
                  <span className="font-caption text-caption text-text-secondary">{live ? (pos.isOpen ? 'Close' : 'Closed') : 'Idle'}</span>
                }
                onClick={live ? closeDrawer : () => showToast('Cash drawer opened')}
              />
            </div>
          </>
        )}
      </div>

      {/* POS bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center h-16 px-space-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === 'register';
            return (
              <button
                key={item.key}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNav(item.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                  isActive ? NAV_PILL + ' mx-1 rounded-xl py-1' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} className="text-[21px]" filled={isActive} />
                <span className="font-caption text-caption leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Open Register Modal */}
      {openRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm bg-surface-canvas rounded-2xl p-4 shadow-2xl border border-border-subtle flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="point_of_sale" className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-label-sm text-[14px] font-bold text-text-primary">Open Register &amp; Start Shift</h3>
                  <span className="font-caption text-[11px] text-text-secondary">Wuse II • Till 01</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenRegisterModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-caption text-[11px] text-text-secondary">Opening Cash Drawer Float (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[14px] font-bold text-text-secondary">₦</span>
                <input
                  type="text"
                  value={openFloatInput}
                  onChange={(e) => setOpenFloatInput(e.target.value)}
                  placeholder="50,000"
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-border-subtle text-[14px] font-bold bg-surface-subtle text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <p className="font-caption text-[10px] text-text-tertiary">
                Count notes and coins in the physical drawer before starting sales.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-1 text-[11px] text-text-secondary">
              <div className="flex justify-between">
                <span>Cashier On Duty:</span>
                <strong className="text-text-primary">Emeka O.</strong>
              </div>
              <div className="flex justify-between">
                <span>Shift Start Time:</span>
                <strong className="text-text-primary">Just now</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpenRegisterModal(false)}
                className="h-10 rounded-xl bg-surface-container text-text-secondary text-[12px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleaned = Number(openFloatInput.replace(/[^\d]/g, '') || 50000);
                  setOpeningFloat(cleaned);
                  setRegisterOpen(true);
                  setOpenRegisterModal(false);
                  showToast(`Shift started! Opening float: ₦${cleaned.toLocaleString()}`);
                }}
                className="h-10 rounded-xl bg-primary text-on-primary text-[12px] font-semibold flex items-center justify-center gap-1 shadow-sm"
              >
                <Icon name="check" className="text-[16px]" />
                <span>Confirm &amp; Start</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Register / End Day Modal */}
      {closeRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm bg-surface-canvas rounded-2xl p-4 shadow-2xl border border-border-subtle flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
                  <Icon name="lock" className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-label-sm text-[14px] font-bold text-text-primary">Close Register (End Shift)</h3>
                  <span className="font-caption text-[11px] text-text-secondary">Shift #0842 • Wuse II Till 01</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCloseRegisterModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Reconciliation breakdown */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-surface-subtle text-[11px]">
              <div className="flex justify-between">
                <span className="text-text-secondary">Opening Float (Started with):</span>
                <strong className="text-text-primary">₦{openingFloat.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Cash Sales Collected:</span>
                <strong className="text-primary">+₦{cashSales.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Card / POS &amp; Transfer:</span>
                <strong className="text-text-primary">₦{cardSales.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-border-subtle/50 font-bold">
                <span className="text-text-primary">Expected Cash in Drawer:</span>
                <span className="text-badge-discount-text">₦{expectedCashInDrawer.toLocaleString()}</span>
              </div>
            </div>

            {/* Counted Cash Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-caption text-[11px] font-semibold text-text-primary">
                Actual Cash Counted in Drawer (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[14px] font-bold text-text-secondary">₦</span>
                <input
                  type="text"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  placeholder="142,400"
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-border-subtle text-[14px] font-bold bg-surface-canvas text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Variance badge */}
              {(() => {
                const counted = Number(countedCashInput.replace(/[^\d]/g, '') || 0);
                const diff = counted - expectedCashInDrawer;
                if (diff === 0) {
                  return (
                    <span className="font-caption text-[11px] font-semibold text-badge-discount-text flex items-center gap-1">
                      <Icon name="check_circle" className="text-[13px]" />
                      <span>Balanced: ₦0.00 Float Variance (Exact match)</span>
                    </span>
                  );
                } else if (diff > 0) {
                  return (
                    <span className="font-caption text-[11px] font-semibold text-primary flex items-center gap-1">
                      <Icon name="trending_up" className="text-[13px]" />
                      <span>Over by +₦{diff.toLocaleString()}</span>
                    </span>
                  );
                } else {
                  return (
                    <span className="font-caption text-[11px] font-semibold text-error flex items-center gap-1">
                      <Icon name="warning" className="text-[13px]" />
                      <span>Short by -₦{Math.abs(diff).toLocaleString()}</span>
                    </span>
                  );
                }
              })()}
            </div>

            <div>
              <label className="font-caption text-[10px] text-text-secondary block mb-0.5">Closing Shift Notes</label>
              <input
                type="text"
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="e.g. Verified by manager, cash dropped to safe"
                className="w-full h-8 px-2.5 rounded-lg border border-border-subtle text-[11px] bg-surface-canvas text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCloseRegisterModal(false)}
                className="h-10 rounded-xl bg-surface-container text-text-secondary text-[12px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const counted = Number(countedCashInput.replace(/[^\d]/g, '') || expectedCashInDrawer);
                  const diff = counted - expectedCashInDrawer;
                  const rep = `Shift #0842 closed. Started ₦${openingFloat.toLocaleString()} · Closed ₦${counted.toLocaleString()} (${diff === 0 ? 'Balanced' : diff > 0 ? `+₦${diff} Over` : `-₦${Math.abs(diff)} Short`})`;
                  setLastZReport(rep);
                  setRegisterOpen(false);
                  setCloseRegisterModal(false);
                  showToast('Register closed! Z-Report printed & synced to cloud.');
                }}
                className="h-10 rounded-xl bg-error-container text-on-error-container text-[12px] font-semibold flex items-center justify-center gap-1 shadow-sm"
              >
                <Icon name="check" className="text-[16px]" />
                <span>Confirm &amp; Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
