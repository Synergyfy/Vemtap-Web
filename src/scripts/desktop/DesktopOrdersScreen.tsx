import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopOrdersScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenOrder: () => void;
  onOpenBooking: () => void;
}

const TABS = [
  { label: 'All Activity', count: '8', badge: '', type: 'active' },
  { label: 'Upcoming Appointments', count: '', badge: '1 Tomorrow', type: 'upcoming' },
  { label: 'Past Orders & Dine-in', count: '(6)', badge: '', type: 'past' },
  { label: 'Cancelled', count: '(1)', badge: '', type: 'cancelled' },
];

const ROWS = [
  {
    merchant: 'Urban Grill & Bistro',
    orderId: '#UG-9021 • Apo District',
    type: 'Dine-in (Table #07)',
    typeIcon: 'restaurant',
    typeClass: 'bg-surface-tint-blue text-primary',
    specifics: '1x Woodfire Aged Ribeye, 1x Truffle Fries, 1x Peach Tea',
    date: 'Oct 15, 2024',
    time: '7:30 PM WAT',
    amount: '₦19,000',
    method: 'Paid at Counter (Card)',
    methodIcon: 'credit_card',
    methodIconClass: 'text-badge-discount-text',
    status: 'Completed',
    actions: 'reorder',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCta-AVcjCZDWInIcUOJAuZYV2oAQHyTKLW5eoRshVGRfv8UJJbZ9ZCzBn61chEDIfTHAGW1GJtmX2WtS91OqMMUuKu_rwDf5fhd87TDW44tR2GYusQ1Q0A_EdzsPpIuPe9Ka3jV_pnY_4A-0zbBoXeaXu8h257sUKg1LWCudIZeklCl2b_QS7i_d4Cq3p8rIm-xBCEHufzUuVhTBN4Z6tLGW_WUhyJZBbwR8YVUOYg',
    alt: 'Plated gourmet woodfire steak dinner at Urban Grill and Bistro Abuja with warm ambient restaurant spotlighting',
    merchantTarget: 'storefront' as DesktopNavKey,
  },
  {
    merchant: 'Cafe Neo Artisanal',
    orderId: '#CN-1184 • Wuse II',
    type: 'Counter Takeaway',
    typeIcon: 'takeout_dining',
    typeClass: 'bg-surface-subtle text-text-secondary',
    specifics: 'Cold Brew & Almond Pastry Box (2 pcs)',
    date: 'Oct 11, 2024',
    time: '9:15 AM WAT',
    amount: '₦4,500',
    method: 'VEMTAP Instant Tap',
    methodIcon: 'contactless',
    methodIconClass: 'text-primary',
    status: 'Completed',
    actions: 'receipt',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_QV6uRZyyO54NZ_xP-h2bJ8ASlYYKyHrhcifuXhWq8-8e8k7vVjQp92ikYv3cH5MH1U3mE-cqvqgIrgvoTD-_3v0kflAwqqy8Epu7Gxy7JGLPfKzbysfHasIYlfBSpqOZTvvLMf7DdGcoLZHsJdXHYXPoe6YzKvM1VfQBm0hKUBoocqfb1jEx0XIwvHG3Cu3MbVVrfoRPKvM2x6jDPEgCeLL7VDkEoBDmTl5tggWL',
    alt: 'Chic modern cafe counter with freshly baked golden croissants and chilled nitro cold brew coffee in Abuja',
    merchantTarget: 'discover' as DesktopNavKey,
  },
  {
    merchant: 'Velvet Stitch Couture',
    orderId: '#VS-8804 • Garki II',
    type: 'Bespoke Tailoring',
    typeIcon: 'design_services',
    typeClass: 'bg-surface-subtle text-text-secondary',
    specifics: 'Custom Wool Suit Tailoring Fitting Session',
    date: 'Sep 28, 2024',
    time: '3:00 PM WAT',
    amount: '₦35,000',
    method: 'Bank Transfer Verified',
    methodIcon: 'account_balance',
    methodIconClass: 'text-badge-discount-text',
    status: 'Completed',
    actions: 'details',
    image: '',
    alt: '',
    merchantTarget: 'discover' as DesktopNavKey,
  },
];

