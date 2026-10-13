import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBusinessBranch } from '../context/BusinessBranchContext';

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
}: BusinessPosHomeScreenProps) {
  const { branch } = useBusinessBranch();
  const [offline, setOffline] = useState(initialOffline);
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
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const toggleOffline = () => {
    setOffline((prev) => {
      showToast(prev ? 'Back online — syncing queued sales' : 'Offline mode enabled for this register');
      return !prev;
    });
  };

  const onNav = (key: (typeof NAV_ITEMS)[number]['key']) => {
    if (key === 'register') {
      if (offline) showToast('Register already open');
      else onNewSale();
      return;
    }
    if (key === 'orders') onOpenOrders();
    else if (key === 'customers') onOpenCustomers();
    else if (key === 'drawer') showToast('Cash drawer opened · ₦45,000 float');
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
                    4 orders queued
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
                    <span className="font-label-sm text-label-sm text-on-surface truncate">Urban Grill &amp; Bistro</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {branch.area} · Till 01 · Emeka O.
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
                      4 sales · 12 items · last sync 18m ago
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Connection still unavailable — will retry')}
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
                onClick={onNewSale}
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
                onClick={onNewSale}
              />
              <ControlRow
                icon="pause_circle"
                title="Held Tickets"
                meta="2 tickets held on this device"
                trailing={<span className="font-caption text-caption text-primary">2</span>}
                onClick={() => showToast('2 held tickets loaded from device cache')}
              />
              <ControlRow
                icon="barcode_scanning"
                title="Manual Barcode Entry"
                meta="Type SKU when scanner is unavailable"
                trailing={<Icon name="chevron_right" className="text-[18px]" />}
                onClick={() => showToast('Manual entry keypad opened')}
              />
              <ControlRow
                icon="database"
                title="Local Buffer & Queue"
                meta="5 pending sales · ₦68,450 unsynced"
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
              <StatTile label="Offline Sales" value="₦86,400" sub="Unsynced" />
              <StatTile label="Orders" value="17" sub="On device" />
              <StatTile label="Cash Drawer" value="₦45,000" />
              <StatTile label="Held Tickets" value="2" />
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
                meta="80mm thermal · paper ok"
                trailing={<span className="font-caption text-caption text-badge-discount-text">Ready</span>}
                onClick={() => showToast('Test receipt printed')}
              />
              <ControlRow
                icon="credit_card"
                title="Card Terminal"
                meta="Terminal 01 · battery 62%"
                trailing={<span className="font-caption text-caption text-badge-discount-text">Paired</span>}
                onClick={() => showToast('Card terminal re-pairing queued')}
              />
              <ControlRow
                icon="inventory_2"
                title="Cash Drawer"
                meta="Closed · ₦45,000 float"
                trailing={<span className="font-caption text-caption text-text-secondary">Idle</span>}
                onClick={() => showToast('Cash drawer opened')}
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
                    <span className="font-label-sm text-label-sm text-on-surface truncate">Urban Grill &amp; Bistro</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {branch.area} · Till 01 · Emeka O. (Cashier)
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
                  All sales synced
                </span>
                <span className="font-caption text-caption text-badge-discount-text ml-auto">2m ago</span>
                <Icon name="chevron_right" className="text-badge-discount-text text-[16px]" />
              </button>
              <div className="bg-surface-container-low rounded-xl px-space-sm py-space-xs flex items-center gap-space-xs">
                <Icon name="verified_user" className="text-primary text-[17px]" />
                <span className="font-caption text-caption text-text-secondary">
                  Offline protection ready · last backup 09:42
                </span>
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
                onClick={onNewSale}
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
              <StatTile label="Net Sales" value="₦271,450" sub="+12% vs yesterday" />
              <StatTile label="Orders" value="68" />
              <StatTile label="Avg Ticket" value="₦3,992" />
              <StatTile label="Tips" value="₦12,350" />
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
                meta={`Active: ${branch.shortName} · Till 01`}
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
                meta="80mm thermal · connected"
                trailing={<span className="font-caption text-caption text-badge-discount-text">Ready</span>}
                onClick={() => showToast('Test receipt printed')}
              />
              <ControlRow
                icon="inventory_2"
                title="Cash Drawer"
                meta="Closed · ₦45,000 float"
                trailing={<span className="font-caption text-caption text-text-secondary">Idle</span>}
                onClick={() => showToast('Cash drawer opened')}
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
