import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { NetworkDashboardPanel, type NetworkNav } from '../components/business/network/NetworkDashboardPanel';
import { NetworkMilestonesPanel } from '../components/business/network/NetworkMilestonesPanel';
import { ReferralsPanel } from '../components/business/network/ReferralsPanel';
import { ReferralDetailPanel } from '../components/business/network/ReferralDetailPanel';
import { DiscoveryPresencePanel } from '../components/business/network/DiscoveryPresencePanel';

export function BusinessNetworkDashboardScreen({ onBack, nav }: { onBack: () => void; nav: NetworkNav }) {
  return (
    <BusinessSubScreen title="Business Network" onBack={onBack}>
      <NetworkDashboardPanel nav={nav} />
    </BusinessSubScreen>
  );
}

export function BusinessNetworkMilestonesScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Network Milestones" onBack={onBack}>
      <NetworkMilestonesPanel />
    </BusinessSubScreen>
  );
}

export function BusinessReferralsScreen({ onBack, onOpenReferral }: { onBack: () => void; onOpenReferral: (id: string) => void }) {
  return (
    <BusinessSubScreen title="My Referrals" onBack={onBack}>
      <ReferralsPanel onOpenReferral={onOpenReferral} />
    </BusinessSubScreen>
  );
}

export function BusinessReferralDetailScreen({ onBack, referralId }: { onBack: () => void; referralId: string | null }) {
  return (
    <BusinessSubScreen title="Referral" onBack={onBack}>
      <ReferralDetailPanel referralId={referralId} />
    </BusinessSubScreen>
  );
}

export function BusinessDiscoveryPresenceScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Discovery Presence" onBack={onBack}>
      <DiscoveryPresencePanel />
    </BusinessSubScreen>
  );
}
