import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { posService, type PosDisplayState, type PosDisplayTicket, type PosTipOption } from '../../services/posService';
import { socketService } from '../../services/socketService';
import type { Ticket } from './usePosTicket';

export const posDisplayKey = (tillId: string) => ['pos', 'display', tillId] as const;

/**
 * A till's customer display: loaded once, then kept current by the `/pos`
 * socket (`ticket.updated`, `ticket.cleared`, `payment.completed`). A slow
 * poll covers a dropped socket. `onPaid` fires when the till settles a sale.
 */
export function usePosDisplayState(tillId: string | null, onPaid: (saleId: string | null) => void) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: posDisplayKey(tillId ?? 'none'),
    queryFn: () => posService.display(tillId as string),
    enabled: hasApiConfig() && Boolean(tillId),
    refetchInterval: 15_000,
  });
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (!tillId) return;
    const socket = socketService.connect('/pos');
    if (!socket) return;
    // The server finishes authenticating a new connection asynchronously, so an
    // early join can be refused ({ ok: false }); retry until it is accepted.
    let retry: number | undefined;
    let attempts = 0;
    const join = () => {
      window.clearTimeout(retry);
      socket.emit('till.join', { tillId }, (res?: { ok?: boolean }) => {
        if (!res?.ok && attempts++ < 5) retry = window.setTimeout(join, 800);
      });
    };
    const patch = (next: Partial<PosDisplayState>) =>
      queryClient.setQueryData<PosDisplayState>(posDisplayKey(tillId), (current) => (current ? { ...current, ...next } : current));
    const onTicket = (payload: { ticket: PosDisplayTicket; tipOptions: PosTipOption[] }) =>
      patch({ ticket: payload.ticket, tipOptions: payload.tipOptions });
    const onCleared = () => patch({ ticket: null, tipOptions: [] });
    const onPaidEvent = (payload: { saleId?: string | null }) => onPaidRef.current(payload?.saleId ?? null);

    if (socket.connected) join();
    const onConnect = () => {
      attempts = 0;
      join();
    };
    socket.on('connect', onConnect);
    socket.on('ticket.updated', onTicket);
    socket.on('ticket.cleared', onCleared);
    socket.on('payment.completed', onPaidEvent);
    return () => {
      window.clearTimeout(retry);
      socket.emit('till.leave', { tillId });
      socket.off('connect', onConnect);
      socket.off('ticket.updated', onTicket);
      socket.off('ticket.cleared', onCleared);
      socket.off('payment.completed', onPaidEvent);
    };
  }, [tillId, queryClient]);

  return query;
}

/**
 * Mirrors the register's ticket onto its till's customer display, debounced.
 * Call `settle(saleId)` when a sale completes so the display thanks the
 * customer and offers a tip for that sale.
 */
export function usePosDisplayMirror(ticket: Ticket, tillId: string | null | undefined) {
  const shown = useRef(false);
  const key = JSON.stringify([
    ticket.lines.map((line) => [line.name, line.quantity, line.unitPrice]),
    ticket.cartDiscount,
    ticket.orderType,
    ticket.customer?.name ?? null,
  ]);

  useEffect(() => {
    if (!tillId || !hasApiConfig()) return;
    const timer = window.setTimeout(() => {
      if (!ticket.lines.length) {
        if (!shown.current) return;
        shown.current = false;
        void posService.clearDisplay(tillId).catch(() => undefined);
        return;
      }
      shown.current = true;
      void posService
        .showOnDisplay(tillId, {
          lines: ticket.lines.map((line) => ({ name: line.name.slice(0, 120), quantity: line.quantity, unitPrice: line.unitPrice })),
          discountAmount: ticket.cartDiscount || undefined,
          orderType: ticket.orderType,
          customerName: ticket.customer?.name,
        })
        .catch(() => undefined);
    }, 400);
    return () => window.clearTimeout(timer);
    // `key` captures every ticket field the display shows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tillId]);

  return {
    settle: (saleId: string | null) => {
      if (!tillId || !hasApiConfig() || !shown.current) return;
      shown.current = false;
      void posService.clearDisplay(tillId, saleId ?? undefined).catch(() => undefined);
    },
  };
}
