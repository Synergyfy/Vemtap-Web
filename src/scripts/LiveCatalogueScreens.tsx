import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { BranchPricingPanel } from '../components/business/BranchPricingPanel';
import { DealDetailPanel } from '../components/business/DealDetailPanel';
import { EmptyState } from '../components/business/QueryStates';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

interface DealDetailProps {
  /** Null when the page was opened without picking a deal (e.g. a direct link). */
  dealGroupId: string | null;
  onOpenLedger?: () => void;
  onBoost?: (name: string) => void;
}

/** Live deal performance — mobile. */
function DealBody({ dealGroupId, ...props }: DealDetailProps) {
  return dealGroupId ? (
    <DealDetailPanel dealGroupId={dealGroupId} {...props} />
  ) : (
    <EmptyState icon="local_offer" title="Pick a deal" body="Open Details on any deal to see how it is doing." />
  );
}

export function LiveDealDetailScreen({ onBack, ...props }: DealDetailProps & { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Deal performance" onBack={onBack}>
      <DealBody {...props} />
    </BusinessSubScreen>
  );
}

/** Live deal performance — desktop. */
export function DesktopLiveDealDetailScreen({ onNav, onBack, ...props }: DealDetailProps & { onNav: (key: string) => void; onBack: () => void }) {
  return (
    <DesktopBusinessPage activeNav="business-deals" onNav={onNav} crumbs={[{ label: 'Deals', onClick: onBack }, { label: 'Performance' }]} title="Deal performance">
      <DealBody {...props} />
    </DesktopBusinessPage>
  );
}

/** Live branch pricing — mobile. */
export function LiveBranchPricingScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Branch pricing" onBack={onBack}>
      <BranchPricingPanel />
    </BusinessSubScreen>
  );
}

/** Live branch pricing — desktop. */
export function DesktopLiveBranchPricingScreen({ onNav, onBack }: { onNav: (key: string) => void; onBack: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="business-catalog"
      onNav={onNav}
      crumbs={[{ label: 'Catalogue', onClick: onBack }, { label: 'Branch pricing' }]}
      title="Branch pricing"
      subtitle="Where each item sells and what it costs at every branch."
    >
      <BranchPricingPanel />
    </DesktopBusinessPage>
  );
}
