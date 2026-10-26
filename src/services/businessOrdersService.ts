import { api } from './api/client';

export type OrderStatus = 'new' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'rejected' | 'refunded' | 'partial_refund';
export type BookingStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled';

interface Person {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
}

/** `GET /catalogue/orders` row (business side). Money may arrive as strings. */
export interface BusinessOrder {
  id: string;
  createdAt?: string | null;
  branchId?: string | null;
  branch?: { id?: string; name?: string | null } | null;
  customer?: Person | null;
  trackingToken?: string | null;
  status?: OrderStatus | string | null;
  notes?: string | null;
  tableNumber?: string | null;
  totalAmount?: number | string | null;
  bookingDate?: string | null;
  bookingTime?: string | null;
  items?: {
    id?: string;
    quantity?: number | null;
    priceAtOrder?: number | string | null;
    item?: { name?: string | null; mainImage?: string | null } | null;
    offer?: { title?: string | null } | null;
  }[] | null;
  /** When each status was reached (ISO), e.g. `{ new, processing, ready }`. */
  statusTimeline?: Partial<Record<string, string>> | null;
  source?: string | null;
  paymentStatus?: string | null;
  payment?: { method?: string | null; amountDue?: number | null; amountReceived?: number | null } | null;
  attendedByUser?: Person | null;
}

/** `GET /bookings` row (business side). */
export interface BusinessBooking {
  id: string;
  reference?: string | null;
  status?: BookingStatus | string | null;
  date: string;
  time: string;
  durationMinutes?: number | null;
  branchName?: string | null;
  itemName?: string | null;
  notes?: string | null;
  customer?: Person | null;
  createdAt?: string | null;
}

const asList = <T>(res: T[] | { data: T[] }) => (Array.isArray(res) ? res : res.data ?? []);

export const businessOrdersService = {
  orders: (query: { branchId?: string; status?: string; type?: 'order' | 'booking'; limit?: number } = {}) =>
    api.get<BusinessOrder[] | { data: BusinessOrder[] }>('/catalogue/orders', { params: { ...query } }).then(asList),
  order: (id: string) => api.get<BusinessOrder>(`/catalogue/orders/${id}`),
  setOrderStatus: (id: string, status: OrderStatus) => api.patch<BusinessOrder>(`/catalogue/orders/${id}/status`, { status }),
  bookings: (query: { branchId?: string; status?: string; from?: string; to?: string; limit?: number } = {}) =>
    api.get<BusinessBooking[] | { data: BusinessBooking[] }>('/bookings', { params: { ...query } }).then(asList),
  setBookingStatus: (id: string, status: BookingStatus) => api.patch<BusinessBooking>(`/bookings/${id}/status`, { status }),
};
