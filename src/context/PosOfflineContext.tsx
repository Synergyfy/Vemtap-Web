import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * POS offline queue.
 *
 * The till must keep taking payments when the network drops. Orders completed
 * while offline are queued locally (localStorage, so a reload doesn't lose
 * them) and pushed the moment connectivity returns — or straight away when the
 * cashier hits "Sync Online".
 *
 * There is no backend yet, so "syncing" is a simulated upload. The queue drains
 * in order, each item flips to `synced`, and the ledger is kept so the cashier
 * can see what went out.
 */

export interface OfflineOrder {
  /** Stable id — reused as the sync record id. */
  id: string;
  /** Local reference shown on the receipt, e.g. `POS-10842`. */
  ref: string;
  /** Total charged, in NGN. */
  total: number;
  /** Human tender label, e.g. `Cash`, `Card / POS`. */
  tender: string;
  /** Itemised ticket, pre-rendered so it survives a reload. */
  items: string;
  /** Epoch ms when the sale was completed on this till. */
  takenAt: number;
  /** Set once the queue drains this order. */
  syncedAt?: number;
}

export type SyncStatus = 'idle' | 'syncing';

interface PosOfflineContextValue {
  /** Live connectivity, tracked from the browser online/offline events. */
  isOnline: boolean;
  /** Orders taken while offline that have not reached the server yet. */
  queue: OfflineOrder[];
  /** Orders still waiting to upload. */
  pendingCount: number;
  /** True while a sync pass is running. */
  isSyncing: boolean;
  /** Epoch ms of the last successful sync, null if never. */
  lastSyncedAt: number | null;
  /** Short human status line for banners, e.g. `Offline · 3 sales waiting`. */
  statusLabel: string;
  /** Park a completed sale locally because the till is offline. */
  enqueue: (order: Omit<OfflineOrder, 'id' | 'takenAt' | 'syncedAt'>) => void;
  /** Push the queue now. Resolves when the pass finishes. */
  syncNow: () => Promise<void>;
  /** Clear the synced ledger (not the pending queue). */
  clearSynced: () => void;
}

const STORAGE_KEY = 'vemtap.pos.offlineQueue';
const SYNC_PER_ORDER_MS = 450;

const PosOfflineContext = createContext<PosOfflineContextValue | null>(null);

const readQueue = (): OfflineOrder[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is OfflineOrder => {
      const candidate = item as Partial<OfflineOrder>;
      return typeof candidate?.id === 'string' && typeof candidate?.ref === 'string';
    });
  } catch {
    return [];
  }
};

const writeQueue = (queue: OfflineOrder[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or blocked — the in-memory queue still works for this session.
  }
};

export function PosOfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false,
  );
  const [queue, setQueue] = useState<OfflineOrder[]>(() => readQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const syncingRef = useRef(false);

  // Track connectivity. Browsers fire these when the connection actually
  // changes; polling navigator.onLine covers cases where it doesn't.
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    const poll = window.setInterval(() => setIsOnline(navigator.onLine !== false), 5000);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.clearInterval(poll);
    };
  }, []);

  const persist = useCallback((next: OfflineOrder[]) => {
    setQueue(next);
    writeQueue(next);
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    const hasWork = queue.some((order) => !order.syncedAt);
    if (!hasWork) {
      setLastSyncedAt(Date.now());
      return;
    }
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      // Drain in take-order so the server sees a monotonic stream.
      const ordered = [...queue].sort((a, b) => a.takenAt - b.takenAt);
      for (const order of ordered) {
        if (order.syncedAt) continue;
        // eslint-disable-next-line no-await-in-loop -- deliberate one-at-a-time upload
        await new Promise((resolve) => window.setTimeout(resolve, SYNC_PER_ORDER_MS));
        setQueue((current) => {
          const next = current.map((item) =>
            item.id === order.id ? { ...item, syncedAt: Date.now() } : item,
          );
          writeQueue(next);
          return next;
        });
      }
      setLastSyncedAt(Date.now());
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [queue]);

  // Auto-sync the moment connectivity comes back with work waiting.
  const autoSyncRef = useRef(syncNow);
  autoSyncRef.current = syncNow;
  useEffect(() => {
    if (!isOnline) return;
    const hasWork = queue.some((order) => !order.syncedAt);
    if (!hasWork) return;
    const timer = window.setTimeout(() => {
      void autoSyncRef.current();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [isOnline, queue]);

  const enqueue = useCallback(
    (order: Omit<OfflineOrder, 'id' | 'takenAt' | 'syncedAt'>) => {
      const entry: OfflineOrder = {
        ...order,
        id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        takenAt: Date.now(),
      };
      persist([...queue, entry]);
    },
    [persist, queue],
  );

  const clearSynced = useCallback(() => {
    persist(queue.filter((order) => !order.syncedAt));
  }, [persist, queue]);

  const pendingCount = queue.filter((order) => !order.syncedAt).length;

  const statusLabel = useMemo(() => {
    if (!isOnline) {
      return pendingCount > 0
        ? `Offline · ${pendingCount} sale${pendingCount === 1 ? '' : 's'} waiting to sync`
        : 'Offline · sales will queue locally';
    }
    if (isSyncing) {
      return pendingCount > 0 ? `Syncing ${pendingCount} sale${pendingCount === 1 ? '' : 's'}…` : 'Syncing…';
    }
    if (pendingCount > 0) return `${pendingCount} sale${pendingCount === 1 ? '' : 's'} pending sync`;
    return lastSyncedAt
      ? `Online · synced ${new Date(lastSyncedAt).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}`
      : 'Online · all sales synced';
  }, [isOnline, isSyncing, lastSyncedAt, pendingCount]);

  const value = useMemo<PosOfflineContextValue>(
    () => ({
      isOnline,
      queue,
      pendingCount,
      isSyncing,
      lastSyncedAt,
      statusLabel,
      enqueue,
      syncNow,
      clearSynced,
    }),
    [isOnline, queue, pendingCount, isSyncing, lastSyncedAt, statusLabel, enqueue, syncNow, clearSynced],
  );

  return <PosOfflineContext.Provider value={value}>{children}</PosOfflineContext.Provider>;
}

export function usePosOffline(): PosOfflineContextValue {
  const ctx = useContext(PosOfflineContext);
  if (!ctx) throw new Error('usePosOffline must be used inside <PosOfflineProvider>');
  return ctx;
}
