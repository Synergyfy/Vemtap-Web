import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosHomeScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onNewSale: () => void;
  onOpenLedger: () => void;
  onOpenProducts: () => void;
  onOpenCustomers: () => void;
  onOpenKitchen: () => void;
  /** BUG-016: cashier lookup by QR / order number / phone. */
  onOpenOrderLookup?: () => void;
}

const HOTKEYS: Array<{ keys: string; label: string }> = [
  { keys: 'F1', label: 'New Sale' },
  { keys: 'F2', label: 'Ledger' },
  { keys: 'F3', label: "86'd Kitchen" },
  { keys: 'F4', label: 'Patron VIP' },
  { keys: 'SPACE', label: 'Quick Pay' },
  { keys: 'ESC', label: 'Void / Abort' },
];

const KITCHEN_QUEUE = [
  {
    id: '#143',
    table: 'Table 04 (4 Guests)',
    station: 'Grill Station',
    stationClass: 'bg-tertiary-fixed text-tertiary',
    items: '2x Charred Ribeye, 1x Pepper Soup, 2x Chapman',
    total: '₦14,800',
    time: '8m ago',
    timeClass: 'text-tertiary',
  },
  {
    id: '#144',
    table: 'Table 09 (Booth)',
    station: 'Fish Fryer',
    stationClass: 'bg-surface-container-high text-secondary',
    items: '1x Whole Tilapia, Plantain Fries, Star Lager',
    total: '₦11,200',
    time: '3m ago',
    timeClass: 'text-text-secondary',
  },
  {
    id: '#145',
    table: 'Takeaway #2',
    station: 'Assembly Line',
    stationClass: 'bg-surface-container text-text-primary',
    items: '3x Suya Burger Box, Spicy Yams, 3x Malta',
    total: '₦19,500',
    time: '1m ago',
    timeClass: 'text-badge-discount-text',
  },
];

const TENDER_ROWS = [
  { dot: 'bg-primary-container', label: 'Card / NFC', value: '₦214,000', meta: '62.4% • 94 txns' },
  { dot: 'bg-badge-discount-text', label: 'Cash Tender', value: '₦92,400', meta: '26.9% • 36 txns' },
  { dot: 'bg-secondary', label: 'VEMTAP Direct QR / NIP', value: '₦36,450', meta: '10.7% • 12 txns' },
];

const FLEET = [
  {
    icon: 'print',
    name: 'Sunmi V2 Kitchen Printer',
    meta: 'Cloud Thermal 80mm Roll',
    status: '82% Paper Ready',
  },
  {
    icon: 'contactless',
    name: 'Contactless NFC & Chip',
    meta: 'PAX A920 Pro Linked (EMV L2)',
    status: '100% Online • 98% Batt',
  },
  {
    icon: 'barcode_scanner',
    name: 'Optical Barcode Scanner',
    meta: 'Zebra 2D Imager Wired',
    status: 'Active & Ready',
  },
];

