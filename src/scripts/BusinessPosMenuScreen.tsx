import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';

interface BusinessPosMenuScreenProps {
  /** Navigates to a POS / Store Front page (keys match the desktop sidebar config). */
  onOpenPage: (key: string) => void;
  onBack: () => void;
  onTab?: (tab: BusinessTabKey) => void;
}

interface PosRow {
  key: string;
  icon: string;
  title: string;
  sub: string;
  badge?: string;
  badgeClass?: string;
}

const POS_ROWS: PosRow[] = [
  { key: 'pos-home', icon: 'dashboard', title: 'POS Overview', sub: 'Today’s sales, till status & quick stats' },
  { key: 'pos-sale', icon: 'add_shopping_cart', title: 'New Sale', sub: 'Open the register and ring up a sale' },
  { key: 'orders-all', icon: 'receipt_long', title: 'Orders', sub: 'All dine-in, pickup & delivery tickets', badge: '4', badgeClass: 'bg-primary-container text-on-primary' },
  { key: 'orders-bookings', icon: 'calendar_month', title: 'Bookings', sub: 'Reservations & table assignments' },
  { key: 'pos-transactions', icon: 'receipt', title: 'Transactions', sub: 'Receipts, refunds & payment history' },
  { key: 'pos-sync', icon: 'sync', title: 'Offline & Sync', sub: 'Sell offline and sync when back online' },
  { key: 'pos-settings', icon: 'settings', title: 'POS Settings', sub: 'Business info, receipts, tax, alerts & loyalty' },
];

const STORE_FRONT_ROWS: PosRow[] = [
  { key: 'store-ordering-dashboard', icon: 'dashboard', title: 'Store Front Dashboard', sub: 'Live customer orders from QR & storefront', badge: 'Live', badgeClass: 'bg-badge-discount-bg text-badge-discount-text' },
  { key: 'store-ordering-qr', icon: 'qr_code_2', title: 'QR Codes & Placement', sub: 'Store, section, product & table codes' },
  { key: 'store-ordering-settings', icon: 'tune', title: 'Store Front Settings', sub: 'Pickup lead times, branch policies & rules' },
];

function PosMenuSection({
  label,
  badge,
  badgeClass,
  rows,
  onOpenPage,
}: {
  label: string;
  badge?: string;
  badgeClass?: string;
  rows: PosRow[];
  onOpenPage: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-space-xs px-1">
        <span className="font-label-md text-label-md text-text-primary font-semibold tracking-wide uppercase truncate">
          {label}
        </span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${badgeClass}`}>{badge}</span>
        )}
      </div>
      <div className="rounded-2xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden flex flex-col">
        {rows.map((row) => (
          <button
            key={row.key}
            className="w-full flex items-center gap-space-sm p-space-md text-left hover:bg-surface-subtle active:bg-surface-container-low transition-colors"
            type="button"
            onClick={() => onOpenPage(row.key)}
          >
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-surface-tint-blue text-primary">
              <Icon name={row.icon} className="text-[20px]" />
            </span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{row.title}</span>
                {row.badge && (
                  <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${row.badgeClass}`}>
                    {row.badge}
                  </span>
                )}
              </span>
              <span className="font-caption text-caption text-text-secondary truncate mt-0.5">{row.sub}</span>
            </span>
            <Icon name="chevron_right" className="text-[18px] text-outline-variant shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Mobile POS menu — the POS landing page opened from the Overview quick action.
 * Lists the same pages as the desktop POS side menu, grouped into
 * "Point of Sale" and "Store Front" (mirrors BUSINESS_SIDEBAR_SECTIONS).
 */
export function BusinessPosMenuScreen({ onOpenPage, onBack, onTab }: BusinessPosMenuScreenProps) {
  return (
    <div className="biz-flow">
      <AppScreen>
        <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-margin flex items-center gap-space-xs">
            <button
              aria-label="Back to overview"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface active:bg-surface-container-high transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate">Point of Sale</h1>
              <span className="font-caption text-caption text-on-surface-variant truncate">
                Register, orders &amp; store front
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-col w-full flex-1 pb-24">
          <div className="px-margin pt-space-sm space-y-space-lg pb-space-xl">
            <PosMenuSection
              label="Point of Sale"
              badge="Active"
              badgeClass="bg-badge-discount-bg text-badge-discount-text"
              rows={POS_ROWS}
              onOpenPage={onOpenPage}
            />
            <PosMenuSection
              label="Store Front"
              badge="Live"
              badgeClass="bg-badge-discount-bg text-badge-discount-text"
              rows={STORE_FRONT_ROWS}
              onOpenPage={onOpenPage}
            />
          </div>
        </div>

        {onTab && <BusinessTabBar active="overview" onTab={onTab} />}
      </AppScreen>
    </div>
  );
}
