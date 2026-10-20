import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { printKvTable, printReport } from '../../utils/printReport';

interface DesktopOrdersScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenOrder?: (ref: string) => void;
  onOpenBooking?: () => void;
}

const TABS = [
  { label: 'All Activity', count: '0', badge: '', type: 'active' },
  { label: 'Upcoming Appointments', count: '', badge: '', type: 'upcoming' },
  { label: 'Past Orders & Dine-in', count: '', badge: '', type: 'past' },
  { label: 'Cancelled', count: '', badge: '', type: 'cancelled' },
];

type OrderRow = {
  merchant: string;
  orderId: string;
  type: string;
  typeIcon: string;
  typeClass: string;
  specifics: string;
  date: string;
  time: string;
  amount: string;
  method: string;
  methodIcon: string;
  methodIconClass: string;
  status: string;
  actions: 'reorder' | 'receipt' | 'details';
  image: string;
  alt: string;
  merchantTarget: DesktopNavKey;
};

const ROWS: OrderRow[] = [];

export function DesktopOrdersScreen({ onNav, onOpenOrder: _onOpenOrder, onOpenBooking: _onOpenBooking }: DesktopOrdersScreenProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [merchant, setMerchant] = useState('all');

  // Merchant options come from the rows themselves, so the menu can never
  // offer a store the table has nothing to show for.
  const merchantChoices = [
    { value: 'all', label: 'All Partner Merchants' },
    ...Array.from(new Set(ROWS.map((row) => row.merchant))).map((name) => ({
      value: name,
      label: name,
    })),
  ];

  const query = searchQuery.trim().toLowerCase();

  /** Merchant select and search both have to agree before a row shows. */
  const visibleRows = ROWS.filter(
    (row) =>
      (merchant === 'all' || row.merchant === merchant) &&
      (query === '' ||
        row.merchant.toLowerCase().includes(query) ||
        row.orderId.toLowerCase().includes(query) ||
        row.specifics.toLowerCase().includes(query)),
  );

  const downloadStatement = () => {
    downloadCsv(
      'vemtap-orders-statement.csv',
      ['Merchant', 'Order', 'Type', 'Items', 'Date', 'Time', 'Amount', 'Payment', 'Status'],
      ROWS.map((row) => [row.merchant, row.orderId, row.type, row.specifics, row.date, row.time, row.amount, row.method, row.status]),
    );
    printReport(
      'VEMTAP Orders Statement',
      `${printKvTable('Statement scope', [
        ['Period', 'Sep 1 – Oct 15, 2024'],
        ['Account', 'Customer activity ledger'],
        ['Entries', `${ROWS.length}`],
      ])}
       ${printKvTable(
         'Transactions',
         ROWS.map((row) => [`${row.date} — ${row.merchant}`, `${row.amount} · ${row.method} · ${row.status} · ${row.orderId}`]),
       )}
       <p class="foot">A CSV copy of this statement downloaded alongside the PDF.</p>`,
    );
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="orders" withCustomerRail>
      <div className="w-full bg-surface-canvas">
        <div className="w-full bg-surface-subtle pb-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <nav aria-label="Breadcrumb" className="pt-6 mb-2">
              <ol className="flex items-center gap-1 text-text-tertiary font-caption text-caption">
                <li className="flex items-center gap-1">
                  <button className="hover:text-primary transition-colors" onClick={() => onNav('discover')} type="button">
                    Home
                  </button>
                  <Icon name="chevron_right" className="text-[14px]" />
                </li>
                <li className="flex items-center gap-1">
                  <button
                    className="hover:text-primary transition-colors"
                    onClick={() => onNav('dashboard')}
                    type="button"
                  >
                    Customer Dashboard
                  </button>
                  <Icon name="chevron_right" className="text-[14px]" />
                </li>
                <li aria-current="page" className="font-label-sm text-label-sm text-text-primary">
                  Activity
                </li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Verified Activity Ledger</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Orders &amp; Bookings
                </h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                  Review your direct merchant purchases, upcoming service appointments, and instant digital receipts
                  across Abuja.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-canvas text-text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface transition-all"
                  type="button"
                  onClick={downloadStatement}
                >
                  <Icon name="receipt_long" className="text-[20px] text-text-secondary" />
                  <span>Download Statement (.PDF)</span>
                </button>
                <button
                  onClick={() => onNav('deals')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:opacity-95 transition-all"
                  type="button"
                >
                  <Icon name="explore" className="text-[20px]" />
                  <span>Explore New Deals</span>
                </button>
              </div>
            </div>

            <div className="relative w-full rounded-2xl bg-surface-canvas shadow-xl p-6 mb-10 overflow-hidden">
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
              <div className="flex items-center justify-center min-h-[220px] text-center relative">
                <div className="max-w-xl mx-auto">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-tint-blue text-primary shadow-sm">
                    <Icon name="receipt_long" className="text-[30px]" />
                  </div>
                  <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mb-2">
                    No orders or bookings yet
                  </h2>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    When you place an order or reserve a service, it will appear here with live status and receipts.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl shadow-md p-6 mb-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.type}
                      onClick={() => setActiveTab(tab.type)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-label-md text-label-md transition-colors shrink-0 ${
                        activeTab === tab.type
                          ? 'bg-surface-tint-blue text-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                      }`}
                      type="button"
                    >
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="inline-flex items-center px-1 py-[2px] rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold text-[11px]">
                          {tab.badge}
                        </span>
                      )}
                      {tab.count && (
                        <span
                          className={
                            activeTab === tab.type
                              ? 'w-5 h-5 rounded-full bg-primary text-on-primary text-caption font-bold flex items-center justify-center text-[11px]'
                              : 'text-text-tertiary font-caption text-caption'
                          }
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-text-tertiary font-caption text-caption">
                  <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                  <span>Real-time synchronization active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4">
                <div className="md:col-span-5 relative">
                  <Icon
                    name="search"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-text-tertiary"
                  />
                  <input
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas shadow-inner"
                    id="orderSearchInput"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by Order ID (#UG-9021), store name, or item..."
                    type="text"
                    value={searchQuery}
                  />
                </div>
                <div className="md:col-span-3">
                  <div className="relative flex items-center">
                    <Icon
                      name="calendar_today"
                      className="absolute left-3 text-[20px] text-text-tertiary pointer-events-none"
                    />
                    <select className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md appearance-none focus:outline-none cursor-pointer">
                      <option>Date Range: Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>Last 90 Days</option>
                      <option>Custom Period (2024)</option>
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-3 text-[18px] text-text-tertiary pointer-events-none"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="relative flex items-center">
                    <Icon
                      name="storefront"
                      className="absolute left-3 text-[20px] text-text-tertiary pointer-events-none"
                    />
                    <select
                      aria-label="Filter by partner merchant"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md appearance-none focus:outline-none cursor-pointer"
                      onChange={(event) => setMerchant(event.target.value)}
                      value={merchant}
                    >
                      {merchantChoices.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-3 text-[18px] text-text-tertiary pointer-events-none"
                    />
                  </div>
                </div>
                <div className="md:col-span-1 flex items-center justify-end">
                  <button
                    aria-label="Reset filters"
                    className="w-11 h-11 rounded-xl bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container-high flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={merchant === 'all' && query === ''}
                    onClick={() => {
                      setMerchant('all');
                      setSearchQuery('');
                    }}
                    title="Reset search and merchant filter"
                    type="button"
                  >
                    <Icon name="filter_alt_off" className="text-[20px]" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-subtle/50 px-6 py-12 mt-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-canvas shadow-sm text-text-tertiary">
                  <Icon name="inventory_2" className="text-[28px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary mb-1">No activity to show</h3>
                <p className="font-body-md text-body-md text-text-secondary max-w-md mx-auto leading-relaxed">
                  Your real order history and appointments will appear here once the backend starts returning records.
                </p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-text-tertiary font-label-sm text-label-sm uppercase tracking-wider bg-surface-subtle/60 rounded-xl">
                      <th className="py-3 px-4 font-medium rounded-l-xl" scope="col">
                        Merchant &amp; Order
                      </th>
                      <th className="py-3 px-4 font-medium" scope="col">
                        Type &amp; Specifics
                      </th>
                      <th className="py-3 px-4 font-medium" scope="col">
                        Date &amp; Timestamp
                      </th>
                      <th className="py-3 px-4 font-medium" scope="col">
                        Settlement &amp; Method
                      </th>
                      <th className="py-3 px-4 font-medium" scope="col">
                        Status
                      </th>
                      <th className="py-3 px-4 font-medium text-right rounded-r-xl" scope="col">
                        Receipt &amp; Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-body-md text-body-md">
                    {visibleRows.map((row) => (
                      <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.orderId}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-subtle">
                              {row.image ? (
                                <img alt={row.alt} className="w-full h-full object-cover" src={row.image} />
                              ) : (
                                <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary">
                                  <Icon name="dry_cleaning" className="text-[26px]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => onNav(row.merchantTarget)}
                                className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors font-semibold text-left"
                                type="button"
                              >
                                {row.merchant}
                              </button>
                              <span className="block font-mono font-caption text-caption text-text-tertiary">
                                {row.orderId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-caption text-caption font-semibold mb-1 ${row.typeClass}`}
                            >
                              <Icon name={row.typeIcon} className="text-[13px]" />
                              <span>{row.type}</span>
                            </span>
                            <p className="text-text-secondary text-caption line-clamp-1">{row.specifics}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-text-primary font-medium block">{row.date}</span>
                          <span className="text-text-tertiary font-caption text-caption">{row.time}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-heading-sm text-heading-sm text-text-primary font-bold block">
                            {row.amount}
                          </span>
                          <span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
                            <Icon name={row.methodIcon} className={`text-[14px] ${row.methodIconClass}`} />
                            <span>{row.method}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                            <Icon name="check_circle" className="text-[14px]" />
                            <span>{row.status}</span>
                          </span>
                        </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onOpenOrder(row.orderId.split(' ')[0].replace(/^#/, '').trim())}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm font-semibold transition-colors"
                                type="button"
                              >
                                <Icon name={row.actions === 'details' ? 'visibility' : 'receipt'} className="text-[16px]" />
                                <span>
                                  {row.actions === 'reorder'
                                    ? 'E-Receipt'
                                    : row.actions === 'receipt'
                                      ? 'View Receipt'
                                      : 'View Details'}
                                </span>
                              </button>
                              {row.actions === 'reorder' && (
                                <button
                                  onClick={() => onNav('storefront')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity"
                                  type="button"
                                >
                                  <Icon name="refresh" className="text-[16px]" />
                                  <span>Reorder</span>
                                </button>
                              )}
                            </div>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleRows.length === 0 && (
                  <div className="flex flex-col items-center text-center py-space-lg px-space-md">
                    <span className="w-14 h-14 rounded-full bg-surface-container-high text-text-tertiary flex items-center justify-center mb-space-sm">
                      <Icon name="search_off" className="text-[26px]" />
                    </span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      No orders match these filters
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-1 max-w-xs leading-relaxed">
                      {merchant !== 'all' ? `Nothing from ${merchant}` : 'Nothing matches your search'}
                      {query !== '' ? ` for “${searchQuery.trim()}”` : ''}. Reset the filters to see every order.
                    </span>
                    <button
                      className="mt-space-sm h-10 px-space-md rounded-xl bg-surface-container text-text-primary font-button-secondary text-button-secondary font-medium active:scale-95 transition-transform"
                      onClick={() => {
                        setMerchant('all');
                        setSearchQuery('');
                      }}
                      type="button"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-border-subtle">
                <p className="font-caption text-caption text-text-secondary">
                  Showing <span className="font-semibold text-text-primary">0</span> of{' '}
                  <span className="font-semibold text-text-primary">0</span> total transactions across Abuja
                </p>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg text-text-tertiary cursor-not-allowed" disabled type="button">
                    <Icon name="chevron_left" className="text-[20px]" />
                  </button>
                  <span className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-semibold">
                    1
                  </span>
                  <button
                    className="w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-primary font-label-sm text-label-sm flex items-center justify-center font-medium transition-colors"
                    type="button"
                  >
                    2
                  </button>
                  <button
                    className="p-2 rounded-lg text-text-primary hover:bg-surface-subtle transition-colors"
                    type="button"
                  >
                    <Icon name="chevron_right" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-tint-blue rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="help_outline" className="text-[26px]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                  Need help with an order or booking?
                </h3>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Our Abuja support team can chase receipts, reschedule visits, or resolve disputes.
                </p>
                <a
                  className="inline-flex items-center gap-1.5 pt-1 font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  href="mailto:support@vemtap.ng?subject=Help%20with%20an%20order%20or%20booking"
                >
                  <span>Contact support</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pb-6">
              <div className="lg:col-span-8 rounded-2xl bg-surface-canvas p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="shield" className="text-[26px]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                      VEMTAP Direct Payment Assurance
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-surface-subtle font-caption text-caption text-text-tertiary">
                      NDPR Protected
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    Payments are settled directly with merchants via POS terminal, direct bank transfer, or cash
                    without platform middleman fees. VEMTAP provides verified discount attribution, encrypted
                    appointment scheduling, and permanent digital receipt vaulting.
                  </p>
                  <div className="pt-2 flex items-center gap-4">
                    <button className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-1.5 hover:underline" type="button">
                      <span>Read our direct consumer protection pledge</span>
                      <Icon name="arrow_forward" className="text-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-2xl bg-surface-tint-blue p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wider">
                      Lifetime Savings
                    </span>
                    <Icon name="savings" className="text-primary text-[20px]" />
                  </div>
                  <div className="font-display-hero text-display-hero text-text-primary font-bold mb-1">₦42,850</div>
                  <p className="font-caption text-caption text-text-secondary">
                    Saved via VEMTAP Tap Deals &amp; Merchant promotions across 12 completed visits.
                  </p>
                </div>
                <div className="pt-4">
                  <div className="w-full bg-surface-canvas rounded-full h-2 mb-1 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '74%' }} />
                  </div>
                  <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                    <span>Tier 2 Abuja Explorer</span>
                    <span className="font-semibold text-primary">74% to Tier 3 Gold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