export function DesktopPosHomeScreen({
  onNav,
  onNewSale,
  onOpenLedger,
  onOpenProducts,
  onOpenCustomers,
  onOpenKitchen,
  onOpenOrderLookup,
}: DesktopPosHomeScreenProps) {
  const [drawerState, setDrawerState] = useState<'idle' | 'popping' | 'open'>('idle');
  const [kioskArmed, setKioskArmed] = useState(false);

  const popDrawer = () => {
    if (drawerState === 'popping') return;
    setDrawerState('popping');
    window.setTimeout(() => {
      setDrawerState('open');
      window.setTimeout(() => setDrawerState('idle'), 2000);
    }, 400);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        onNewSale();
      } else if (event.key === 'F2') {
        event.preventDefault();
        onOpenLedger();
      } else if (event.key === 'F3') {
        event.preventDefault();
        onOpenProducts();
      } else if (event.key === 'F4') {
        event.preventDefault();
        onOpenCustomers();
      } else if (event.key === 'F5') {
        event.preventDefault();
        popDrawer();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNewSale, onOpenLedger, onOpenProducts, onOpenCustomers]);

  const toggleKiosk = () => {
    if (kioskArmed) {
      setKioskArmed(false);
      return;
    }
    const pin = window.prompt('Enter Manager Override PIN to arm Kiosk Lock:');
    if (!pin || pin !== '1234') {
      window.alert('Invalid PIN. Self-Ordering Kiosk mode remains disabled.');
      return;
    }
    setKioskArmed(true);
    window.alert('Terminal locked to guest Self-Ordering Kiosk interface.');
  };

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Operational Hub Context Strip */}
      <section className="w-full py-space-md">
        <div className="w-full bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0 shadow-sm">
              <Icon name="restaurant" filled className="text-[28px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  Urban Grill & Bistro • Wuse II Flagship #01
                </span>
                <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                  Live Shift Online
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-1 text-text-secondary font-caption text-caption">
                <span className="font-medium text-text-primary flex items-center gap-1">
                  <Icon name="point_of_sale" className="text-[15px] text-primary" />
                  Terminal #01 Active
                </span>
                <span className="text-outline-variant">•</span>
                <span>
                  Cashier: <strong className="text-text-primary font-medium">Emeka Okafor</strong> (Shift ID: #SH-4092)
                </span>
                <span className="text-outline-variant">•</span>
                <span>Opened 08:30 AM Today (WAT)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs w-full xl:w-auto">
            <div className="flex items-center gap-2 px-space-sm py-2 rounded-lg bg-surface-container-low text-text-secondary font-caption text-caption">
              <Icon name="sync" className="text-[16px] text-primary-container" />
              <span>
                Shift Synced <strong className="text-text-primary font-medium">18ms</strong> (142 tickets ledgered)
              </span>
            </div>
            <div className="flex items-center gap-2 px-space-sm py-2 rounded-lg bg-surface-container-low text-text-secondary font-caption text-caption">
              <Icon name="shield" className="text-[16px] text-badge-discount-text" />
              <span>
                Offline Guard <strong className="text-text-primary font-medium">AES-256</strong> (500 tap/cash slots buffered)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Quick Launch Grid */}
      <section className="w-full pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* F1 Primary Card */}
          <div className="bg-primary-container rounded-xl p-space-lg text-on-primary flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-on-primary/10 blur-xl pointer-events-none" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="px-space-xs py-1 rounded bg-on-primary/20 text-on-primary font-label-sm text-label-sm font-bold tracking-wider">
                  F1 KEY
                </span>
                <Icon name="point_of_sale" className="text-on-primary text-[28px]" />
              </div>
              <span className="font-heading-md text-heading-md text-on-primary font-semibold tracking-tight">
                New Sale & Register
              </span>
              <p className="font-body-md text-body-md text-on-primary/80 mt-space-xs">
                Ring up counter orders, table guest tabs, bar tabs, and swift split-tender checkout.
              </p>
            </div>
            <div className="mt-space-lg pt-space-xs">
              <button
                type="button"
                onClick={onNewSale}
                className="w-full py-3 px-space-md rounded-lg bg-surface-canvas text-primary-container font-button-primary text-button-primary hover:bg-surface-subtle active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm font-semibold"
              >
                <span>Launch POS Terminal</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* F2 Shift Transactions */}
          <div className="bg-surface-canvas rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-bold text-text-secondary">
                  F2 KEY
                </span>
                <Icon name="receipt_long" className="text-text-tertiary text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Shift Transactions
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-hero text-display-hero text-text-primary tracking-tight font-bold">₦342,850</span>
              </div>
              <span className="inline-block mt-1 font-caption text-caption text-badge-discount-text font-medium bg-badge-discount-bg px-2 py-0.5 rounded-full">
                142 completed tickets
              </span>
            </div>
            <div className="mt-space-md pt-space-xs">
              <button
                type="button"
                onClick={onOpenLedger}
                className="font-button-secondary text-button-secondary text-primary hover:text-primary-container flex items-center gap-1 group font-medium"
              >
                <span>Review shift slips & audits</span>
                <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* F3 Catalog & 86'd Items */}
          <div className="bg-surface-canvas rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-bold text-text-secondary">
                  F3 KEY
                </span>
                <Icon name="menu_book" className="text-text-tertiary text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Catalog & 86'd Items
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-hero text-display-hero text-text-primary tracking-tight font-bold">184</span>
                <span className="font-label-md text-label-md text-text-secondary">Live</span>
                <span className="font-caption text-caption text-tertiary font-medium bg-tertiary-fixed px-2 py-0.5 rounded-full">
                  6 Low Stock
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1.5 leading-snug">
                2 kitchen items toggled 86'd (<strong className="text-tertiary font-medium">Oxtail</strong>,{' '}
                <strong className="text-tertiary font-medium">Tiger Prawns</strong>)
              </p>
            </div>
            <div className="mt-space-md pt-space-xs">
              <button
                type="button"
                onClick={onOpenProducts}
                className="font-button-secondary text-button-secondary text-primary hover:text-primary-container flex items-center gap-1 group font-medium"
              >
                <span>Manage 86'd & modifications</span>
                <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* F4 Patron Directory */}
          <div className="bg-surface-canvas rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-bold text-text-secondary">
                  F4 KEY
                </span>
                <Icon name="loyalty" className="text-text-tertiary text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Patron Directory
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-hero text-display-hero text-text-primary tracking-tight font-bold">2,490</span>
                <span className="font-label-md text-label-md text-text-secondary">VIPs</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1.5 leading-snug">
                18 loyalty discounts redeemed today (₦18,200 saved)
              </p>
            </div>
            <div className="mt-space-md pt-space-xs flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenCustomers}
                className="font-button-secondary text-button-secondary text-primary hover:text-primary-container flex items-center gap-1 group font-medium"
              >
                <span>Direct phone & rewards lookup</span>
                <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={onOpenOrderLookup ?? (() => onNav('orders'))}
                className="font-button-secondary text-button-secondary text-primary hover:text-primary-container flex items-center gap-1 group font-medium"
              >
                <span>Find customer order (QR / ref / phone)</span>
                <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Operations Command Grid */}
      <section className="w-full pb-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Financial Reconciliation */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold tracking-tight">
                    Financial Reconciliation
                  </span>
                  <span className="block font-caption text-caption text-text-secondary">
                    Today's Sales & Tender Distribution
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <Icon name="verified" className="text-[14px]" />
                  100% Audit Match
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-md bg-surface-subtle rounded-xl mb-space-md">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Gross Shift Volume</span>
                  <span className="font-heading-md text-heading-md text-text-primary font-bold mt-1">₦342,850</span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium mt-0.5">Net Realized</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Total Orders</span>
                  <span className="font-heading-md text-heading-md text-text-primary font-bold mt-1">142</span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">0 voids / 0 returns</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Avg Ticket Size</span>
                  <span className="font-heading-md text-heading-md text-text-primary font-bold mt-1">₦2,414</span>
                  <span className="font-caption text-caption text-primary font-medium mt-0.5">+4.2% vs Yesterday</span>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center text-caption font-caption text-text-secondary">
                  <span>Tender Share Breakdown</span>
                  <span className="font-medium text-text-primary">₦342,850 Settled</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden bg-surface-container flex">
                  <div className="h-full bg-primary-container" style={{ width: '62.4%' }} title="Card / NFC 62.4%" />
                  <div className="h-full bg-badge-discount-text" style={{ width: '26.9%' }} title="Cash Tender 26.9%" />
                  <div className="h-full bg-secondary" style={{ width: '10.7%' }} title="VEMTAP Direct QR & NIP 10.7%" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mt-space-sm pt-space-xs">
                  {TENDER_ROWS.map((row) => (
                    <div key={row.label} className="p-space-sm rounded-lg bg-surface-subtle flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                        <span className="font-label-sm text-label-sm font-semibold text-text-primary">{row.label}</span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-text-primary">{row.value}</span>
                      <span className="font-caption text-caption text-text-tertiary">{row.meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Kitchen Queue */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold tracking-tight">
                    Live Kitchen Queue
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                    3 Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenKitchen}
                  className="font-button-secondary text-button-secondary text-primary hover:text-primary-container flex items-center gap-1 group"
                >
                  <span>Open KDS Fullscreen</span>
                  <Icon name="open_in_new" className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="space-y-space-sm">
                {KITCHEN_QUEUE.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm"
                  >
                    <div className="flex items-center gap-space-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center font-heading-sm font-bold text-text-primary shadow-sm">
                        {ticket.id}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-label-md font-bold text-text-primary">{ticket.table}</span>
                          <span className={`font-caption text-caption font-medium px-2 py-0.5 rounded ${ticket.stationClass}`}>
                            {ticket.station}
                          </span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary mt-0.5">{ticket.items}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span className="font-label-md text-label-md font-bold text-text-primary">{ticket.total}</span>
                      <span className={`font-caption text-caption font-semibold flex items-center gap-1 ${ticket.timeClass}`}>
                        <Icon name={ticket.time.startsWith('1m') ? 'bolt' : 'timer'} className="text-[13px]" />
                        {ticket.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Till & Cash Drawer */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold tracking-tight">
                    Till & Cash Drawer
                  </span>
                  <span className="block font-caption text-caption text-text-secondary">Physical safe balance & drops</span>
                </div>
                <button
                  type="button"
                  onClick={popDrawer}
                  className="px-space-sm py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-secondary-container active:scale-[0.98] transition-all font-button-secondary text-button-secondary font-medium flex items-center gap-1 shadow-sm"
                >
                  {drawerState === 'popping' ? (
                    <>
                      <Icon name="sync" className="text-[18px] animate-spin" />
                      <span>Popping...</span>
                    </>
                  ) : drawerState === 'open' ? (
                    <>
                      <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
                      <span>Drawer Open</span>
                    </>
                  ) : (
                    <>
                      <Icon name="lock_open" className="text-[18px]" />
                      <span>Pop Drawer (F5)</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                  <span className="font-body-md text-body-md text-text-secondary">Opening Shift Float</span>
                  <div className="text-right">
                    <span className="font-label-md text-label-md font-bold text-text-primary">₦50,000</span>
                    <span className="block font-caption text-caption text-text-tertiary">Verified 08:30 AM</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                  <span className="font-body-md text-body-md text-text-secondary">Current Cash in Drawer</span>
                  <div className="text-right">
                    <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text">₦142,400</span>
                    <span className="block font-caption text-caption text-badge-discount-text">Exact float + sales match</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                  <span className="font-body-md text-body-md text-text-secondary">Float Variance</span>
                  <div className="text-right">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">₦0.00 Over / Short</span>
                    <span className="block font-caption text-caption text-text-tertiary">Next drop audit: 16:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Fleet Telemetry */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold tracking-tight">
                    Hardware Fleet Telemetry
                  </span>
                  <span className="block font-caption text-caption text-text-secondary">
                    Active local USB & Bluetooth peripherals
                  </span>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  3/3 Connected
                </span>
              </div>
              <div className="space-y-space-sm">
                {FLEET.map((device) => (
                  <div key={device.name} className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center text-primary-container shadow-sm">
                        <Icon name={device.icon} className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">{device.name}</span>
                        <span className="font-caption text-caption text-text-secondary">{device.meta}</span>
                      </div>
                    </div>
                    <span className="font-caption text-caption font-medium px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text">
                      {device.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kiosk Mode Lock */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
                  <Icon name="tablet_mac" className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Public Self-Ordering Kiosk Mode
                  </span>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Lock till into guest-facing self-ordering flow. Requires Manager Override PIN to exit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={kioskArmed}
                onClick={toggleKiosk}
                className={`relative inline-flex items-center cursor-pointer shrink-0 w-11 h-6 rounded-full transition-colors ${
                  kioskArmed ? 'bg-primary-container' : 'bg-surface-container'
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-surface-canvas transition-transform ${
                    kioskArmed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Hotkeys & Compliance Bar */}
      <section className="w-full pb-space-lg">
        <div className="w-full bg-inverse-surface rounded-xl p-space-md text-inverse-on-surface shadow-md flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-2 text-caption font-caption">
            <span className="text-text-tertiary font-semibold uppercase tracking-wider">Fast Keys:</span>
            {HOTKEYS.map((hotkey) => (
              <div key={hotkey.keys} className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 rounded bg-surface-canvas/10 text-inverse-on-surface font-mono text-[11px] font-bold">
                  {hotkey.keys}
                </kbd>
                <span>{hotkey.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-space-md text-caption font-caption text-text-tertiary shrink-0">
            <div className="flex items-center gap-1.5">
              <Icon name="verified_user" className="text-[15px] text-badge-discount-text" />
              <span>NDPR Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="lock" className="text-[15px] text-primary-fixed" />
              <span>256-Bit Hardware Encryption</span>
            </div>
          </div>
        </div>
      </section>
    </PosTerminalChrome>
  );
}
