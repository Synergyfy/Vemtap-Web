import { BoostTabBar, type BoostTabKey } from '../components/BoostTabBar';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { CampaignsPanel, QuickBoostPanel, WalletPanel } from '../components/business/GrowthPanels';
import { LoyaltyPanel } from '../components/business/LoyaltyPanel';
import { SegmentsPanel } from '../components/business/SegmentsPanel';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

/** Live segments — mobile. */
export function LiveSegmentsScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Segments" onBack={onBack}>
      <SegmentsPanel />
    </BusinessSubScreen>
  );
}

/** Live segments — desktop. */
export function DesktopLiveSegmentsScreen({ onNav, onBack }: { onNav: (key: string) => void; onBack: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="business-customers"
      onNav={onNav}
      crumbs={[{ label: 'Growth', onClick: onBack }, { label: 'Segments' }]}
      title="Segments"
      subtitle="Build audiences from visits, spend and loyalty."
    >
      <SegmentsPanel />
    </DesktopBusinessPage>
  );
}

/** Live loyalty programme — mobile. */
export function LiveLoyaltyScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Loyalty programme" onBack={onBack}>
      <LoyaltyPanel />
    </BusinessSubScreen>
  );
}

/** Live loyalty programme — desktop. */
export function DesktopLiveLoyaltyScreen({ onNav }: { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="business-loyalty"
      onNav={onNav}
      crumbs={[{ label: 'Loyalty' }]}
      title="Loyalty programme"
      subtitle="How customers earn points and what they can spend them on."
    >
      <LoyaltyPanel />
    </DesktopBusinessPage>
  );
}

interface GrowthNav {
  onBoost: () => void;
  onCreateCampaign: () => void;
  onOpenWallet: () => void;
}

/** Live boosts & campaigns — mobile. */
export function LiveBoostHubScreen({ onBack, onTab, ...nav }: GrowthNav & { onBack: () => void; onTab: (tab: BoostTabKey) => void }) {
  return (
    <BusinessSubScreen title="Boosts & campaigns" onBack={onBack}>
      <CampaignsPanel {...nav} />
      <BoostTabBar active="overview" onTab={onTab} />
    </BusinessSubScreen>
  );
}

/** Live boosts & campaigns — desktop. */
export function DesktopLiveBoostHubScreen({ onNav, ...nav }: GrowthNav & { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-marketing"
      onNav={onNav}
      crumbs={[{ label: 'Growth' }]}
      title="Boosts & campaigns"
      subtitle="Reach more customers nearby, paid from your ad wallet."
    >
      <CampaignsPanel {...nav} />
    </DesktopBusinessPage>
  );
}

/** Live quick boost — mobile. */
export function LiveBoostStudioScreen({ onBack, onDone, onOpenWallet }: { onBack: () => void; onDone: () => void; onOpenWallet: () => void }) {
  return (
    <BusinessSubScreen title="Boost" onBack={onBack}>
      <QuickBoostPanel onDone={onDone} onOpenWallet={onOpenWallet} />
    </BusinessSubScreen>
  );
}

/** Live quick boost — desktop. */
export function DesktopLiveBoostStudioScreen({ onNav, onBack, onDone, onOpenWallet }: { onNav: (key: string) => void; onBack: () => void; onDone: () => void; onOpenWallet: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-marketing"
      onNav={onNav}
      crumbs={[{ label: 'Growth', onClick: onBack }, { label: 'New boost' }]}
      title="Boost"
      subtitle="Push one thing to people near your branch."
    >
      <QuickBoostPanel onDone={onDone} onOpenWallet={onOpenWallet} />
    </DesktopBusinessPage>
  );
}

/** Live ad wallet — mobile. */
export function LiveWalletScreen({ onBack, onTab }: { onBack: () => void; onTab: (tab: BoostTabKey) => void }) {
  return (
    <BusinessSubScreen title="Ad wallet" onBack={onBack}>
      <WalletPanel />
      <BoostTabBar active="wallet" onTab={onTab} />
    </BusinessSubScreen>
  );
}

/** Live ad wallet — desktop. */
export function DesktopLiveWalletScreen({ onNav, onBack }: { onNav: (key: string) => void; onBack: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-marketing"
      onNav={onNav}
      crumbs={[{ label: 'Growth', onClick: onBack }, { label: 'Ad wallet' }]}
      title="Ad wallet"
      subtitle="Prepaid balance for boosts and campaigns."
    >
      <WalletPanel />
    </DesktopBusinessPage>
  );
}
