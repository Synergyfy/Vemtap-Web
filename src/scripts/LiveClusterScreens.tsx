import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { ClusterSystemPanel } from '../components/business/ClusterPanels';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

/** Live cluster system (detect / join / propose, members, chat, showcase) — mobile. */
export function LiveClusterScreen({ onBack, onCreateDeal }: { onBack: () => void; onCreateDeal?: () => void }) {
  return (
    <BusinessSubScreen title="Cluster" onBack={onBack}>
      <ClusterSystemPanel onCreateDeal={onCreateDeal} />
    </BusinessSubScreen>
  );
}

/** Live cluster system — desktop. */
export function DesktopLiveClusterScreen({ onNav, onCreateDeal }: { onNav: (key: string) => void; onCreateDeal?: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="cluster-system"
      onNav={onNav}
      crumbs={[{ label: 'Cluster' }]}
      title="Cluster"
      subtitle="Your mall, plaza or market on VEMTAP: neighbours, shared QR and what you show there."
    >
      <ClusterSystemPanel onCreateDeal={onCreateDeal} />
    </DesktopBusinessPage>
  );
}
