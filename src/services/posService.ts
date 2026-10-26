import { api } from './api/client';

type Money = number | string;
export type PosPaymentMethod = 'cash' | 'transfer' | 'card' | 'split';
export type PosOrderType = 'dine_in' | 'takeaway';
export type PosSaleStatus = 'completed' | 'refunded' | 'partial_refund';
export type KitchenStatus = 'new' | 'processing' | 'ready' | 'completed';

export const money = (value?: Money | null) => Number(value) || 0;

interface Person {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface PosTill {
  id: string;
  branchId: string;
  name: string;
  code: string;
  status: 'active' | 'idle' | 'offline' | 'disabled';
  deviceLabel?: string | null;
  occupant?: { sessionId: string; cashierId: string; cashierName?: string | null; openedAt: string } | null;
  todaySales?: Money | null;
  todayTransactions?: number | null;
}

export interface RegisterSession {
  id: string;
  branchId: string;
  tillId?: string | null;
  openedAt: string;
  closedAt?: string | null;
  openingCash?: Money | null;
  expectedCash?: Money | null;
  totalSales?: Money | null;
  transactionCount?: number | null;
  status: 'open' | 'closed';
  countedCash?: Money | null;
  variance?: Money | null;
  till?: { id: string; name?: string | null; code?: string | null } | null;
}

export interface ZReport {
  registerSessionId: string;
  status: string;
  openedAt: string;
  closedAt?: string | null;
  openingCash?: Money | null;
  totalSales?: Money | null;
  transactionCount?: number | null;
  cashSales?: Money | null;
  cashDrops?: Money | null;
  expectedCash?: Money | null;
  countedCash?: Money | null;
  variance?: Money | null;
  paymentBreakdown?: Record<string, Money> | null;
}

export interface BranchSummary {
  branchId: string;
  name?: string | null;
  todaySales?: Money | null;
  todayTransactions?: number | null;
  tillCount?: number | null;
  openSessions?: number | null;
  current?: boolean | null;
}

export interface PosSaleItem {
  id: string;
  productId?: string | null;
  productName?: string | null;
  sku?: string | null;
  unitPrice?: Money | null;
  quantity: number;
  discount?: Money | null;
  totalPrice?: Money | null;
  refundedQuantity?: number | null;
}

export interface PosSale {
  id: string;
  receiptNumber: string;
  branchId: string;
  cashierName?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  subtotal?: Money | null;
  discountAmount?: Money | null;
  tax?: Money | null;
  serviceCharge?: Money | null;
  packagingFee?: Money | null;
  tipAmount?: Money | null;
  total?: Money | null;
  amountPaid?: Money | null;
  change?: Money | null;
  paymentMethod: string;
  status: PosSaleStatus;
  orderType?: PosOrderType;
  createdAt?: string | null;
  notes?: string | null;
  itemCount?: number | null;
  pointsEarned?: number | null;
  items?: PosSaleItem[] | null;
  splitPayments?: { method: string; amount?: Money | null; payer?: string | null }[] | null;
  customer?: Person | null;
  branch?: { id: string; name?: string | null; address?: string | null } | null;
  receipt?: {
    businessName?: string | null;
    header?: string | null;
    footer?: string | null;
    address?: string | null;
    phone?: string | null;
    tin?: string | null;
    taxLabel?: string | null;
  } | null;
}

export interface PosSalesPage {
  data: PosSale[];
  total?: number | null;
  hasNextPage?: boolean | null;
  meta?: { counts?: Record<string, number> | null; grossTotal?: Money | null; byMethod?: Record<string, Money> | null } | null;
}

export interface PosSalesQuery {
  page?: number;
  limit?: number;
  status?: PosSaleStatus;
  paymentMethod?: PosPaymentMethod;
  branchId?: string;
  sessionId?: string;
  search?: string;
}

export interface NewSaleInput {
  branchId: string;
  items: { productId: string; quantity: number; discount?: number }[];
  payment: {
    method: PosPaymentMethod;
    amountPaid: number;
    change?: number;
    splitDetails?: { method: Exclude<PosPaymentMethod, 'split'>; amount: number }[];
  };
  cartDiscountAmount?: number;
  customerId?: string;
  notes?: string;
  clientRef?: string;
  orderedAt?: string;
  orderType?: PosOrderType;
  waiveServiceCharge?: boolean;
}

export interface SaleQuote {
  subtotal?: Money | null;
  discountAmount?: Money | null;
  tax?: Money | null;
  serviceCharge?: Money | null;
  packagingFee?: Money | null;
  total?: Money | null;
}

export interface HeldSale {
  id: string;
  branchId: string;
  total?: Money | null;
  note?: string | null;
  heldAt: string;
  orderType?: PosOrderType;
  discountAmount?: Money | null;
  customer?: Person | null;
  items?: { productId: string; productName?: string | null; unitPrice?: Money | null; quantity: number }[] | null;
}

export interface PosCustomer {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  totalSpent?: Money | null;
  totalVisits?: number | null;
  pointsBalance?: number | null;
  tier?: string | null;
  firstVisitAt?: string | null;
  lastVisitAt?: string | null;
  segments?: PosCustomerSegment[];
}

export type PosCustomerSegment = 'vip' | 'new' | 'lapsed';

export interface PosCustomerPage {
  data: PosCustomer[];
  segmentCounts: Record<'all' | PosCustomerSegment, number>;
  total: number;
  page: number;
  limit: number;
}

/** `GET /pos/customers/:id` — stats and the last ten purchases at this business. */
export interface PosCustomerDetail extends PosCustomer {
  createdAt?: string | null;
  averageOrderValue?: Money | null;
  recentPurchases: {
    id: string;
    date: string;
    total: number;
    items: number;
    itemNames: string[];
    paymentMethod?: string | null;
    receipt?: string | null;
  }[];
}

export interface PosCustomerRewards {
  pointsBalance: number;
  tier?: string | null;
  data: {
    id: string;
    name: string;
    description?: string | null;
    pointsRequired: number;
    affordable: boolean;
    pointsShort: number;
  }[];
}

/** The ticket a till shows on its customer display (priced by the server). */
export interface PosDisplayTicket {
  reference: string | null;
  tableNumber: string | null;
  customerName: string | null;
  orderType: PosOrderType;
  lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  tax: number;
  serviceCharge: number;
  packagingFee: number;
  total: number;
  updatedAt: string;
}

export interface PosTipOption {
  percent: number;
  amount: number;
}

/** `GET /pos/display/:tillId` — everything a customer display paints. */
export interface PosDisplayState {
  till: { id: string; name: string; code?: string | null };
  venue: { name: string | null; logo: string | null; branchName: string | null };
  taxLabel: string;
  paymentMethods: { cash: boolean; card: boolean; transfer: boolean; oneTap: boolean };
  transfer: { bankName: string | null; accountNumber: string | null; accountName: string | null } | null;
  ticket: PosDisplayTicket | null;
  tipOptions: PosTipOption[];
}

export interface KitchenOrder {
  id: string;
  reference: string;
  status: string;
  tableNumber?: string | null;
  notes?: string | null;
  guestName?: string | null;
  totalAmount?: Money | null;
  paid?: boolean | null;
  createdAt: string;
  elapsedMinutes?: number | null;
  lines?: { name: string; quantity: number }[] | null;
}

export interface KitchenStream {
  data: KitchenOrder[];
  counts?: Partial<Record<KitchenStatus, number>> | null;
  averagePrepMinutes?: number | null;
}

export interface StaffPinRow {
  userId: string;
  name?: string | null;
  role?: string | null;
  hasPin?: boolean | null;
  isSupervisor?: boolean | null;
  lockedUntil?: string | null;
}

export interface BatchSyncResult {
  clientRef?: string | null;
  status: 'synced' | 'duplicate' | 'conflict' | 'failed';
  saleId?: string | null;
  receiptNumber?: string | null;
  error?: string | null;
}

export const personName = (p?: Person | null, fallback = 'Walk-in customer') =>
  [p?.firstName, p?.lastName].filter(Boolean).join(' ') || p?.phone || p?.email || fallback;

const scope = (branchId?: string | null) => ({ params: branchId ? { branchId } : {} });

/** `/pos/*` — register sessions, sales, held tickets, customers, kitchen, stock and staff PINs. */
export const posService = {
  registerStatus: () => api.get<{ isOpen: boolean; session?: RegisterSession | null }>('/pos/register/status'),
  openRegister: (body: { openingCash: number; tillId?: string }) => api.post<RegisterSession>('/pos/register/open', body),
  closeRegister: (body: { countedCash?: number }) => api.post<RegisterSession>('/pos/register/close', body),
  cashDrop: (body: { amount: number; reason: string }) => api.post<unknown>('/pos/register/cash-drop', body),
  zReport: () => api.get<ZReport>('/pos/register/z-report'),
  tills: (branchId?: string | null) => api.get<{ data: PosTill[] }>('/pos/tills', scope(branchId)).then((res) => res.data ?? []),
  createTill: (body: { branchId: string; name: string; code?: string }) => api.post<PosTill>('/pos/tills', body),
  branchSummary: () => api.get<BranchSummary[]>('/pos/branches/summary'),

  sales: (query: PosSalesQuery) => api.get<PosSalesPage>('/pos/sales', { params: { ...query } }),
  sale: (id: string) => api.get<PosSale>(`/pos/sales/${id}`),
  completeSale: (body: NewSaleInput) => api.post<PosSale>('/pos/sales', body),
  batchSync: (body: NewSaleInput[]) => api.post<BatchSyncResult[]>('/pos/sales/batch-sync', body),
  refundSale: (
    id: string,
    body: { status: 'refunded' | 'partial_refund'; reason?: string; refundItems?: { saleItemId: string; quantity: number }[]; overrideToken?: string },
  ) =>
    api.patch<PosSale>(`/pos/sales/${id}/status`, body),
  /**
   * Server totals for a ticket (tax, service charge, packaging), via the split
   * preview. It needs two payers; with an equal split the ticket totals match.
   */
  quote: (body: {
    lines: { id: string; name: string; quantity: number; unitPrice: number }[];
    discountAmount?: number;
    orderType?: PosOrderType;
    waiveServiceCharge?: boolean;
  }) => api.post<SaleQuote>('/pos/sales/split-preview', { ...body, mode: 'equal', people: [{ name: 'A' }, { name: 'B' }] }),
  heldSales: (branchId?: string | null) => api.get<HeldSale[]>('/pos/sales/held', scope(branchId)),
  holdSale: (body: {
    branchId: string;
    customerId?: string;
    note?: string;
    discountAmount?: number;
    orderType?: PosOrderType;
    items: { productId: string; productName: string; unitPrice: number; quantity: number; totalPrice: number }[];
  }) => api.post<HeldSale>('/pos/sales/hold', body),
  deleteHeldSale: (id: string) => api.del<unknown>(`/pos/sales/held/${id}`),

  customers: (query: { search?: string; branchId?: string; limit?: number }) =>
    api.get<{ data: PosCustomer[] }>('/pos/customers', { params: { limit: 10, ...query } }).then((res) => res.data ?? []),
  customerPage: (query: { search?: string; segment?: PosCustomerSegment; branchId?: string; page?: number; limit?: number }) =>
    api.get<PosCustomerPage>('/pos/customers', { params: { limit: 20, ...query } }),
  customer: (id: string) => api.get<PosCustomerDetail>(`/pos/customers/${id}`),
  customerRewards: (id: string, branchId?: string | null) => api.get<PosCustomerRewards>(`/pos/customers/${id}/rewards`, scope(branchId)),

  display: (tillId: string) => api.get<PosDisplayState>(`/pos/display/${tillId}`),
  showOnDisplay: (
    tillId: string,
    body: {
      lines: { name: string; quantity: number; unitPrice: number }[];
      discountAmount?: number;
      orderType?: PosOrderType;
      customerName?: string;
    },
  ) => api.put<PosDisplayTicket>(`/pos/display/${tillId}/ticket`, body),
  /** With `saleId`, the display moves on to the tip and rating screen for that sale. */
  clearDisplay: (tillId: string, saleId?: string) =>
    api.del<{ cleared: boolean }>(`/pos/display/${tillId}/ticket`, { params: saleId ? { saleId } : {} }),
  displayTipRating: (tillId: string, body: { saleId?: string; tipAmount: number; rating?: number }) =>
    api.post<unknown>(`/pos/display/${tillId}/tip-rating`, body),

  kitchen: (branchId?: string | null) => api.get<KitchenStream>('/pos/kitchen/orders', scope(branchId)),
  setKitchenStatus: (id: string, status: KitchenStatus) => api.patch<unknown>(`/pos/kitchen/orders/${id}/status`, { status }),

  adjustStock: (productId: string, body: { quantity: number; reason?: string }) => api.patch<unknown>(`/pos/products/${productId}/stock`, body),

  staffPins: () => api.get<{ data: StaffPinRow[] }>('/pos/staff-pins').then((res) => res.data ?? []),
  setStaffPin: (userId: string, body: { pin: string; isSupervisor?: boolean }) => api.put<unknown>(`/pos/staff-pins/${userId}`, body),
  removeStaffPin: (userId: string) => api.del<unknown>(`/pos/staff-pins/${userId}`),
  /** Owner/manager hand-awards loyalty points to a customer at a branch. */
  awardPoints: (body: { userId: string; points: number }, branchId: string) =>
    api.post<unknown>('/loyalty/earn/manual', body, { params: { branchId } }),
  /** Supervisor approval: a short-lived token for one action (refund, void…). */
  verifyOverride: (body: { pin: string; action: 'void' | 'refund' | 'reprint' | 'drawer_open' | 'discount'; referenceId?: string; reason?: string }) =>
    api.post<{ overrideToken: string }>('/pos/staff-pins/verify', body),
};
