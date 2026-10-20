import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
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
