import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { bookingService } from '../services/bookingService';
import {
  SPA_ADDONS,
  SPA_CLIENT,
  SPA_DEAL_RATE,
  SPA_MERCHANT,
  SPA_SERVICE_LIST,
  SPA_THERAPISTS,
  formatSpaDuration,
  spaDayFrom,
  spaIsSlotAvailable,
  spaNextOpenDay,
  spaParseDate,
  spaSlotKey,
  spaSlotsForDate,
  type SpaAddon,
  type SpaBookedKey,
  type SpaCatalogueService,
  type SpaDay,
  type SpaTherapist,
  type SpaTimePeriod,
} from '../scripts/spaBookingData';

const APPOINTMENTS_KEY = 'vemtap_appointments';

/** A real appointment record created on confirmation (BUG-025). */
export interface SpaAppointment {
  ref: string;
  merchantName: string;
  clientName: string;
  clientPhone: string;
  serviceNames: string[];
  addonNames: string[];
  dateISO: string;
  dateLong: string;
  dateShort: string;
  time: string;
  durationMinutes: number;
  durationLabel: string;
  therapistLabel: string;
  notes: string;
  reminder: boolean;
  servicesSubtotal: number;
  discount: number;
  payable: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
}

export type ConfirmBookingResult = { ok: true; ref: string } | { ok: false; error: string };

export interface BookingValue {
  services: SpaCatalogueService[];
  addons: SpaAddon[];
  therapist: SpaTherapist;
  day: SpaDay;
  dateISO: string;
  time: string;
  notes: string;
  reminder: boolean;
  confirmedRef: string | null;
  servicesSubtotal: number;
  addonSubtotal: number;
  subtotal: number;
  discount: number;
  payable: number;
  durationMinutes: number;
  durationLabel: string;
  therapistLabel: string;
  /** Availability for the selected date + duration, per period. */
  periods: SpaTimePeriod[];
  periodId: string;
  activePeriod: SpaTimePeriod;
  availableTimes: string[];
  timeAvailable: boolean;
  appointments: SpaAppointment[];
  appointmentByRef: (ref: string) => SpaAppointment | undefined;
  setServices: (ids: number[]) => void;
  ensureService: (id: number) => void;
  toggleAddon: (id: string) => void;
  setTherapist: (id: string) => void;
  setDay: (id: string) => void;
  setDayObj: (day: SpaDay) => void;
  setDateISO: (iso: string) => void;
  setTime: (time: string) => void;
  setPeriod: (id: string) => void;
  setNotes: (value: string) => void;
  setReminder: (value: boolean) => void;
  /** Revalidates availability, records the appointment, returns the ref. */
  confirm: () => ConfirmBookingResult;
  /** Cancels a confirmed appointment, releasing its slot. */
  cancelAppointment: (ref: string) => boolean;
  reset: () => void;
}

const BookingContext = createContext<BookingValue | null>(null);

const DEFAULT_SERVICE_IDS = [4, 8];
const PERIOD_ORDER = ['morning', 'afternoon', 'evening'];

function readAppointments(): SpaAppointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SpaAppointment[]) : [];
  } catch {
    return [];
  }
}

