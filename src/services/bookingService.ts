import { api } from './api/client';

export interface BookingApiRecord {
  id?: string;
  reference?: string;
  ref?: string;
  status?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  branchId?: string;
  branchName?: string;
  businessName?: string;
  itemId?: string | null;
  itemName?: string;
  notes?: string | null;
  merchant?: {
    logoUrl?: string | null;
    coverImage?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  createdAt?: string;
  customer?: { id?: string; firstName?: string; lastName?: string; phone?: string; name?: string };
}

const extractArray = (payload: unknown): BookingApiRecord[] => {
  if (Array.isArray(payload)) return payload as BookingApiRecord[];
  if (payload && typeof payload === 'object') {
    const container = payload as { data?: unknown; items?: unknown; results?: unknown };
    if (Array.isArray(container.data)) return container.data as BookingApiRecord[];
    if (Array.isArray(container.items)) return container.items as BookingApiRecord[];
    if (Array.isArray(container.results)) return container.results as BookingApiRecord[];
  }
  return [];
};

const normalizeBookingStatus = (value?: string): 'confirmed' | 'cancelled' | 'completed' => {
  const status = String(value ?? '').trim().toLowerCase();
  switch (status) {
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'completed':
    case 'finished':
      return 'completed';
    case 'booked':
    case 'confirmed':
    case 'accepted':
    default:
      return 'confirmed';
  }
};

export interface NormalizedBookingAppointment {
  /** Backend id, used to cancel. */
  id?: string;
  branchId?: string;
  ref: string;
  merchantPhone?: string;
  merchantAddress?: string;
  merchantImage?: string;
  merchantLatitude?: number;
  merchantLongitude?: number;
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

export const normalizeBookingRecord = (
  record: BookingApiRecord | undefined | null,
): NormalizedBookingAppointment | null => {
  if (!record || typeof record !== 'object') return null;

  const status = normalizeBookingStatus(record.status);
  const firstName = record.customer?.firstName ?? '';
  const lastName = record.customer?.lastName ?? '';
  const clientName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';

  const day = record.date ? new Date(`${record.date.slice(0, 10)}T00:00:00`) : null;
  const duration = record.durationMinutes ?? 0;
  const merchant = record.merchant;

  return {
    id: record.id,
    branchId: record.branchId,
    ref: record.reference ?? record.ref ?? record.id ?? `BK-${Date.now()}`,
    merchantName: record.businessName ?? record.branchName ?? '',
    merchantPhone: merchant?.phone ?? undefined,
    merchantAddress: [merchant?.address, merchant?.city].filter(Boolean).join(', ') || undefined,
    merchantImage: merchant?.coverImage ?? merchant?.logoUrl ?? undefined,
    merchantLatitude: merchant?.latitude ?? undefined,
    merchantLongitude: merchant?.longitude ?? undefined,
    clientName,
    clientPhone: record.customer?.phone ?? '',
    serviceNames: record.itemName ? [record.itemName] : [],
    addonNames: [],
    dateISO: record.date ?? '',
    dateLong: day ? day.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '',
    dateShort: day ? day.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' }) : '',
    time: record.time ?? '',
    durationMinutes: duration,
    durationLabel: duration ? `${duration} mins` : '',
    therapistLabel: '',
    notes: record.notes ?? '',
    reminder: true,
    servicesSubtotal: 0,
    discount: 0,
    payable: 0,
    status,
    createdAt: record.createdAt ? new Date(record.createdAt).getTime() : Date.now(),
  };
};

export const bookingService = {
  getAvailability: async (params: Record<string, string | number | boolean | undefined>) =>
    api.get<unknown>('/bookings/availability', { params }),

  getMyBookings: async (params?: Record<string, string | number | boolean | undefined>): Promise<NormalizedBookingAppointment[]> => {
    const response = await api.get<unknown>('/me/bookings', { params });
    return extractArray(response)
      .map((item) => normalizeBookingRecord(item))
      .filter((item): item is NormalizedBookingAppointment => Boolean(item));
  },

  createBooking: async (payload: Record<string, unknown>) => {
    const response = await api.post<BookingApiRecord>('/bookings', payload);
    return normalizeBookingRecord(response);
  },

  cancelBooking: async (id: string, reason?: string) =>
    api.patch<BookingApiRecord>(`/bookings/${encodeURIComponent(id)}/cancel`, reason ? { cancellationReason: reason } : {}),
};
