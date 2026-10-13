import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBooking } from '../context/BookingContext';
import { SPA_DAYS, SPA_MERCHANT, SPA_TIME_PERIODS, SPA_THERAPISTS, type SpaDay } from './spaBookingData';

interface SpaBookingScheduleScreenProps {
  onBack: () => void;
  onReview: () => void;
}

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NOTES: { note: string; tone: SpaDay['noteTone'] }[] = [
  { note: 'Available', tone: 'discount' },
  { note: 'Few left', tone: 'tertiary' },
  { note: 'Open', tone: 'discount' },
  { note: '4 slots', tone: 'tertiary' },
  { note: 'Popular', tone: 'default' },
];

function buildMonthDays(offset: number): SpaDay[] {
  const target = new Date(2024, 9 + offset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = offset === 0 ? 16 : 1;
  const endDay = Math.min(daysInMonth, startDay + 13);
  const result: SpaDay[] = [];
  for (let d = startDay; d <= endDay; d += 1) {
    const date = new Date(year, month, d);
    const noteInfo = DAY_NOTES[(d - startDay) % DAY_NOTES.length];
    result.push({
      id: `cal-${offset}-d${d}`,
      weekday: WEEKDAYS[date.getDay()],
      day: d,
      monthLabel: `${MONTH_NAMES[month]} ${year}`,
      note: noteInfo.note,
      noteTone: noteInfo.tone,
      dateLong: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      dateShort: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    });
  }
  return result;
}

export function SpaBookingScheduleScreen({ onBack, onReview }: SpaBookingScheduleScreenProps) {
  const booking = useBooking();
  const [periodId, setPeriodId] = useState('afternoon');
  const [monthOffset, setMonthOffset] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const activePeriod = SPA_TIME_PERIODS.find((period) => period.id === periodId) ?? SPA_TIME_PERIODS[1];

  const browsedDays = useMemo(
    () => (monthOffset === 0 ? SPA_DAYS : buildMonthDays(monthOffset)),
    [monthOffset],
  );
  const browsedMonthLabel = useMemo(() => {
    const target = new Date(2024, 9 + monthOffset, 1);
    return `${MONTH_NAMES[target.getMonth()]} ${target.getFullYear()}`;
  }, [monthOffset]);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2500);
    toastTimers.current.push(timer);
  };

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const goToMonth = (nextOffset: number) => {
    if (nextOffset < 0 || nextOffset > 2) return;
    setMonthOffset(nextOffset);
    if (nextOffset === 0) {
      booking.setDay('thu-17');
    } else {
      const days = buildMonthDays(nextOffset);
      if (days[0]) booking.setDayObj(days[0]);
    }
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 flex items-center bg-surface-container-lowest/90 backdrop-blur-md px-4 py-3 justify-between border-b border-border-subtle">
        <button
          aria-label="Go Back"
          type="button"
          onClick={onBack}
          className="text-on-surface flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
        >
          <Icon name="arrow_back" className="text-[24px]" />
        </button>
        <h1 className="text-on-surface text-heading-sm font-heading-sm font-semibold tracking-[-0.015em] flex-1 text-center">
          Schedule Appointment
        </h1>
        <button
          aria-label="Share"
          type="button"
          onClick={() => showToast('Booking link copied to clipboard')}
          className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface transition-colors"
        >
          <Icon name="share" className="text-[22px]" />
        </button>
      </header>

      <main className="flex flex-col flex-1 pb-40">
        <section className="flex flex-col gap-2 p-4 bg-surface-subtle border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <p className="text-on-surface text-label-md font-label-md font-semibold">
              Step 1 of 2: Date, Time &amp; Therapist
            </p>
            <span className="px-2 py-0.5 rounded-full text-caption text-caption font-semibold bg-surface-container text-primary">
              1 / 2
            </span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary-container rounded-full transition-all duration-300 w-1/2" />
          </div>
          <div className="flex items-center justify-between text-caption text-caption text-text-secondary pt-0.5">
            <span>Active selection</span>
            <span className="flex items-center gap-1 font-medium text-text-secondary">
              Next: Review &amp; Confirm <Icon name="arrow_forward" className="text-[14px]" />
            </span>
          </div>
        </section>

        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-badge-discount-text">
                <Icon name="star" className="text-[16px]" filled />
                <span className="text-caption text-caption font-semibold text-text-primary">
                  {SPA_MERCHANT.rating}
                </span>
                <span className="text-caption text-caption text-text-secondary">({SPA_MERCHANT.reviews})</span>
              </div>
              <h2 className="text-on-surface text-body-lg text-body-lg font-bold leading-snug truncate">
                {SPA_MERCHANT.name}
              </h2>
              <p className="text-text-secondary text-caption text-caption flex items-center gap-1 truncate">
                <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                {SPA_MERCHANT.shortLocation} • {SPA_MERCHANT.distance}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => showToast('Policy details coming soon')}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-surface-container-lowest border border-border-subtle text-primary text-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue transition-colors"
                >
                  <Icon name="info" className="text-[16px]" />
                  <span>View Info &amp; Policy</span>
                </button>
              </div>
            </div>
            <div className="size-20 shrink-0 rounded-lg overflow-hidden bg-surface-container relative shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt={SPA_MERCHANT.interiorAlt}
                src={SPA_MERCHANT.interiorImage}
              />
            </div>
          </div>
        </section>

        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="spa" className="text-primary text-[20px]" filled />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                Selected Services ({booking.services.length})
              </h3>
            </div>
            <span className="text-caption text-caption font-semibold text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full">
              ~{booking.durationLabel} total
            </span>
          </div>
          <div className="space-y-2.5">
            {booking.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-subtle"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                    <Icon name={service.icon} className="text-[20px]" />
                  </div>
                  <div className="truncate">
                    <p className="text-on-surface text-label-md text-label-md font-semibold truncate">{service.name}</p>
                    <p className="text-text-secondary text-caption text-caption">
                      {service.time} mins • {naira(service.price)}
                    </p>
                  </div>
                </div>
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="check" className="text-[16px]" />
                </div>
              </div>
            ))}
            {booking.addons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border-subtle bg-surface-subtle"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-badge-discount-bg text-badge-discount-text">
                    <Icon name="add" className="text-[18px]" />
                  </div>
                  <div className="truncate">
                    <p className="text-on-surface text-label-md text-label-md font-semibold truncate">{addon.name}</p>
                    <p className="text-text-secondary text-caption text-caption">
                      {addon.minutes} mins • {naira(addon.price)}
                    </p>
                  </div>
                </div>
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="check" className="text-[16px]" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 text-caption text-caption border-t border-dashed border-border-subtle text-text-secondary">
            <span>Est. Session Subtotal</span>
            <span className="font-bold text-on-surface text-label-md text-label-md">{naira(booking.subtotal)}</span>
          </div>
        </section>

        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="face" className="text-primary text-[20px]" />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                Preferred Therapist
              </h3>
            </div>
            <span className="text-caption text-caption text-text-secondary">Instant match</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {SPA_THERAPISTS.map((therapist) => {
              const selected = booking.therapist.id === therapist.id;
              return (
                <button
                  key={therapist.id}
                  type="button"
                  onClick={() => booking.setTherapist(therapist.id)}
                  className={`flex flex-col items-center p-3 rounded-xl text-center min-w-[120px] shrink-0 transition-all active:scale-95 ${
                    selected
                      ? 'bg-surface-tint-blue ring-2 ring-primary-container/30'
                      : 'bg-surface-subtle hover:bg-surface-container-low'
                  }`}
                >
                  {therapist.image ? (
                    <div className="w-11 h-11 rounded-full overflow-hidden mb-2 bg-surface-container-high">
                      <img className="w-full h-full object-cover" alt={therapist.name} src={therapist.image} />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center mb-2 shadow-sm">
                      <Icon name="bolt" className="text-[20px]" />
                    </div>
                  )}
                  <span className="text-label-md text-label-md text-on-surface font-semibold truncate w-full">
                    {therapist.name}
                  </span>
                  <span
                    className={`text-caption text-caption truncate w-full ${
                      selected ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {therapist.hint ?? therapist.role}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-4 border-b border-border-subtle">
          <div className="px-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="calendar_month" className="text-primary text-[20px]" />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                {browsedMonthLabel}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous month"
                type="button"
                disabled={monthOffset <= 0}
                onClick={() => goToMonth(monthOffset - 1)}
                className="flex size-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <button
                aria-label="Next month"
                type="button"
                disabled={monthOffset >= 2}
                onClick={() => goToMonth(monthOffset + 1)}
                className="flex size-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar snap-x">
            {browsedDays.map((day) => {
              const selected = booking.day.id === day.id;
              const noteTone =
                day.noteTone === 'discount'
                  ? 'text-badge-discount-text'
                  : day.noteTone === 'tertiary'
                    ? 'text-tertiary'
                    : 'text-text-tertiary';
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => booking.setDayObj(day)}
                  className={`flex w-16 shrink-0 flex-col items-center rounded-xl p-2.5 text-center snap-start transition ${
                    selected
                      ? 'bg-primary-container text-white shadow-md ring-2 ring-primary-container ring-offset-2'
                      : 'border border-border-subtle bg-surface-container-lowest hover:border-outline-variant'
                  }`}
                >
                  <span className={`text-caption text-caption font-medium ${selected ? 'text-white/90' : 'text-text-secondary'}`}>
                    {day.weekday}
                  </span>
                  <span className={`text-heading-sm text-heading-sm font-bold my-0.5 ${selected ? 'text-white' : 'text-on-surface'}`}>
                    {day.day}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      selected ? 'bg-white/20 rounded-full px-1.5' : noteTone
                    }`}
                  >
                    {selected ? 'Selected' : day.note}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" className="text-primary text-[20px]" />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                Available Times
              </h3>
            </div>
            <span className="text-caption text-caption text-text-secondary">WAT (GMT+1)</span>
          </div>
          <div className="flex gap-2 mb-3.5 overflow-x-auto no-scrollbar">
            {SPA_TIME_PERIODS.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setPeriodId(period.id)}
                className={`px-3 py-1.5 rounded-full text-caption text-caption whitespace-nowrap transition ${
                  period.id === periodId
                    ? 'bg-primary text-white shadow-sm font-semibold'
                    : 'bg-surface-container-low text-text-secondary hover:text-on-surface font-medium'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {activePeriod.slots.map((slot) => {
              const selected = booking.time === slot.time;
              const booked = slot.status === 'booked';
              if (booked) {
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled
                    className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border border-border-subtle bg-surface-container text-text-tertiary cursor-not-allowed opacity-60"
                  >
                    <span className="text-label-md text-label-md font-medium line-through">{slot.time}</span>
                    <span className="text-[10px] uppercase font-semibold">Booked</span>
                  </button>
                );
              }
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => booking.setTime(slot.time)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition ${
                    selected
                      ? 'bg-primary-container text-white shadow-md ring-2 ring-primary-container ring-offset-1'
                      : 'border border-border-subtle bg-surface-container-lowest text-on-surface hover:border-primary'
                  }`}
                >
                  <span className={`text-label-md text-label-md ${selected ? 'font-bold' : 'font-semibold'}`}>
                    {slot.time}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      selected ? 'text-white/90' : 'text-badge-discount-text font-medium'
                    }`}
                  >
                    {selected ? 'Selected' : 'Available'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="p-4">
          <div className="flex items-center justify-between mb-2">
            <label
              className="text-on-surface text-label-md text-label-md font-bold flex items-center gap-1.5"
              htmlFor="special-notes"
            >
              <Icon name="edit_note" className="text-primary text-[18px]" />
              Special Requests &amp; Skin Sensitivities
            </label>
            <span className="text-caption text-caption text-text-secondary">Optional</span>
          </div>
          <textarea
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle text-on-surface placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-body-md p-3"
            id="special-notes"
            placeholder="e.g., Sensitive to retinol or peel products, prefer quiet relaxation session, allergy to certain oils..."
            rows={3}
            value={booking.notes}
            onChange={(event) => booking.setNotes(event.target.value)}
          />
          <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
            <Icon name="check_circle" className="text-[13px] text-badge-discount-text" />
            Staff is notified prior to session setup for tailored preparation.
          </p>
        </section>
      </main>

      <div className="fixed bottom-0 z-40 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-container-lowest border-t border-border-subtle px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-2xl">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-caption text-caption text-text-secondary leading-tight">Total Payable</p>
            <p className="text-heading-md text-heading-md font-bold text-on-surface">{naira(booking.subtotal)}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-label-sm text-label-sm font-semibold text-primary bg-surface-tint-blue px-2.5 py-1 rounded-lg">
              <Icon name="event" className="text-[16px]" />
              {booking.day.dateShort} @ {booking.time}
            </span>
            <p className="text-caption text-caption text-text-secondary mt-0.5">
              Specialist: {booking.therapist.id === 'any' ? 'Any Available' : booking.therapist.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReview}
          className="w-full h-11 rounded-xl bg-primary-container text-white font-semibold text-button-primary flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-md active:scale-[0.99]"
        >
          <span>Review Booking Details</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
