import { useSyncExternalStore } from 'react';
import type { PosOrderType } from '../../services/posService';

export interface TicketLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  /** Stock on hand when added; null when the item does not track stock. */
  stock: number | null;
}

export interface Ticket {
  lines: TicketLine[];
  customer: { id: string; name: string } | null;
  orderType: PosOrderType;
  cartDiscount: number;
  note: string;
  /** Set when the ticket was resumed from a held sale (deleted once charged). */
  heldSaleId: string | null;
}

const KEY = 'vemtap_pos_ticket';
const EMPTY: Ticket = { lines: [], customer: null, orderType: 'dine_in', cartDiscount: 0, note: '', heldSaleId: null };

const read = (): Ticket => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Ticket) } : EMPTY;
  } catch {
    return EMPTY;
  }
};

let state: Ticket = read();
const listeners = new Set<() => void>();
const set = (next: Ticket) => {
  state = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: the ticket still lives for this page view.
  }
  listeners.forEach((listener) => listener());
};

/** The ticket being rung up — survives navigation and reloads within the tab. */
export const ticketStore = {
  get: () => state,
  addLine(line: Omit<TicketLine, 'quantity'>) {
    const existing = state.lines.find((l) => l.productId === line.productId);
    set({
      ...state,
      lines: existing
        ? state.lines.map((l) => (l.productId === line.productId ? { ...l, quantity: l.quantity + 1 } : l))
        : [...state.lines, { ...line, quantity: 1 }],
    });
  },
  setQuantity(productId: string, quantity: number) {
    set({ ...state, lines: quantity <= 0 ? state.lines.filter((l) => l.productId !== productId) : state.lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)) });
  },
  patch(patch: Partial<Ticket>) {
    set({ ...state, ...patch });
  },
  load(ticket: Partial<Ticket>) {
    set({ ...EMPTY, ...ticket });
  },
  clear() {
    set(EMPTY);
  },
};

export function usePosTicket(): Ticket {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    ticketStore.get,
    ticketStore.get,
  );
}

export const ticketSubtotal = (ticket: Ticket) => ticket.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
export const ticketCount = (ticket: Ticket) => ticket.lines.reduce((sum, l) => sum + l.quantity, 0);
