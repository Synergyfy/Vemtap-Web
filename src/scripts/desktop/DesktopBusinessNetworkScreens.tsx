import { DesktopBusinessPage } from './DesktopBusinessPage';
import { NetworkDashboardPanel, type NetworkNav } from '../../components/business/network/NetworkDashboardPanel';
import { NetworkMilestonesPanel } from '../../components/business/network/NetworkMilestonesPanel';
import { ReferralsPanel } from '../../components/business/network/ReferralsPanel';
import { ReferralDetailPanel } from '../../components/business/network/ReferralDetailPanel';
import { DiscoveryPresencePanel } from '../../components/business/network/DiscoveryPresencePanel';

type OnNav = (key: string) => void;

const networkCrumb = (onNav: OnNav) => ({ label: 'Business Network', onClick: () => onNav('network-dashboard') });

export function DesktopBusinessNetworkDashboardScreen({ onNav, nav }: { onNav: OnNav; nav: NetworkNav }) {
  return (
    <DesktopBusinessPage
      activeNav="network-dashboard"
      onNav={onNav}
      crumbs={[{ label: 'Business Network' }]}
      title="Business Network"
      subtitle="Invite businesses to VemTap, track their verification and climb the milestone ladder."
    >
      <NetworkDashboardPanel nav={nav} />
    </DesktopBusinessPage>
  );
}

export function DesktopBusinessNetworkMilestonesScreen({ onNav }: { onNav: OnNav }) {
  return (
    <DesktopBusinessPage activeNav="network-milestones" onNav={onNav} crumbs={[networkCrumb(onNav), { label: 'Milestones' }]} title="Network Milestones">
      <NetworkMilestonesPanel />
    </DesktopBusinessPage>
  );
}

export function DesktopBusinessReferralsScreen({ onNav, onOpenReferral }: { onNav: OnNav; onOpenReferral: (id: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="network-referrals"
      onNav={onNav}
      crumbs={[networkCrumb(onNav), { label: 'My Referrals' }]}
      title="My Referrals"
      subtitle="Businesses that signed up with your code."
    >
      <ReferralsPanel onOpenReferral={onOpenReferral} />
    </DesktopBusinessPage>
  );
}

export function DesktopBusinessReferralDetailScreen({ onNav, referralId }: { onNav: OnNav; referralId: string | null }) {
  return (
    <DesktopBusinessPage
      activeNav="network-referrals"
      onNav={onNav}
      crumbs={[networkCrumb(onNav), { label: 'My Referrals', onClick: () => onNav('network-referrals') }, { label: 'Referral' }]}
      title="Referral Detail"
    >
      <ReferralDetailPanel referralId={referralId} />
    </DesktopBusinessPage>
  );
}

export function DesktopBusinessDiscoveryPresenceScreen({ onNav }: { onNav: OnNav }) {
  return (
    <DesktopBusinessPage
      activeNav="network-discovery"
      onNav={onNav}
      crumbs={[networkCrumb(onNav), { label: 'Discovery Presence' }]}
      title="Discovery Presence"
      subtitle="How customers find you in the VemTap discovery feed."
    >
      <DiscoveryPresencePanel />
    </DesktopBusinessPage>
  );
}