export function DesktopOrdersScreen({ onNav, onOpenOrder, onOpenBooking }: DesktopOrdersScreenProps) {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="orders">
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
              <div className="flex flex-col lg:flex-row gap-6 items-stretch relative">
                <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between rounded-xl bg-surface-subtle p-4 relative overflow-hidden">
                  <div className="relative h-44 w-full rounded-lg overflow-hidden mb-2">
                    <img
                      alt="Serene luxury day spa treatment room with botanical accents, warm timber furnishings, soft diffuse daylight, and organic skincare essentials arranged neatly in Abuja"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO8mzoeLehe5p8uSLXesvatMxVjYR42ABeOPmuFYI827KTEwRO_SPbscYV7f85BXGejWcdoe2uaUHATPe7YX9Rznp1ckMjgg-u7m-vBxw0Z67DFpm0ufm4rg1v1fGgqvCCskKZshUlIKCtKB50TjOwwucnjYkGAVmSwO0YgV_OxiLRsYEJ5-ds90djDhdE4ldxF1jZdkv2QhqFByRPUAEcfTeF26LVqRB4KKWSUseg"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-sm">
                        <Icon name="local_offer" className="text-[14px]" />
                        <span>₦5,000 VEMTAP Deal Applied</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-text-tertiary font-caption text-caption mb-0.5">
                      <span>Confirmation Code</span>
                      <span className="font-mono text-text-primary font-semibold">#GS-44218</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                      <Icon name="pin_drop" className="text-[18px] text-primary" />
                      <span className="font-caption text-caption text-text-secondary truncate">
                        Maitama Heights, 3rd Floor, Abuja
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                          <Icon name="verified" className="text-[16px]" />
                          <span>Confirmed &amp; Slot Reserved</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                          Happening Tomorrow
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-caption text-caption text-text-tertiary block">Settlement Upon Arrival</span>
                        <span className="font-heading-lg text-heading-lg text-text-primary font-bold">₦24,000</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="font-label-md text-label-md text-primary font-semibold uppercase tracking-wider mb-0.5">
                        Upcoming Appointment Spotlight
                      </p>
                      <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight mb-0.5">
                        Glow &amp; Serenity Spa &amp; Salon
                      </h2>
                      <p className="font-body-lg text-body-lg text-text-secondary">
                        Deep Hydration Radiance Facial &amp; Gel Manicure
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-subtle mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                          <Icon name="calendar_clock" className="text-[20px]" />
                        </div>
                        <div>
                          <span className="font-caption text-caption text-text-tertiary block">Date &amp; Time</span>
                          <span className="font-label-md text-label-md text-text-primary font-semibold">
                            Thu, Oct 17 • 1:15 PM
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                          <Icon name="hourglass_top" className="text-[20px]" />
                        </div>
                        <div>
                          <span className="font-caption text-caption text-text-tertiary block">Duration</span>
                          <span className="font-label-md text-label-md text-text-primary font-semibold">~1h 45m</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                          <Icon name="badge" className="text-[20px]" />
                        </div>
                        <div>
                          <span className="font-caption text-caption text-text-tertiary block">Assigned Specialist</span>
                          <span className="font-label-md text-label-md text-text-primary font-semibold">
                            Amara K. (Lead Aesthetician)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={onOpenBooking}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary hover:opacity-95 transition-all shadow-sm"
                        type="button"
                      >
                        View Booking Details
                      </button>
                      <button
                        onClick={() => onNav('spa-booking')}
                        className="px-4 py-2 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-high transition-colors"
                        type="button"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => onNav('messages')}
                        className="px-4 py-2 rounded-xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary hover:bg-surface-container-high transition-colors"
                        type="button"
                      >
                        Contact Spa
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-primary hover:bg-surface-tint-blue font-label-sm text-label-sm transition-colors"
                        type="button"
                      >
                        <Icon name="event" className="text-[18px]" />
                        <span>Add to Google / Outlook Calendar</span>
                      </button>
                    </div>
                  </div>
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
                    placeholder="Search by Order ID (#UG-9021), store name, or item..."
                    type="text"
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
                    <select className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md appearance-none focus:outline-none cursor-pointer">
                      <option>All Partner Merchants</option>
                      <option>Urban Grill &amp; Bistro</option>
                      <option>Cafe Neo Artisanal</option>
                      <option>Velvet Stitch Couture</option>
                      <option>Glow &amp; Serenity Spa</option>
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
                    className="w-11 h-11 rounded-xl bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container-high flex items-center justify-center transition-colors"
                    type="button"
                  >
                    <Icon name="filter_alt_off" className="text-[20px]" />
                  </button>
                </div>
              </div>

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
                    {ROWS.map((row) => (
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
                                onClick={onOpenOrder}
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
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-border-subtle">
                <p className="font-caption text-caption text-text-secondary">
                  Showing <span className="font-semibold text-text-primary">1–3</span> of{' '}
                  <span className="font-semibold text-text-primary">8</span> total transactions across Abuja
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
