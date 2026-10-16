import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessModeHeader } from './BusinessModeHeader';

interface BusinessBookingsHubScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onSwitchOrders: () => void;
  onOpenBooking: () => void;
}

type BookingStatusKey = 'upcoming' | 'today' | 'completed' | 'cancelled';

const STATUS_PILLS: { key: BookingStatusKey; label: string; count: string }[] = [
  { key: 'upcoming', label: 'Upcoming', count: '(3)' },
  { key: 'today', label: 'Today', count: '(5)' },
  { key: 'completed', label: 'Completed', count: '(24)' },
  { key: 'cancelled', label: 'Cancelled', count: '(2)' },
];

const CALENDAR_DAYS = [
  { key: 'today', top: 'Today', day: '18', sub: 'Oct, Fri', active: true },
  { key: 'tomorrow', top: 'Tomorrow', day: '19', sub: 'Oct, Sat' },
  { key: 'sun', top: 'Sun', day: '20', sub: 'Oct' },
  { key: 'mon', top: 'Mon', day: '21', sub: 'Oct' },
  { key: 'tue', top: 'Tue', day: '22', sub: 'Oct' },
];

interface BookingRow {
  time: string;
  timeSub: string;
  timeBoxClass: string;
  timeSubClass: string;
  urgent?: boolean;
  customer: string;
  vip?: boolean;
  statusLabel: string;
  statusClass: string;
  service: string;
  staff: string;
  party?: string;
  price?: string;
  chips: { label: string; chipClass: string }[];
  note?: string;
  noteClass?: string;
  checkIn?: boolean;
}

const BOOKING_ROWS: BookingRow[] = [
  {
    time: '2:15 PM',
    timeSub: '35m',
    timeBoxClass: 'bg-surface-tint-blue',
    timeSubClass: 'text-badge-discount-text',
    urgent: true,
    customer: 'Zainab Ahmed',
    vip: true,
    statusLabel: '',
    statusClass: '',
    service: 'Facial & Manicure',
    staff: 'Amara K.',
    price: '₦24,000',
    chips: [
      { label: 'Voucher (₦20k)', chipClass: 'bg-surface-tint-blue text-primary' },
      { label: 'POS Terminal • Pay at Salon', chipClass: 'bg-surface-container-low text-on-surface-variant' },
    ],
    checkIn: true,
  },
  {
    time: '4:00 PM',
    timeSub: '60 mins',
    timeBoxClass: 'bg-surface-subtle',
    timeSubClass: 'text-text-tertiary',
    customer: 'Samuel Adeleke',
    statusLabel: 'Confirmed',
    statusClass: 'bg-badge-discount-bg text-badge-discount-text',
    service: 'Swedish Massage',
    staff: 'David O. (Suite 4)',
    price: '₦18,500',
    chips: [{ label: 'Direct Transfer • Verified by Merchant', chipClass: 'bg-badge-discount-bg text-badge-discount-text' }],
  },
  {
    time: '5:15 PM',
    timeSub: '45 mins',
    timeBoxClass: 'bg-surface-subtle',
    timeSubClass: 'text-text-tertiary',
    customer: 'Halima Yusuf',
    statusLabel: 'Confirmed',
    statusClass: 'bg-badge-discount-bg text-badge-discount-text',
    service: 'Deluxe Gel Manicure',
    staff: 'Blessing E.',
    price: '₦9,000',
    chips: [{ label: 'Cash • Pay at Salon', chipClass: 'bg-surface-container-low text-on-surface-variant' }],
  },
  {
    time: '6:30 PM',
    timeSub: '40 mins',
    timeBoxClass: 'bg-surface-subtle',
    timeSubClass: 'text-text-tertiary',
    customer: 'Emeka Obi',
    statusLabel: 'Confirmed',
    statusClass: 'bg-badge-discount-bg text-badge-discount-text',
    service: 'Beard Grooming & Cut',
    staff: 'Chair 2',
    price: '₦7,500',
    chips: [{ label: 'POS / Card Swipe • Pay at Salon', chipClass: 'bg-surface-container-low text-on-surface-variant' }],
  },
  {
    time: '7:30 PM',
    timeSub: 'Dinner',
    timeBoxClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    timeSubClass: 'opacity-80',
    customer: 'Dr. Chidi Okafor',
    statusLabel: 'Reserved',
    statusClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    service: 'Dining Reservation',
    staff: '',
    party: 'Party of 4 (Table 08)',
    chips: [],
    note: 'Anniversary Table Request',
    noteClass: 'text-tertiary font-medium',
  },
];

