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

export const normalizeBookingRecord = (
  record: BookingApiRecord | undefined | null,
): NormalizedBookingAppointment | null => {
  if (!record || typeof record !== 'object') return null;

  const status = normalizeBookingStatus(record.status);
  const firstName = record.customer?.firstName ?? '';
  const lastName = record.customer?.lastName ?? '';
  const clientName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';

  return {
    ref: record.reference ?? record.ref ?? record.id ?? `BK-${Date.now()}`,
    merchantName: record.businessName ?? record.branchName ?? 'VEMTAP merchant',
    clientName,
    clientPhone: record.customer?.phone ?? '',
    serviceNames: record.itemName ? [record.itemName] : ['Booked service'],
    addonNames: [],
    dateISO: record.date ?? new Date().toISOString().slice(0, 10),
    dateLong: record.date ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dateShort: record.date ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: record.time ?? '1:00 PM',
    durationMinutes: record.durationMinutes ?? 60,
    durationLabel: `${Math.max(record.durationMinutes ?? 60, 30)} mins`,
    therapistLabel: 'Assigned specialist',
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
  getMyBookings: async (params?: Record<string, string | number | boolean | undefined>): Promise<NormalizedBookingAppointment[]> => {
    try {
      const response = await api.get<unknown>('/me/bookings', { params });
      return extractArray(response)
        .map((item) => normalizeBookingRecord(item))
        .filter((item): item is NormalizedBookingAppointment => Boolean(item));
    } catch (error) {
      const fallback = await api.get<unknown>('/bookings', { params }).catch(() => null);
      if (!fallback) throw error;
      return extractArray(fallback)
        .map((item) => normalizeBookingRecord(item))
        .filter((item): item is NormalizedBookingAppointment => Boolean(item));
    }
  },

  createBooking: async (payload: Record<string, unknown>) => {
    const response = await api.post<BookingApiRecord>('/bookings', payload);
    return normalizeBookingRecord(response);
  },

  cancelBooking: async (id: string, reason?: string) =>
    api.patch<BookingApiRecord>(`/bookings/${encodeURIComponent(id)}/cancel`, reason ? { cancellationReason: reason } : {}),
};
