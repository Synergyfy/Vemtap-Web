import { useState } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useCampaigns } from '../../context/CampaignsContext';
import type { BusinessTabKey } from '../../components/BusinessTabBar';
import { CampaignsDashboardScreen } from './CampaignsDashboardScreen';
import { CampaignBuilderScreen } from './CampaignBuilderScreen';
import { CampaignDetailScreen } from './CampaignDetailScreen';
import { formatDateTime, type CampaignChannel, type CampaignRecord } from './campaignsData';

export interface CampaignsChannelScreenProps {
  channel: CampaignChannel;
  onNav: (key: string) => void;
  onTab: (tab: BusinessTabKey) => void;
}

type ChannelView = 'dashboard' | 'builder' | 'detail';

/**
 * Messages → SMS/Email.
 *
 * Keeps the three campaign screens (dashboard, builder, results) inside the
 * channel route, exactly as the guidance asks: few screens, no extra routing.
 */
export function CampaignsChannelScreen({ channel, onNav, onTab }: CampaignsChannelScreenProps) {
  const isDesktop = useIsDesktop();
  const { findCampaign, deleteCampaign, duplicateCampaignById, cancelScheduledCampaign } = useCampaigns();

  const [view, setView] = useState<ChannelView>('dashboard');
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [banner, setBanner] = useState<string | null>(null);

  const activeCampaign = activeId ? findCampaign(activeId) : undefined;
  const editingCampaign = editingId ? findCampaign(editingId) : undefined;

  const goDashboard = () => {
    setView('dashboard');
    setBanner(null);
    setEditingId(undefined);
  };

  const openCampaign = (id: string) => {
    setActiveId(id);
    setBanner(null);
    setView('detail');
  };

  const editCampaign = (id: string) => {
    const campaign = findCampaign(id);
    if (!campaign) return;
    if (campaign.status === 'draft') {
      setEditingId(id);
      setActiveId(id);
      setBanner(null);
      setView('builder');
      return;
    }
    // Completed campaigns are immutable — edit a copy instead.
    const copy = duplicateCampaignById(id);
    if (copy) {
      setEditingId(copy.id);
      setActiveId(copy.id);
      setBanner('Duplicated — you are editing a new copy. The original stays unchanged.');
      setView('builder');
    }
  };

  const duplicate = (id: string) => {
    const copy = duplicateCampaignById(id);
    if (!copy) return;
    setEditingId(copy.id);
    setActiveId(copy.id);
    setBanner('Duplicated — review the copy, then send or schedule it.');
    setView('builder');
  };

  const cancelScheduled = (id: string) => {
    cancelScheduledCampaign(id);
    setActiveId(id);
  };

  const removeDraft = (id: string) => {
    deleteCampaign(id);
    if (activeId === id) goDashboard();
  };

  const handleCompleted = (campaign: CampaignRecord) => {
    setActiveId(campaign.id);
    setEditingId(undefined);
    setBanner(
      campaign.status === 'scheduled' && campaign.scheduledAt
        ? `Campaign scheduled for ${formatDateTime(campaign.scheduledAt)}.`
        : 'Campaign queued for sending (demonstration only — no provider is connected).',
    );
    setView('detail');
    window.scrollTo({ top: 0 });
  };

  if (view === 'builder') {
    return (
      <CampaignBuilderScreen
        key={editingId ?? `new-${channel}`}
        channel={channel}
        isDesktop={isDesktop}
        onNav={onNav}
        onTab={onTab}
        initial={editingCampaign}
        onExit={goDashboard}
        onCompleted={handleCompleted}
      />
    );
  }

  if (view === 'detail' && activeCampaign) {
    return (
      <CampaignDetailScreen
        campaign={activeCampaign}
        isDesktop={isDesktop}
        onNav={onNav}
        onTab={onTab}
        onBack={goDashboard}
        onEditDraft={editCampaign}
        onDuplicate={duplicate}
        onCancelScheduled={cancelScheduled}
        banner={banner}
      />
    );
  }

  return (
    <CampaignsDashboardScreen
      channel={channel}
      isDesktop={isDesktop}
      onNav={onNav}
      onTab={onTab}
      onCreate={() => {
        setEditingId(undefined);
        setActiveId(undefined);
        setBanner(null);
        setView('builder');
      }}
      onOpenCampaign={openCampaign}
      onDuplicate={duplicate}
      onCancelScheduled={cancelScheduled}
      onDeleteDraft={removeDraft}
    />
  );
}