export function BusinessBookingsHubScreen({
  onTab,
  onSwitchOrders,
  onOpenBooking,
}: BusinessBookingsHubScreenProps) {
  const [activeDay, setActiveDay] = useState('today');
  const [statusPill, setStatusPill] = useState<BookingStatusKey>('upcoming');
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <AppScreen>
      <BusinessModeHeader title="Orders" />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Context Action Bar */}
        <div className="px-margin pt-space-sm pb-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Open Calendar Grid"
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant active:bg-surface-container-high transition-colors"
              type="button"
            >
              <Icon name="calendar_month" className="text-[20px]" />
            </button>
            <button
              className="h-10 px-space-sm rounded-full bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-space-2xs shadow-sm active:scale-95 transition-transform"
              type="button"
            >
              <Icon name="add" className="text-[18px]" />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* Unified Top Switcher: Orders vs Bookings */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center">
            <button
              className="flex-1 py-2 rounded-lg text-center font-label-md text-label-md text-text-secondary transition-all hover:text-on-surface flex items-center justify-center gap-1.5"
              type="button"
              onClick={onSwitchOrders}
            >
              <span>Orders</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-highest text-text-secondary font-caption text-caption font-semibold">
                4
              </span>
            </button>
            <button
              className="flex-1 py-2 rounded-lg text-center font-label-md text-label-md bg-surface-canvas text-primary font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              type="button"
            >
              <span>Bookings</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                5
              </span>
            </button>
          </div>
        </div>

        {/* Calendar Quick Strip */}
        <div className="pt-space-2xs pb-space-sm">
          <div className="flex items-center gap-space-xs overflow-x-auto px-margin no-scrollbar">
            {CALENDAR_DAYS.map((day) => {
              const active = day.key === activeDay;
              return (
                <button
                  className={`flex flex-col items-center justify-center min-w-[72px] py-2 px-space-xs rounded-xl shadow-sm flex-shrink-0 transition-colors ${
                    active ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-text-secondary active:bg-surface-container-low'
                  }`}
                  key={day.key}
                  type="button"
                  onClick={() => setActiveDay(day.key)}
                >
                  <span className={`font-caption text-caption uppercase tracking-wide ${active ? 'opacity-80' : 'text-text-tertiary'}`}>
                    {day.top}
                  </span>
                  <span className="font-heading-sm text-heading-sm leading-tight my-0.5">{day.day}</span>
                  <span className={`font-caption text-caption ${active ? 'font-medium' : ''}`}>{day.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="px-margin py-space-2xs flex items-center gap-space-xs overflow-x-auto no-scrollbar">
          {STATUS_PILLS.map((pill) => {
            const active = pill.key === statusPill;
            return (
              <button
                className={`h-9 px-space-sm rounded-full font-label-md text-label-md whitespace-nowrap flex items-center gap-1 transition-colors ${
                  active ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm' : 'bg-surface-subtle text-text-secondary'
                }`}
                key={pill.key}
                type="button"
                onClick={() => setStatusPill(pill.key)}
              >
                <span>{pill.label}</span>
                <span className={`font-caption text-caption ${active ? 'opacity-80' : 'text-text-tertiary'}`}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Delightful Live Summary Alert Banner */}
        <div className="px-margin pt-space-sm pb-space-xs">
          <div className="w-full bg-surface-tint-blue rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
              <Icon name="notifications_active" className="text-[20px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  5 Bookings Scheduled Today
                </p>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Next appointment starts in <span className="font-medium text-primary">35 mins</span> (Room 2)
              </p>
            </div>
          </div>
        </div>

        {/* Bookings List Section */}
        <div className="px-margin pt-space-xs pb-space-xl flex flex-col gap-space-xs">
          {BOOKING_ROWS.map((row) => (
            <button
              className={`w-full bg-surface-canvas rounded-xl shadow-sm p-3 flex items-center justify-between gap-2.5 active:bg-surface-container-low transition-colors text-left ${
                row.urgent ? 'border-l-4 border-primary' : ''
              }`}
              key={row.time}
              type="button"
              onClick={onOpenBooking}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex flex-col items-center justify-center min-w-[62px] py-1 px-1.5 rounded-lg flex-shrink-0 text-center ${row.timeBoxClass}`}
                >
                  <span className="font-label-md text-label-md font-bold text-primary leading-tight">{row.time}</span>
                  <span
                    className={`font-caption text-caption font-semibold flex items-center gap-1 mt-0.5 ${row.timeSubClass}`}
                  >
                    {row.urgent && <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />}
                    {row.timeSub}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <h2 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      {row.customer}
                    </h2>
                    {row.vip && (
                      <span className="px-1 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-caption text-caption font-bold uppercase tracking-tight shrink-0">
                        VIP
                      </span>
                    )}
                    {row.statusLabel && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${row.statusClass}`}
                      >
                        {row.statusLabel}
                      </span>
                    )}
                  </div>
                  <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                    {row.service}
                    {row.staff && (
                      <>
                        {' • '}
                        <span className="text-on-surface font-medium">{row.staff}</span>
                      </>
                    )}
                    {row.party && (
                      <>
                        {' • '}
                        <span className="text-primary font-medium">{row.party}</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {row.price && <span className="font-caption text-caption font-bold text-on-surface">{row.price}</span>}
                    {row.chips.map((chip) => (
                      <span
                        className={`px-1.5 py-0.5 rounded-full font-caption text-caption font-medium ${chip.chipClass}`}
                        key={chip.label}
                      >
                        {chip.label}
                      </span>
                    ))}
                    {row.note && <span className={`font-caption text-caption ${row.noteClass}`}>{row.note}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {row.checkIn ? (
                  <button
                    className={`h-8 px-2.5 rounded-lg font-caption text-caption font-semibold flex items-center gap-1 shadow-sm transition-colors ${
                      checkedIn ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary text-on-primary'
                    }`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCheckedIn(true);
                    }}
                  >
                    <Icon name={checkedIn ? 'check_circle' : 'how_to_reg'} className="text-[16px]" />
                    <span>{checkedIn ? 'Checked In' : 'Check-In'}</span>
                  </button>
                ) : null}
                <Icon name="chevron_right" className="text-text-tertiary text-[20px]" />
              </div>
            </button>
          ))}
        </div>
      </div>
      <BusinessTabBar onTab={onTab} />
    </AppScreen>
  );
}
