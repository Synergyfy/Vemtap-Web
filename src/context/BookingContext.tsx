import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  SPA_ADDONS,
  SPA_DAYS,
  SPA_DEAL_RATE,
  SPA_SERVICE_LIST,
  SPA_THERAPISTS,
  formatSpaDuration,
  type SpaAddon,
  type SpaCatalogueService,
  type SpaDay,
  type SpaTherapist,
} from '../scripts/spaBookingData';

export interface BookingValue {
  services: SpaCatalogueService[];
  addons: SpaAddon[];
  therapist: SpaTherapist;
  day: SpaDay;
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
  setServices: (ids: number[]) => void;
  ensureService: (id: number) => void;
  toggleAddon: (id: string) => void;
  setTherapist: (id: string) => void;
  setDay: (id: string) => void;
  setDayObj: (day: SpaDay) => void;
  setTime: (time: string) => void;
  setNotes: (value: string) => void;
  setReminder: (value: boolean) => void;
  confirm: () => string;
}

const BookingContext = createContext<BookingValue | null>(null);

const DEFAULT_SERVICE_IDS = [4, 8];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [serviceIds, setServiceIds] = useState<number[]>(DEFAULT_SERVICE_IDS);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [therapistId, setTherapistId] = useState('any');
  const [dayId, setDayId] = useState('thu-17');
  const [customDay, setCustomDay] = useState<SpaDay | null>(null);
  const [time, setTime] = useState('1:15 PM');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(true);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

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

  const day = useMemo(() => {
    if (customDay) return customDay;
    return SPA_DAYS.find((item) => item.id === dayId) ?? SPA_DAYS[1];
  }, [customDay, dayId]);

  const servicesSubtotal = services.reduce((total, service) => total + service.price, 0);
  const addonSubtotal = addons.reduce((total, addon) => total + addon.price, 0);
  const subtotal = servicesSubtotal + addonSubtotal;
  const discount = Math.round(servicesSubtotal * SPA_DEAL_RATE);
  const payable = Math.max(0, subtotal - discount);
  const durationMinutes =
    services.reduce((total, service) => total + service.time, 0) +
    addons.reduce((total, addon) => total + addon.minutes, 0);
  const durationLabel = formatSpaDuration(durationMinutes);

  const setServices = useCallback((ids: number[]) => setServiceIds(ids), []);

  const ensureService = useCallback((id: number) => {
    setServiceIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const setTherapist = useCallback((id: string) => setTherapistId(id), []);
  const setDay = useCallback((id: string) => {
    setCustomDay(null);
    setDayId(id);
  }, []);
  const setDayObj = useCallback((next: SpaDay) => setCustomDay(next), []);

  const confirm = useCallback(() => {
    const ref = `GS-${Math.floor(10000 + Math.random() * 89999)}`;
    setConfirmedRef(ref);
    return ref;
  }, []);

  const value: BookingValue = {
    services,
    addons,
    therapist,
    day,
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
    setServices,
    ensureService,
    toggleAddon,
    setTherapist,
    setDay,
    setDayObj,
    setTime,
    setNotes,
    setReminder,
    confirm,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingValue {
  const value = useContext(BookingContext);
  if (!value) throw new Error('useBooking must be used within BookingProvider');
  return value;
}