function newAppointmentRef(): string {
  return `GS-${Math.floor(10000 + Math.random() * 89999)}`;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [serviceIds, setServiceIds] = useState<number[]>(DEFAULT_SERVICE_IDS);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [therapistId, setTherapistId] = useState('any');
  const [dateISO, setDateISOState] = useState<string>(() => spaNextOpenDay().iso ?? '');
  const [time, setTimeState] = useState('1:15 PM');
  const [periodId, setPeriodId] = useState('afternoon');
  const [notes, setNotesState] = useState('');
  const [reminder, setReminderState] = useState(true);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<SpaAppointment[]>(() => readAppointments());

  useEffect(() => {
    try {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments.slice(0, 60)));
    } catch {
      /* storage unavailable — keep in-memory */
    }
  }, [appointments]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const remoteBookings = await bookingService.getMyBookings({ page: 1, limit: 20 });
        if (remoteBookings.length > 0) {
          setAppointments((prev) => {
            const remoteAsSpa = remoteBookings.map((booking) => ({
              ref: booking.ref,
              merchantName: booking.merchantName,
              clientName: booking.clientName,
              clientPhone: booking.clientPhone,
              serviceNames: booking.serviceNames,
              addonNames: booking.addonNames,
              dateISO: booking.dateISO,
              dateLong: booking.dateLong,
              dateShort: booking.dateShort,
              time: booking.time,
              durationMinutes: booking.durationMinutes,
              durationLabel: booking.durationLabel,
              therapistLabel: booking.therapistLabel,
              notes: booking.notes,
              reminder: booking.reminder,
              servicesSubtotal: booking.servicesSubtotal,
              discount: booking.discount,
              payable: booking.payable,
              status: booking.status,
              createdAt: booking.createdAt,
            }));
            const merged = [...remoteAsSpa, ...prev.filter((item) => !remoteAsSpa.some((remote) => remote.ref === item.ref))];
            localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(merged.slice(0, 60)));
            return merged;
          });
        }
      } catch {
        // Leave local demo data in place when the backend is unavailable.
      }
    };

    void loadAppointments();
  }, []);

  const services = useMemo(
    () =>
      serviceIds
        .map((id) => SPA_SERVICE_LIST.find((service) => service.id === id))
        .filter((service): service is SpaCatalogueService => Boolean(service)),
    [serviceIds],
  );

  const addons = useMemo(
    () =>
      addonIds
        .map((id) => SPA_ADDONS.find((addon) => addon.id === id))
        .filter((addon): addon is SpaAddon => Boolean(addon)),
    [addonIds],
  );

  const therapist = useMemo(
    () => SPA_THERAPISTS.find((item) => item.id === therapistId) ?? SPA_THERAPISTS[0],
    [therapistId],
  );

  const durationMinutes =
    services.reduce((total, service) => total + service.time, 0) +
    addons.reduce((total, addon) => total + addon.minutes, 0);
  const durationLabel = formatSpaDuration(durationMinutes);

  /** Slots reserved by active appointments. */
  const takenSlots = useMemo<SpaBookedKey[]>(
    () =>
      appointments
        .filter((appt) => appt.status === 'confirmed')
        .map((appt) => spaSlotKey(appt.dateISO, appt.time)),
    [appointments],
  );

  const day = useMemo(() => spaDayFrom(spaParseDate(dateISO)), [dateISO]);

  const periods = useMemo(
    () => spaSlotsForDate(dateISO, takenSlots),
    [dateISO, takenSlots],
  );

  const activePeriod = useMemo(
    () => periods.find((period) => period.id === periodId) ?? periods.find((p) => p.id === 'afternoon') ?? periods[0],
    [periods, periodId],
  );

  const availableTimes = useMemo(
    () => activePeriod.slots.filter((slot) => slot.status === 'available').map((slot) => slot.time),
    [activePeriod],
  );

  const timeAvailable = availableTimes.includes(time);

  /** Keep the selected time valid whenever date / duration / conflicts change. */
  useEffect(() => {
    if (timeAvailable) return;
    const available = periods.flatMap((period) => period.slots.filter((slot) => slot.status === 'available'));
    const firstAvailable = available[0];
    if (!firstAvailable) return;
    setTimeState(firstAvailable.time);
    const owning = periods.find((period) =>
      period.slots.some((slot) => slot.time === firstAvailable.time),
    );
    if (owning) setPeriodId(owning.id);
  }, [timeAvailable, periods]);

  const servicesSubtotal = services.reduce((total, service) => total + service.price, 0);
  const addonSubtotal = addons.reduce((total, addon) => total + addon.price, 0);
  const subtotal = servicesSubtotal + addonSubtotal;
  const discount = Math.round(servicesSubtotal * SPA_DEAL_RATE);
  const payable = Math.max(0, subtotal - discount);

  const setServices = useCallback((ids: number[]) => setServiceIds(ids), []);

  const ensureService = useCallback((id: number) => {
    setServiceIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const setTherapist = useCallback((id: string) => setTherapistId(id), []);

  const setDay = useCallback((id: string) => {
    const match = spaParseDate(id);
    if (!Number.isNaN(match.getTime())) setDateISOState(id);
  }, []);

  const setDayObj = useCallback((next: SpaDay) => {
    if (next.iso) setDateISOState(next.iso);
  }, []);

  const setDateISO = useCallback((iso: string) => setDateISOState(iso), []);

  const setTime = useCallback((next: string) => setTimeState(next), []);

  const setPeriod = useCallback((id: string) => setPeriodId(id), []);

  const setNotes = useCallback((value: string) => setNotesState(value), []);
  const setReminder = useCallback((value: boolean) => setReminderState(value), []);

  const appointmentByRef = useCallback(
    (ref: string) => appointments.find((appt) => appt.ref === ref),
    [appointments],
  );

  const confirm = useCallback((): ConfirmBookingResult => {
    if (!services.length) {
      return { ok: false, error: 'Select at least one service before confirming.' };
    }
    // BUG-025: revalidate at confirmation time to avoid double bookings.
    if (!spaIsSlotAvailable(dateISO, time, durationMinutes, takenSlots)) {
      return {
        ok: false,
        error: 'That time slot is no longer available. Please pick another time.',
      };
    }
    let ref = newAppointmentRef();
    const existing = new Set(appointments.map((appt) => appt.ref));
    while (existing.has(ref)) ref = newAppointmentRef();

    const record: SpaAppointment = {
      ref,
      merchantName: SPA_MERCHANT.name,
      clientName: SPA_CLIENT.name,
      clientPhone: SPA_CLIENT.phone,
      serviceNames: services.map((service) => service.name),
      addonNames: addons.map((addon) => addon.name),
      dateISO,
      dateLong: day.dateLong,
      dateShort: day.dateShort,
      time,
      durationMinutes,
      durationLabel,
      therapistLabel: therapist.id === 'any' ? 'Any Available' : `${therapist.name} (${therapist.role})`,
      notes,
      reminder,
      servicesSubtotal,
      discount,
      payable,
      status: 'confirmed',
      createdAt: Date.now(),
    };
    const bookingPayload = {
      branchId: '00000000-0000-0000-0000-000000000000',
      itemId: services[0]?.id ? String(services[0].id) : undefined,
      date: dateISO,
      time,
      notes,
      status: 'confirmed',
      merchantName: SPA_MERCHANT.name,
      clientName: SPA_CLIENT.name,
    };

    setAppointments((prev) => [record, ...prev]);
    setConfirmedRef(ref);

    void bookingService.createBooking(bookingPayload).catch(() => undefined);
    return { ok: true, ref };
  }, [
    services,
    addons,
    dateISO,
    time,
    durationMinutes,
    takenSlots,
    appointments,
    day.dateLong,
    day.dateShort,
    durationLabel,
    therapist,
    notes,
    reminder,
    servicesSubtotal,
    discount,
    payable,
  ]);

  const cancelAppointment = useCallback((ref: string) => {
    let found = false;
    setAppointments((prev) =>
      prev.map((appt) => {
        if (appt.ref !== ref || appt.status !== 'confirmed') return appt;
        found = true;
        return { ...appt, status: 'cancelled' as const };
      }),
    );
    return found;
  }, []);

  const reset = useCallback(() => {
    setServiceIds(DEFAULT_SERVICE_IDS);
    setAddonIds([]);
    setTherapistId('any');
    setDateISOState(spaNextOpenDay().iso ?? '');
    setPeriodId('afternoon');
    setNotes('');
    setConfirmedRef(null);
  }, []);

  const value: BookingValue = {
    services,
    addons,
    therapist,
    day,
    dateISO,
    time,
    notes,
    reminder,
    confirmedRef,
    servicesSubtotal,
    addonSubtotal,
    subtotal,
    discount,
    payable,
    durationMinutes,
    durationLabel,
    therapistLabel: therapist.id === 'any' ? 'Any Available' : `${therapist.name} (${therapist.role})`,
    periods,
    periodId,
    activePeriod,
    availableTimes,
    timeAvailable,
    appointments,
    appointmentByRef,
    setServices,
    ensureService,
    toggleAddon,
    setTherapist,
    setDay,
    setDayObj,
    setDateISO,
    setTime,
    setPeriod,
    setNotes,
    setReminder,
    confirm,
    cancelAppointment,
    reset,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingValue {
  const value = useContext(BookingContext);
  if (!value) throw new Error('useBooking must be used within BookingProvider');
  return value;
}

export { PERIOD_ORDER };
