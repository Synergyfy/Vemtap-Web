import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
