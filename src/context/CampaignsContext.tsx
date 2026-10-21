import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageCampaignsService } from '../services/messageCampaignsService';
import { apiErrorMessage } from '../services/errorMessages';
import {
  buildSeedCampaigns,
  duplicateCampaign,
  type CampaignChannel,
  type CampaignRecord,
} from '../scripts/campaigns/campaignsData';

/**
 * Local store for SMS and Email campaigns (drafts, scheduled, queued, sent).
 *
 * Frontend-only: everything lives in React state and mirrors into
 * localStorage so a draft survives navigation and reloads.
 * BACKEND GAP — persistence, scheduling execution, sending and delivery events
 * must move to the server; the shape of CampaignRecord is designed so an API
 * can replace this context without the screens changing.
 */

const STORAGE_KEY = 'vemtap_campaigns_v1';

const STORAGE_AVAILABLE = typeof window !== 'undefined';

const readStored = (): CampaignRecord[] | null => {
  if (!STORAGE_AVAILABLE) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CampaignRecord[]) : null;
  } catch {
    return null;
  }
};

const writeStored = (campaigns: CampaignRecord[]): void => {
  if (!STORAGE_AVAILABLE) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch {
    // storage unavailable — state stays in memory only
  }
};

export interface CampaignsContextValue {
  campaigns: CampaignRecord[];
  listForChannel: (channel: CampaignChannel) => CampaignRecord[];
  findCampaign: (id: string) => CampaignRecord | undefined;
  /** Insert or replace a campaign (used by every save point in the builder). */
  upsertCampaign: (campaign: CampaignRecord) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaignById: (id: string) => CampaignRecord | undefined;
  /** Cancelling a scheduled campaign returns it to drafts. */
  cancelScheduledCampaign: (id: string) => void;
  resetCampaigns: () => void;
  /** Set by the live store: load state and the last save error. */
  live?: {
    isLoading: boolean;
    error: string | null;
    retry: () => void;
    /**
     * Saves the campaign (as a draft, or scheduled) and asks the server to send
     * it to these customers. Resolves with the campaign as the server now has it.
     */
    send: (campaign: CampaignRecord, customerIds: string[]) => Promise<CampaignRecord>;
  };
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() => readStored() ?? buildSeedCampaigns());

  useEffect(() => {
    writeStored(campaigns);
  }, [campaigns]);

  const upsertCampaign = useCallback((campaign: CampaignRecord) => {
    setCampaigns((current) => {
      const index = current.findIndex((entry) => entry.id === campaign.id);
      if (index === -1) return [campaign, ...current];
      const next = [...current];
      next[index] = campaign;
      return next;
    });
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const duplicateCampaignById = useCallback(
    (id: string): CampaignRecord | undefined => {
      const source = campaigns.find((entry) => entry.id === id);
      if (!source) return undefined;
      const copy = duplicateCampaign(source);
      setCampaigns((current) => [copy, ...current]);
      return copy;
    },
    [campaigns],
  );

  const cancelScheduledCampaign = useCallback((id: string) => {
    setCampaigns((current) =>
      current.map((entry) =>
        entry.id === id && entry.status === 'scheduled'
          ? {
              ...entry,
              status: 'draft',
              scheduledAt: undefined,
              updatedAt: Date.now(),
              history: [
                ...entry.history,
                { at: Date.now(), kind: 'cancelled' as const, label: 'Schedule cancelled — returned to drafts' },
              ],
            }
          : entry,
      ),
    );
  }, []);

  const resetCampaigns = useCallback(() => setCampaigns(buildSeedCampaigns()), []);

  const findCampaign = useCallback((id: string) => campaigns.find((entry) => entry.id === id), [campaigns]);

  const listForChannel = useCallback(
    (channel: CampaignChannel) => campaigns.filter((entry) => entry.channel === channel),
    [campaigns],
  );

  const value = useMemo<CampaignsContextValue>(
    () => ({
      campaigns,
      listForChannel,
      findCampaign,
      upsertCampaign,
      deleteCampaign,
      duplicateCampaignById,
      cancelScheduledCampaign,
      resetCampaigns,
    }),
    [campaigns, listForChannel, findCampaign, upsertCampaign, deleteCampaign, duplicateCampaignById, cancelScheduledCampaign, resetCampaigns],
  );

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}

export function useCampaigns(): CampaignsContextValue {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns must be used within a CampaignsProvider');
  return ctx;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const liveKeys = { list: ['message-campaigns'] as const };

/**
 * Live store: campaigns are saved to `/campaigns`. The builder works with a
 * local id until the first save returns the server id; `aliases` maps one to
 * the other so the builder and detail screens keep working mid-flight, and
 * saves for one campaign run in order.
 */
export function LiveCampaignsProvider({ branchId, children }: { branchId?: string; children: ReactNode }) {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: liveKeys.list, queryFn: messageCampaignsService.list });
  const [pending, setPending] = useState<Record<string, CampaignRecord>>({});
  const aliases = useRef(new Map<string, string>());
  const chains = useRef(new Map<string, Promise<unknown>>());
  const [error, setError] = useState<string | null>(null);

  const canonical = useCallback((id: string) => aliases.current.get(id) ?? id, []);

  const campaigns = useMemo(() => {
    const server = list.data ?? [];
    const merged = server.map((entry) => pending[entry.id] ?? entry);
    const unsaved = Object.values(pending).filter((entry) => !server.some((s) => s.id === entry.id));
    return [...unsaved, ...merged].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [list.data, pending]);

  const settle = useCallback(
    (id: string) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.list }).then(() =>
        setPending((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        }),
      );
    },
    [queryClient],
  );

  /** Runs saves for one campaign one after another. */
  const enqueue = useCallback((key: string, task: () => Promise<unknown>) => {
    const run = (chains.current.get(key) ?? Promise.resolve()).then(task, task);
    chains.current.set(key, run.catch(() => undefined));
    return run;
  }, []);

  /** Saves `record` as given, creating it on first save; returns the server id. */
  const save = useCallback(
    async (localId: string, record: CampaignRecord) => {
      const id = canonical(localId);
      if (UUID.test(id)) {
        await messageCampaignsService.update(id, { ...record, id });
        return id;
      }
      if (!branchId) throw new Error('Choose a branch before saving a campaign.');
      const created = await messageCampaignsService.create({ ...record, id }, branchId);
      aliases.current.set(localId, created.id);
      return created.id;
    },
    [branchId, canonical],
  );

  const upsertCampaign = useCallback(
    (campaign: CampaignRecord) => {
      const localId = campaign.id;
      const shown = { ...campaign, id: canonical(localId) };
      setPending((current) => ({ ...current, [shown.id]: shown }));
      setError(null);
      void enqueue(localId, async () => {
        const id = await save(localId, campaign);
        if (id !== shown.id)
          setPending((current) => {
            const next = { ...current, [id]: { ...campaign, id } };
            delete next[shown.id];
            return next;
          });
        settle(id);
      }).catch((e: unknown) => setError(apiErrorMessage(e, 'Could not save the campaign.')));
    },
    [canonical, enqueue, save, settle],
  );

  const send = useCallback(
    (campaign: CampaignRecord, customerIds: string[]) => {
      const localId = campaign.id;
      // The server only sends a draft or scheduled campaign, so save it as one.
      const saved: CampaignRecord = { ...campaign, status: campaign.status === 'scheduled' ? 'scheduled' : 'draft' };
      setError(null);
      return enqueue(localId, async () => {
        const id = await save(localId, saved);
        const result = await messageCampaignsService.send(id, customerIds, campaign.channel === 'email' ? campaign.emailSubject : undefined);
        // Keep the builder's audience details and history; take status and counts from the server.
        const merged: CampaignRecord = { ...campaign, ...(result ?? {}), id, audience: campaign.audience, history: campaign.history };
        setPending((current) => {
          const next = { ...current, [id]: merged };
          if (id !== localId) delete next[localId];
          return next;
        });
        settle(id);
        return merged;
      }).catch((e: unknown) => {
        setPending((current) => {
          const next = { ...current };
          delete next[localId];
          delete next[canonical(localId)];
          return next;
        });
        void queryClient.invalidateQueries({ queryKey: liveKeys.list });
        throw e;
      }) as Promise<CampaignRecord>;
    },
    [canonical, enqueue, queryClient, save, settle],
  );

  const deleteCampaign = useCallback(
    (id: string) => {
      const target = canonical(id);
      queryClient.setQueryData<CampaignRecord[]>(liveKeys.list, (rows) => rows?.filter((row) => row.id !== target));
      setPending((current) => {
        const next = { ...current };
        delete next[target];
        return next;
      });
      if (UUID.test(target))
        void enqueue(id, () => messageCampaignsService.remove(target))
          .catch((e: unknown) => setError(apiErrorMessage(e, 'Could not delete the campaign.')))
          .finally(() => void queryClient.invalidateQueries({ queryKey: liveKeys.list }));
    },
    [canonical, enqueue, queryClient],
  );

  const findCampaign = useCallback((id: string) => campaigns.find((entry) => entry.id === canonical(id)), [campaigns, canonical]);

  const duplicateCampaignById = useCallback(
    (id: string) => {
      const source = findCampaign(id);
      if (!source) return undefined;
      const copy = duplicateCampaign(source);
      upsertCampaign(copy);
      return copy;
    },
    [findCampaign, upsertCampaign],
  );

  const cancelScheduledCampaign = useCallback(
    (id: string) => {
      const entry = findCampaign(id);
      if (!entry || entry.status !== 'scheduled') return;
      upsertCampaign({
        ...entry,
        status: 'draft',
        scheduledAt: undefined,
        updatedAt: Date.now(),
        history: [...entry.history, { at: Date.now(), kind: 'cancelled', label: 'Schedule cancelled — returned to drafts' }],
      });
    },
    [findCampaign, upsertCampaign],
  );

  const listForChannel = useCallback((channel: CampaignChannel) => campaigns.filter((entry) => entry.channel === channel), [campaigns]);

  const value = useMemo<CampaignsContextValue>(
    () => ({
      campaigns,
      listForChannel,
      findCampaign,
      upsertCampaign,
      deleteCampaign,
      duplicateCampaignById,
      cancelScheduledCampaign,
      resetCampaigns: () => undefined,
      live: {
        isLoading: list.isLoading,
        error: error ?? (list.isError ? apiErrorMessage(list.error, 'Could not load campaigns.') : null),
        retry: () => {
          setError(null);
          void list.refetch();
        },
        send,
      },
    }),
    [campaigns, listForChannel, findCampaign, upsertCampaign, deleteCampaign, duplicateCampaignById, cancelScheduledCampaign, list, error, send],
  );

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}
